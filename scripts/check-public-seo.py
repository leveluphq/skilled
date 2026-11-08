#!/usr/bin/env python3
"""Read-only, anonymous checks against this checkout's complete public inventory."""
import argparse
from concurrent.futures import ThreadPoolExecutor
from collections import Counter
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import sys
from urllib.error import HTTPError, URLError
from urllib.parse import urljoin, urlsplit, unquote
from urllib.request import Request, HTTPRedirectHandler, build_opener
from urllib.robotparser import RobotFileParser
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / 'src/content/resources'
MAX_BYTES = 4 * 1024 * 1024
OVERVIEWS = json.loads((CONTENT / 'lesson-overviews.json').read_text())
COURSE = json.loads((CONTENT / 'course.json').read_text())
LANGUAGE_POLICY = json.loads((CONTENT.parent / 'lesson-walkthroughs/coverage.json').read_text())
LESSON_LANGUAGES = {entry['lesson']: entry['languages'] for entry in LANGUAGE_POLICY}
READINGS = json.loads((CONTENT.parent / 'lesson-walkthroughs/catalog.json').read_text())


def normalize(text):
    return re.sub(r'\s+', ' ', text).strip()


def prose_marker(source):
    source = re.sub(r'<!--[\s\S]*?-->', '', source)
    source = re.sub(r'\{/\*[\s\S]*?\*/\}', '', source)
    paragraph = source.strip().split('\n\n', 1)[0]
    paragraph = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', paragraph)
    paragraph = re.sub(r'</?[A-Za-z][^>]*>', '', paragraph)
    paragraph = paragraph.replace('`', '').replace('**', '')
    return normalize(paragraph)[:140].rsplit(' ', 1)[0]


def ending_prose_marker(source):
    prose = re.sub(r'^```[^\n]*\n.*?^```\s*$', '', source, flags=re.M | re.S)
    for paragraph in reversed(prose.split('\n\n')):
        paragraph = paragraph.strip()
        if not paragraph or paragraph.startswith(('#', '<', '- ', '* ')):
            continue
        paragraph = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', paragraph)
        text = normalize(paragraph.replace('`', '').replace('**', ''))
        if len(text) >= 80:
            return text[-140:].split(' ', 1)[-1]
    return prose_marker(source)


class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.head = self.title = self.heading = self.json_script = False
        self.article_depth = 0
        self.titles = 0
        self.h1s = 0
        self.title_text = []
        self.heading_text = []
        self.article_text = []
        self.canonicals = []
        self.descriptions = []
        self.robots = []
        self.links = []
        self.anchors = []
        self.ids = []
        self.navigations = []
        self.nav_stack = []
        self.iframes = []
        self.images = []
        self.structured = []
        self.json_errors = []
        self.json_buffer = []
        self.overview_depth = 0
        self.overview_text = []

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if attrs.get('id'):
            self.ids.append(attrs['id'])
        if tag == 'nav':
            nav = {'label': attrs.get('aria-label', ''), 'links': []}
            self.navigations.append(nav)
            self.nav_stack.append(nav)
        self.anchors.extend(set(filter(None, [attrs.get('id'), attrs.get('name') if tag == 'a' else None])))
        if tag == 'section' and (self.overview_depth or attrs.get('aria-label') == 'Approach and test strategy'):
            self.overview_depth += 1
        if tag == 'head':
            self.head = True
        if tag == 'title' and self.head:
            self.title = True
            self.titles += 1
        if tag == 'h1':
            self.heading = True
            self.h1s += 1
        if tag == 'article':
            self.article_depth += 1
        if tag == 'link' and 'canonical' in attrs.get('rel', '').split():
            self.canonicals.append(attrs.get('href'))
        if tag == 'meta' and self.head:
            name = attrs.get('name', '').lower()
            if name == 'description':
                self.descriptions.append(attrs.get('content', ''))
            if name in ('robots', 'googlebot'):
                self.robots.append(attrs.get('content', ''))
        if tag == 'a' and attrs.get('href'):
            self.links.append(attrs['href'])
            for nav in self.nav_stack:
                nav['links'].append(attrs['href'])
        if tag == 'iframe':
            self.iframes.append(attrs)
        if tag == 'img':
            self.images.append(attrs)
        if tag == 'script' and attrs.get('type') == 'application/ld+json':
            self.json_script = True
            self.json_buffer = []

    def handle_endtag(self, tag):
        if tag == 'nav' and self.nav_stack:
            self.nav_stack.pop()
        if tag == 'section' and self.overview_depth:
            self.overview_depth -= 1
        if tag == 'head':
            self.head = False
        if tag == 'title':
            self.title = False
        if tag == 'h1':
            self.heading = False
        if tag == 'article':
            self.article_depth -= 1
        if tag == 'script' and self.json_script:
            try:
                self.structured.append(json.loads(''.join(self.json_buffer)))
            except json.JSONDecodeError as error:
                self.json_errors.append(str(error))
            self.json_script = False

    def handle_data(self, data):
        if self.overview_depth:
            self.overview_text.append(data)
        if self.title:
            self.title_text.append(data)
        if self.heading:
            self.heading_text.append(data)
        if self.article_depth > 0:
            self.article_text.append(data)
        if self.json_script:
            self.json_buffer.append(data)


def entities(value):
    if isinstance(value, list):
        return [entity for item in value for entity in entities(item)]
    if isinstance(value, dict):
        return entities(value['@graph']) if '@graph' in value else [value]
    return []


def has_type(entity, name):
    types = entity.get('@type', [])
    return name in (types if isinstance(types, list) else [types])


def origin(value):
    parsed = urlsplit(value)
    if parsed.scheme not in ('http', 'https') or not parsed.hostname or parsed.username or parsed.password:
        raise argparse.ArgumentTypeError('Use an absolute HTTP(S) origin without credentials.')
    if parsed.path not in ('', '/') or parsed.query or parsed.fragment:
        raise argparse.ArgumentTypeError('Use an origin without a path, query, or fragment.')
    return f'{parsed.scheme}://{parsed.netloc}'


class AuditRedirects(HTTPRedirectHandler):
    # Python 3.9's default handler does not recognize Next.js's permanent 308.
    def redirect_request(self, request, fp, code, message, headers, new_url):
        return super().redirect_request(request, fp, 307 if code == 308 else code, message, headers, new_url)

    http_error_308 = HTTPRedirectHandler.http_error_302


def fetch(url, timeout):
    request = Request(url, headers={'User-Agent': 'SkilledPublicSEOAudit/1.0'})
    try:
        response = build_opener(AuditRedirects()).open(request, timeout=timeout)
    except HTTPError as error:
        response = error
    with response:
        data = response.read(MAX_BYTES + 1)
        if len(data) > MAX_BYTES:
            raise ValueError('Response exceeds the 4 MiB audit limit.')
        return response.status, response.headers, data.decode('utf-8', errors='replace'), response.geturl()


def inspect_page(path, base, canonical, resource, timeout, expect_noindex):
    result = {'path': path, 'issues': [], 'links': [], 'resourceBody': False}
    try:
        status, headers, body, final_url = fetch(base + path, timeout)
        result['status'] = status
        if status != 200:
            result['issues'].append(f'HTTP {status}; expected 200')
            return result
        if urlsplit(final_url).path != path:
            result['issues'].append(f'Redirected to {urlsplit(final_url).path}')
        if 'text/html' not in headers.get('Content-Type', ''):
            result['issues'].append('Expected HTML content type')
        page = Page()
        page.feed(body)
        result['links'] = page.links
        result['anchors'] = page.anchors
        duplicates = sorted(name for name, count in Counter(page.ids).items() if count > 1)
        if duplicates:
            result['issues'].append('Duplicate HTML IDs: ' + ', '.join(duplicates[:8]))
        else:
            result['uniqueIds'] = len(page.ids)
        contextual = inspect_contextual_links(path, page, resource)
        result['issues'].extend(contextual.pop('issues'))
        result.update(contextual)
        if any('alt' not in item for item in page.images):
            result['issues'].append('Image alternative text is missing')
        else:
            result['imageAlternatives'] = len(page.images)
        if page.titles != 1 or not normalize(''.join(page.title_text)):
            result['issues'].append('Expected one nonempty head title')
        if page.h1s != 1:
            result['issues'].append(f'Expected one H1, found {page.h1s}')
        if len(page.descriptions) != 1 or not page.descriptions[0].strip():
            result['issues'].append('Expected one nonempty description')
        if page.canonicals != [canonical + path]:
            result['issues'].append(f'Canonical mismatch: {page.canonicals}')
        directives = ','.join(page.robots + [headers.get('X-Robots-Tag', '')]).lower()
        noindex = bool(re.search(r'\b(noindex|none)\b', directives))
        if noindex != expect_noindex:
            result['issues'].append('Unexpected noindex' if noindex else 'Expected noindex on preview')
        graph = entities(page.structured)
        if page.json_errors or not graph:
            result['issues'].append('Missing or malformed JSON-LD')
        slug = path.removeprefix('/course/') if path.startswith('/course/') else ''
        if slug in OVERVIEWS:
            overview = OVERVIEWS[slug]
            visible = normalize(''.join(page.overview_text))
            parts = [overview['focus'], overview['approach'], overview['cost'], *overview['checks']]
            if any(normalize(part) not in visible for part in parts):
                result['issues'].append('Public lesson approach, checks, or cost model absent from initial HTML')
            else:
                result['lessonOverview'] = True
        if slug in LESSON_LANGUAGES:
            own = [item for item in graph if item.get('url') == canonical + path and has_type(item, 'LearningResource')]
            subjects = own[0].get('about', []) if own else []
            wanted = {canonical + '/interview-prep/' + language for language in LESSON_LANGUAGES[slug]}
            actual = {item.get('url') for item in subjects if isinstance(item, dict) and has_type(item, 'ComputerLanguage')}
            if actual != wanted or not own or (slug in OVERVIEWS and own[0].get('teaches') != OVERVIEWS[slug]['focus']):
                result['issues'].append('Lesson subjects or teaches do not match public content')
            if any('/interview-prep/' + language not in page.links for language in LESSON_LANGUAGES[slug]):
                result['issues'].append('Missing lesson programming-language preparation links')
            readings = {'/course/' + slug + '/' + language for language in LESSON_LANGUAGES[slug]}
            declared = {item.get('url') for item in own[0].get('hasPart', [])} if own else set()
            if declared != {canonical + link for link in readings} or not readings.issubset(set(page.links)):
                result['issues'].append('Missing lesson language reading links or membership metadata')
            else:
                result['lessonLanguageLinks'] = True
        if path == '/course':
            lesson_links = {'/course/' + lesson['slug'] for lesson in COURSE['lessons']}
            categories = {category['slug'] for category in COURSE['categories']}
            if not lesson_links.issubset(set(page.links)) or not categories.issubset(set(page.anchors)):
                result['issues'].append('Published course lessons or category targets absent from initial HTML')
            else:
                result['courseCatalog'] = True
            own_course = [item for item in graph if has_type(item, 'Course')]
            declared_lessons = {part.get('url') for item in own_course for part in item.get('hasPart', []) if has_type(part, 'LearningResource')}
            if not {canonical + link for link in lesson_links}.issubset(declared_lessons):
                result['issues'].append('Course structured data omits published lessons')
        if resource:
            if normalize(''.join(page.heading_text)) != normalize(resource['title']):
                result['issues'].append('Resource H1 does not match published title')
            source = ((CONTENT.parent / 'videos' / (resource['slug'] + '.mdx')) if resource.get('videoId') else
                      ((CONTENT.parent / 'lesson-walkthroughs' / resource['lesson'] / (resource['language'] + '.mdx'))
                      if resource.get('lesson') else (CONTENT / resource['section'] / (resource['slug'] + '.mdx')))).read_text()
            article = normalize(''.join(page.article_text))
            if not prose_marker(source) or prose_marker(source) not in article or ending_prose_marker(source) not in article:
                result['issues'].append('Published article opening or ending is absent from initial HTML')
            else:
                result['resourceBody'] = True
            own = [item for item in graph if item.get('url') == canonical + path]
            if not own or own[0].get('isAccessibleForFree') is not True:
                result['issues'].append('Missing public resource entity/free-access metadata')
            if resource.get('images'):
                expected_images = {canonical + image for image in resource['images']}
                if not own or set(own[0].get('image', [])) != expected_images:
                    result['issues'].append('Article image metadata differs from visible image catalog')
                for image in resource['images']:
                    if not any(item.get('src') == image and item.get('alt', '').strip() for item in page.images):
                        result['issues'].append('Catalog image or descriptive alternative is absent from initial HTML')
                    image_status, image_headers, _, _ = fetch(base + image, timeout)
                    if image_status != 200 or not image_headers.get('Content-Type', '').startswith('image/'):
                        result['issues'].append('Article image is not publicly accessible')
            if resource.get('videoId'):
                video = next((item for item in own if has_type(item, 'VideoObject')), {})
                embed = 'https://www.youtube-nocookie.com/embed/' + resource['videoId']
                if (video.get('embedUrl') != embed or video.get('uploadDate') != resource['uploadDate'] or
                    video.get('duration') != f"PT{resource['durationSeconds']}S" or
                    video.get('thumbnailUrl') != canonical + '/images/videos/' + resource['slug'] + '.jpg'):
                    result['issues'].append('Video metadata differs from verified public catalog')
                if not any(frame.get('src', '').startswith(embed + '?') and frame.get('title') == resource['title'] for frame in page.iframes):
                    result['issues'].append('Primary video iframe is missing from initial HTML')
                if any('autoplay=1' in frame.get('src', '') for frame in page.iframes):
                    result['issues'].append('Unexpected automatic video playback')
                clips = [{'@type': 'Clip', 'name': chapter['name'], 'startOffset': chapter['start'],
                          'endOffset': chapter['end'], 'url': canonical + path + '?t=' + str(chapter['start'])}
                         for chapter in resource['chapters']]
                chapter_links = {path + '?t=' + str(chapter['start']) for chapter in resource['chapters']}
                if video.get('hasPart') != clips or not chapter_links.issubset(set(page.links)):
                    result['issues'].append('Video chapter links or Clip metadata differ from reviewed chapters')
                else:
                    result['videoClips'] = len(clips)
                image_status, image_headers, _, _ = fetch(base + '/images/videos/' + resource['slug'] + '.jpg', timeout)
                if image_status != 200 or not image_headers.get('Content-Type', '').startswith('image/'):
                    result['issues'].append('Video thumbnail is not publicly accessible')
            if resource.get('language') and own:
                subject = own[0].get('about', {})
                if not has_type(subject, 'ComputerLanguage') or not subject.get('name') or subject.get('url') != canonical + '/interview-prep/' + resource['language']:
                    result['issues'].append('Missing or incorrect programming-language subject')
                if own[0].get('inLanguage') != 'en':
                    result['issues'].append('Programming language was confused with prose language')
        if path == '/interview-prep':
            collections = [item for item in graph if has_type(item, 'CollectionPage')]
            subjects = collections[0].get('about', []) if collections else []
            result['languageSubjects'] = [item.get('url') for item in subjects if isinstance(item, dict) and has_type(item, 'ComputerLanguage')]
            members = [item.get('url') for item in collections[0].get('hasPart', [])] if collections else []
            if len(members) != len(set(members)):
                result['issues'].append('Language-index membership repeats a destination')
    except (OSError, ValueError, URLError) as error:
        result['issues'].append(str(error))
    return result


def inspect_contextual_links(path, page, resource):
    """Check contextual navigation independently against published course order."""
    result = {'issues': []}
    if not resource:
        return result
    def nav_links(label):
        return [link for nav in page.navigations if nav['label'] == label for link in nav['links']]
    if resource.get('videoId'):
        expected = {'/course/' + resource['slug'] + '/' + item['language']
                    for item in READINGS if item['lesson'] == resource['slug']}
        actual = nav_links('Video lesson programming-language walkthroughs')
        if set(actual) != expected or len(actual) != len(expected):
            result['issues'].append('Video reading links differ from published language companions')
        else:
            result['watchReadingLinks'] = len(expected)
    elif resource.get('lesson'):
        lesson = next(item for item in COURSE['lessons'] if item['slug'] == resource['lesson'])
        available = {item['lesson']: item for item in READINGS if item['language'] == resource['language']}
        sequence = [item['slug'] for item in sorted(COURSE['lessons'], key=lambda item: item['position'])
                    if item['category'] == lesson['category'] and item['slug'] in available]
        index = sequence.index(lesson['slug'])
        neighbors = sequence[max(0, index - 1):index] + sequence[index + 1:index + 2]
        expected = ['/course/' + slug + '/' + resource['language'] for slug in neighbors]
        actual = [link for nav in page.navigations if nav['label'].endswith(' reading sequence') for link in nav['links']]
        if actual != expected:
            result['issues'].append('Reading sequence does not follow this language and topic in course order')
        else:
            result['readingSequencePage'] = True
            result['readingSequenceLinks'] = len(expected)
    elif resource.get('language'):
        expected = {'/course/' + item['lesson'] + '/' + resource['language'] for item in READINGS
                    if item['lesson'] in resource.get('lessons', []) and item['language'] == resource['language']}
        actual = set(nav_links('Course lessons and language walkthroughs'))
        if not expected.issubset(actual):
            result['issues'].append('Resource omits matching language reading links beside course lessons')
        else:
            result['resourceReadingLinks'] = len(expected)
    return result


def inspect_fragments(pages, canonical):
    """Check public HTML destinations, including cross-page and encoded fragments."""
    errors, verified = [], 0
    for source, page in pages.items():
        missing, ambiguous = [], []
        for href in set(page.get('links', [])):
            target = urlsplit(urljoin(canonical + source, href))
            if target.scheme + '://' + target.netloc != canonical or not target.fragment:
                continue
            path = target.path.rstrip('/') or '/'
            destination = pages.get(path)
            if not destination or destination.get('status') != 200:
                continue
            name = unquote(target.fragment).split(':~:text=', 1)[0]
            if not name:
                continue
            matches = destination.get('anchors', []).count(name)
            if matches == 0 and name.lower() != 'top':
                missing.append(href)
            elif matches > 1:
                ambiguous.append(href)
            else:
                verified += 1
        if missing:
            errors.append({'path': source, 'issues': ['Internal fragment targets absent from initial HTML'], 'urls': sorted(missing)})
        if ambiguous:
            errors.append({'path': source, 'issues': ['Internal fragment targets identify multiple elements'], 'urls': sorted(ambiguous)})
    return errors, verified


def inspect_canonical_variants(base, canonical, videos, timeout):
    variants = [(path + '?utm_source=seo-audit', path) for path in
                ['/', '/course/arrays', '/guides/debounce-vs-throttle', '/course/target-two-sum/java']]
    variants += [(path + '/', path) for path in ['/course', '/interview-prep', '/watch']]
    variants += [('/watch/' + video['slug'] + '?t=' + str(video['chapters'][1]['start']), '/watch/' + video['slug'])
                 for video in videos if len(video['chapters']) > 1]
    errors, verified = [], 0
    for request_path, document_path in variants:
        try:
            status, _, body, final = fetch(base + request_path, timeout)
            page = Page()
            page.feed(body)
            if status != 200 or urlsplit(final).path.rstrip('/') != document_path.rstrip('/') or page.canonicals != [canonical + document_path]:
                raise ValueError('URL variant does not resolve to its canonical public document')
            verified += 1
        except (OSError, ValueError) as error:
            errors.append({'path': request_path, 'issues': [str(error)]})
    return errors, verified


def inspect_manifest(base, canonical, timeout):
    status, headers, body, _ = fetch(base + '/manifest.json', timeout)
    manifest = json.loads(body)
    if status != 200 or 'application/manifest+json' not in headers.get('Content-Type', ''):
        raise ValueError('Expected a public application/manifest+json response')
    if not manifest.get('name') or manifest.get('start_url') != '/' or manifest.get('scope') != '/':
        raise ValueError('Manifest identity or launch path is incomplete')
    if 'noindex' not in headers.get('X-Robots-Tag', '').lower():
        raise ValueError('Machine-readable manifest should carry an HTTP noindex directive')
    if not manifest.get('icons'):
        raise ValueError('Manifest has no icons')
    for icon in manifest['icons']:
        parsed = urlsplit(icon.get('src', ''))
        if parsed.scheme + '://' + parsed.netloc != canonical:
            raise ValueError('Manifest icon inherits a different deployment origin')
        image_status, image_headers, _, _ = fetch(base + parsed.path, timeout)
        if image_status != 200 or not image_headers.get('Content-Type', '').startswith('image/'):
            raise ValueError('Manifest icon is not publicly accessible')
    return True


def audit(args):
    catalog = json.loads((CONTENT / 'catalog.json').read_text())
    course = json.loads((CONTENT / 'course.json').read_text())
    resources = {f"/{item['section']}/{item['slug']}": item for item in catalog}
    walkthroughs = json.loads((CONTENT.parent / 'lesson-walkthroughs/catalog.json').read_text())
    resources.update({f"/course/{item['lesson']}/{item['language']}": item for item in walkthroughs})
    videos = json.loads((CONTENT.parent / 'videos/catalog.json').read_text())
    resources.update({f"/watch/{item['slug']}": item for item in videos})
    sections = {'/' + item['section'] for item in catalog}
    expected = {'/', '/about', '/course', '/pricing', '/privacy', '/terms', '/learn', '/docs', '/watch'} | sections | set(resources) | {'/course/' + lesson['slug'] for lesson in course['lessons']}
    errors = []
    try:
        status, _, body, _ = fetch(args.base_url + '/sitemap.xml', args.timeout)
        if status != 200:
            raise ValueError(f'Sitemap returned HTTP {status}')
        sitemap = {element.text.strip() for element in ET.fromstring(body).findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}loc') if element.text}
        wanted = {args.canonical_origin + path for path in expected}
        missing = sorted(wanted - sitemap)
        extra = sorted(sitemap - wanted)
        if missing:
            errors.append({'path': '/sitemap.xml', 'issues': ['Missing current published URLs'], 'urls': missing})
        if extra:
            errors.append({'path': '/sitemap.xml', 'issues': ['Unexpected or wrong-origin URLs'], 'urls': extra})
        video_nodes = ET.fromstring(body).findall('.//{http://www.google.com/schemas/sitemap-video/1.1}video')
        if len(video_nodes) != len(videos):
            errors.append({'path': '/sitemap.xml', 'issues': ['Video sitemap inventory differs from public video catalog']})
        image_locations = {element.text for element in ET.fromstring(body).findall('.//{http://www.google.com/schemas/sitemap-image/1.1}loc')}
        wanted_images = {args.canonical_origin + image for item in catalog for image in item.get('images', [])}
        if image_locations != wanted_images:
            errors.append({'path': '/sitemap.xml', 'issues': ['Image sitemap inventory differs from public article catalog']})
    except (OSError, ValueError, ET.ParseError) as error:
        errors.append({'path': '/sitemap.xml', 'issues': [str(error)]})
    try:
        status, _, body, _ = fetch(args.base_url + '/robots.txt', args.timeout)
        if status != 200:
            raise ValueError(f'Robots returned HTTP {status}')
        robots = RobotFileParser()
        robots.parse(body.splitlines())
        # The generated policy uses literal path prefixes. Google's longest-path
        # match differs from urllib's first-rule match when Allow: / comes first.
        for entry in robots.entries + ([robots.default_entry] if robots.default_entry else []):
            entry.rulelines.sort(key=lambda rule: (len(rule.path), rule.allowance), reverse=True)
        mismatches = [path for path in expected if robots.can_fetch('Googlebot', args.canonical_origin + path) == args.expect_noindex]
        if mismatches:
            errors.append({'path': '/robots.txt', 'issues': ['Crawler policy does not match expected indexing'], 'urls': sorted(mismatches)})
        private_paths = ['/my', '/my/settings', '/checkout', '/api/v1/lessons']
        exposed = [path for path in private_paths if robots.can_fetch('Googlebot', args.canonical_origin + path)]
        if exposed:
            errors.append({'path': '/robots.txt', 'issues': ['Account or API entry paths are not excluded'], 'urls': exposed})
        if not args.expect_noindex and args.canonical_origin + '/sitemap.xml' not in body:
            errors.append({'path': '/robots.txt', 'issues': ['Missing current sitemap declaration']})
    except (OSError, ValueError) as error:
        errors.append({'path': '/robots.txt', 'issues': [str(error)]})
    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        pages = list(pool.map(lambda path: inspect_page(path, args.base_url, args.canonical_origin, resources.get(path), args.timeout, args.expect_noindex), sorted(expected)))
    by_path = {page['path']: page for page in pages}
    variant_errors, variants_verified = inspect_canonical_variants(args.base_url, args.canonical_origin, videos, args.timeout)
    errors.extend(variant_errors)
    fragment_errors, fragment_links = inspect_fragments(by_path, args.canonical_origin)
    errors.extend(fragment_errors)
    errors.extend({'path': page['path'], 'issues': page['issues']} for page in pages if page['issues'])
    reachable, pending = set(), ['/']
    while pending:
        path = pending.pop()
        if path in reachable:
            continue
        reachable.add(path)
        for link in by_path.get(path, {}).get('links', []):
            parsed = urlsplit(urljoin(args.canonical_origin + path, link))
            target = parsed.path.rstrip('/') or '/'
            if f'{parsed.scheme}://{parsed.netloc}' == args.canonical_origin and target in by_path and target not in reachable:
                pending.append(target)
    orphaned = sorted(set(resources) - reachable)
    if orphaned:
        errors.append({'path': '/', 'issues': ['Resources are unreachable through HTML links from the homepage'], 'urls': orphaned})
    guides = [item for item in catalog if item['section'] == 'interview-prep']
    subjects = by_path.get('/interview-prep', {}).get('languageSubjects', [])
    if set(subjects) != {args.canonical_origin + '/interview-prep/' + item['slug'] for item in guides}:
        errors.append({'path': '/interview-prep', 'issues': ['Language-index subjects do not match all published language guides']})
    try:
        status, headers, body, _ = fetch(args.base_url + '/llms.txt', args.timeout)
        if status != 200 or 'text/plain' not in headers.get('Content-Type', '') or not body.startswith('# '):
            raise ValueError('Expected public llms.txt with Markdown text and text/plain content type')
        links = re.findall(r'\]\((https?://[^\s)]+)\)', body)
        wanted = {args.canonical_origin + path for path in resources}
        if not wanted.issubset(set(links)) or any(url not in {args.canonical_origin + path for path in expected} for url in links):
            raise ValueError('llms.txt resource links differ from the published inventory')
    except (OSError, ValueError) as error:
        errors.append({'path': '/llms.txt', 'issues': [str(error)]})
    manifest_verified = False
    try:
        manifest_verified = inspect_manifest(args.base_url, args.canonical_origin, args.timeout)
    except (OSError, ValueError) as error:
        errors.append({'path': '/manifest.json', 'issues': [str(error)]})
    return {'baseUrl': args.base_url, 'canonicalOrigin': args.canonical_origin, 'expectNoindex': args.expect_noindex,
            'expectedPublicPages': len(expected), 'pagesChecked': len(pages), 'publicResources': len(resources),
            'lessonWalkthroughs': len(walkthroughs),
            'internalFragmentLinksVerified': fragment_links,
            'courseCatalogVerified': bool(by_path.get('/course', {}).get('courseCatalog')),
            'canonicalVariantsVerified': variants_verified,
            'imageAlternativesVerified': sum(page.get('imageAlternatives', 0) for page in pages),
            'videoClipsVerified': sum(page.get('videoClips', 0) for page in pages),
            'uniqueHtmlIdsVerified': sum(page.get('uniqueIds', 0) for page in pages),
            'readingSequencePagesVerified': sum(bool(page.get('readingSequencePage')) for page in pages),
            'readingSequenceLinksVerified': sum(page.get('readingSequenceLinks', 0) for page in pages),
            'watchReadingLinksVerified': sum(page.get('watchReadingLinks', 0) for page in pages),
            'resourceReadingLinksVerified': sum(page.get('resourceReadingLinks', 0) for page in pages),
            'manifestVerified': manifest_verified,
            'publicVideos': len(videos),
            'lessonOverviewsVerified': sum(bool(page.get('lessonOverview')) for page in pages),
            'lessonLanguageLinksVerified': sum(bool(page.get('lessonLanguageLinks')) for page in pages),
            'resourceBodiesVerified': sum(page['resourceBody'] for page in pages), 'languageGuides': len(guides),
            'resourcesReachableFromHome': len(set(resources) & reachable), 'errors': errors}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--base-url', type=origin, default='http://localhost:3000', help='Transport origin to request anonymously')
    parser.add_argument('--canonical-origin', type=origin, help='Expected public origin; defaults to --base-url')
    parser.add_argument('--expect-noindex', action='store_true', help='Require preview noindex and blocked crawling instead of production eligibility')
    parser.add_argument('--workers', type=int, choices=range(1, 9), default=4)
    parser.add_argument('--timeout', type=int, choices=range(1, 61), default=15)
    parser.add_argument('--report', type=Path, help='Save the complete JSON report')
    args = parser.parse_args()
    args.canonical_origin = args.canonical_origin or args.base_url
    report = audit(args)
    if args.report:
        args.report.write_text(json.dumps(report, indent=2) + '\n')
    summary = {key: value for key, value in report.items() if key != 'errors'}
    summary['errorCount'] = len(report['errors'])
    summary['firstErrors'] = report['errors'][:8]
    print(json.dumps(summary, indent=2))
    return 1 if report['errors'] else 0


if __name__ == '__main__':
    sys.exit(main())
