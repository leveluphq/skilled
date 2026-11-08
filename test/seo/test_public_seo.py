import argparse
import importlib.util
import json
from pathlib import Path
import unittest
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location('public_seo', ROOT / 'scripts/check-public-seo.py')
seo = importlib.util.module_from_spec(spec)
spec.loader.exec_module(seo)


class PublicSeoChecks(unittest.TestCase):
    def test_duplicate_ids_are_reported_even_when_no_fragment_link_targets_them(self):
        base = 'https://school.example'
        html = ('<head><title>Page</title><meta name="description" content="Page">'
                '<link rel="canonical" href="' + base + '/about"></head><h1>Page</h1>'
                '<svg><clipPath id="loader"></clipPath></svg><svg><clipPath id="loader"></clipPath></svg>'
                '<script type="application/ld+json">{"@type":"WebPage"}</script>')
        with patch.object(seo, 'fetch', return_value=(200, {'Content-Type': 'text/html'}, html, base + '/about')):
            result = seo.inspect_page('/about', base, base, None, 5, False)
        self.assertIn('Duplicate HTML IDs: loader', result['issues'])

    def test_reading_sequences_need_same_language_topic_neighbors_in_order(self):
        resource = next(item for item in seo.READINGS if item['lesson'] == 'implement-an-array' and item['language'] == 'java')
        path = '/course/implement-an-array/java'
        def inspect(links):
            page = seo.Page()
            page.feed('<nav aria-label="Java reading sequence">' + ''.join('<a href="' + link + '">Read</a>' for link in links) + '</nav>')
            return seo.inspect_contextual_links(path, page, resource)
        expected = ['/course/arrays/java', '/course/walk-a-matrix/java']
        self.assertEqual(inspect(expected)['issues'], [])
        for links in [[], list(reversed(expected)), ['/course/arrays/python', expected[1]], [expected[0], '/course/graphs/java']]:
            self.assertIn('Reading sequence does not follow this language and topic in course order', inspect(links)['issues'])

    def test_watch_companions_must_be_in_their_contextual_navigation_not_elsewhere(self):
        resource = {'slug': 'debounce', 'videoId': 'verified'}
        def inspect(markup):
            page = seo.Page()
            page.feed(markup)
            return seo.inspect_contextual_links('/watch/debounce', page, resource)
        links = '<a href="/course/debounce/javascript">JavaScript</a><a href="/course/debounce/typescript">TypeScript</a>'
        self.assertEqual(inspect('<nav aria-label="Video lesson programming-language walkthroughs">' + links + '</nav>')['watchReadingLinks'], 2)
        self.assertTrue(inspect(links)['issues'])
        self.assertTrue(inspect('<nav aria-label="Video lesson programming-language walkthroughs">' + links + '<a href="/course/debounce/java">Java</a></nav>')['issues'])

    def test_resource_companions_do_not_pass_using_links_elsewhere_in_the_language_library(self):
        resource = {'language': 'python', 'lessons': ['target-two-sum']}
        def inspect(markup):
            page = seo.Page()
            page.feed(markup)
            return seo.inspect_contextual_links('/interview-prep/python', page, resource)
        link = '<a href="/course/target-two-sum/python">Two sum</a>'
        self.assertTrue(inspect(link)['issues'])
        self.assertEqual(inspect('<nav aria-label="Course lessons and language walkthroughs">' + link + '</nav>')['resourceReadingLinks'], 1)

    def test_fetch_follows_permanent_308_redirects_on_supported_python_versions(self):
        class Handler(BaseHTTPRequestHandler):
            def do_GET(self):
                self.send_response(308 if self.path == '/before' else 200)
                if self.path == '/before': self.send_header('Location', '/after')
                self.end_headers()
                if self.path != '/before': self.wfile.write(b'Final document')
            def log_message(self, *args): pass
        server = HTTPServer(('127.0.0.1', 0), Handler)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        try:
            base = 'http://127.0.0.1:' + str(server.server_port)
            status, _, body, final = seo.fetch(base + '/before', 5)
            self.assertEqual((status, body, final), (200, 'Final document', base + '/after'))
        finally:
            server.shutdown()
            server.server_close()
            thread.join()

    def test_parser_distinguishes_page_metadata_from_svg_and_collects_actual_article_text(self):
        page = seo.Page()
        page.feed('<html><head><title>Guide &amp; example</title><meta name="description" content="Useful">'
                  '<link rel="canonical" href="https://school.example/guides/demo"></head><body>'
                  '<h1>A <span>guide</span></h1><article>Read <code>Map()</code> &amp; write tests.</article>'
                  '<svg><title>A diagram</title></svg><script type="application/ld+json">'
                  '[{"@type":"TechArticle","headline":"x\\u003cy"}]</script></body></html>')
        self.assertEqual(page.titles, 1)
        self.assertEqual(''.join(page.title_text), 'Guide & example')
        self.assertEqual(''.join(page.heading_text), 'A guide')
        self.assertEqual(''.join(page.article_text), 'Read Map() & write tests.')
        self.assertEqual(seo.entities(page.structured)[0]['headline'], 'x<y')
        self.assertEqual(page.json_errors, [])
        page.feed('<script type="application/ld+json">not json</script>')
        self.assertEqual(len(page.json_errors), 1)

    def test_a_login_wall_with_success_status_does_not_pass_as_a_public_resource(self):
        resource = {'section': 'patterns', 'slug': 'tries', 'title': 'Tries'}
        opening = seo.prose_marker((seo.CONTENT / 'patterns/tries.mdx').read_text())
        html = ('<head><title>Tries</title><meta name="description" content="Tries">'
                '<link rel="canonical" href="https://school.example/patterns/tries"></head>'
                f'<h1>Tries</h1><article>{opening} Sign in to read the rest of this guide.</article>'
                '<script type="application/ld+json">{"url":"https://school.example/patterns/tries",'
                '"isAccessibleForFree":true}</script>')
        with patch.object(seo, 'fetch', return_value=(200, {'Content-Type': 'text/html'}, html,
                                                   'http://localhost:3000/patterns/tries')):
            result = seo.inspect_page('/patterns/tries', 'http://localhost:3000',
                                      'https://school.example', resource, 5, False)
        self.assertFalse(result['resourceBody'])
        self.assertIn('Published article opening or ending is absent from initial HTML', result['issues'])

    def test_noindex_and_auth_redirects_are_detected_even_when_the_response_is_200(self):
        html = ('<head><title>Page</title><meta name="description" content="Page">'
                '<meta name="robots" content="noindex"><link rel="canonical" href="https://school.example/">'
                '</head><h1>Page</h1><script type="application/ld+json">{"@type":"WebPage"}</script>')
        with patch.object(seo, 'fetch', return_value=(200, {'Content-Type': 'text/html'}, html,
                                                   'https://school.example/auth/sign-in')):
            result = seo.inspect_page('/', 'https://school.example', 'https://school.example', None, 5, False)
        self.assertIn('Unexpected noindex', result['issues'])
        self.assertIn('Redirected to /auth/sign-in', result['issues'])
        with patch.object(seo, 'fetch', return_value=(200, {'Content-Type': 'text/html'}, html,
                                                   'https://school.example/')):
            preview = seo.inspect_page('/', 'https://school.example', 'https://school.example', None, 5, True)
        self.assertEqual(preview['issues'], [])

    def test_a_stale_sitemap_does_not_reduce_the_inventory_that_gets_audited(self):
        base = 'https://school.example'
        catalog = json.loads((seo.CONTENT / 'catalog.json').read_text())
        paths = [f"/{item['section']}/{item['slug']}" for item in catalog]
        walkthroughs = json.loads((seo.CONTENT.parent / 'lesson-walkthroughs/catalog.json').read_text())
        paths += [f"/course/{item['lesson']}/{item['language']}" for item in walkthroughs]
        videos = json.loads((seo.CONTENT.parent / 'videos/catalog.json').read_text())
        paths += [f"/watch/{item['slug']}" for item in videos]
        subjects = [base + path for path in paths if path.startswith('/interview-prep/')]

        def fetch(url, timeout):
            if url.endswith('/sitemap.xml'):
                body = f'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>\n  {base}/\n</loc></url></urlset>'
            elif url.endswith('/robots.txt'):
                body = f'User-agent: *\nAllow: /\nDisallow: /my\nDisallow: /checkout\nDisallow: /api/\nSitemap: {base}/sitemap.xml\n'
            else:
                body = '# School\n' + '\n'.join(f'- [Resource]({base}{path})' for path in paths)
            return 200, {'Content-Type': 'text/plain'}, body, url

        def inspect(path, base_url, canonical, resource, timeout, noindex):
            return {'path': path, 'issues': [], 'links': paths if path == '/' else [],
                    'resourceBody': bool(resource), 'languageSubjects': subjects if path == '/interview-prep' else []}

        args = argparse.Namespace(base_url=base, canonical_origin=base, timeout=5, workers=2, expect_noindex=False)
        with patch.object(seo, 'fetch', side_effect=fetch), patch.object(seo, 'inspect_page', side_effect=inspect) as inspector:
            report = seo.audit(args)
        self.assertGreater(report['pagesChecked'], len(catalog))
        self.assertEqual(inspector.call_count, report['expectedPublicPages'])
        self.assertEqual(report['resourceBodiesVerified'], len(catalog) + len(walkthroughs) + len(videos))
        self.assertTrue(any('/interview-prep/python' in url for error in report['errors'] for url in error.get('urls', [])))
        self.assertEqual(report['errors'][0]['issues'], ['Missing current published URLs'])
        self.assertNotIn(base + '/', report['errors'][0]['urls'])
        self.assertFalse(any(error['path'] == '/robots.txt' for error in report['errors']))

    def test_composition_comments_are_not_treated_as_visible_article_openings(self):
        text = '<!-- Composed by the publisher. -->\n\nThe actual opening teaches the problem with enough detail to make a useful marker.'
        self.assertEqual(seo.prose_marker(text), seo.prose_marker(text.split('\n\n')[1]))
        jsx = '{/* Composed by the publisher. */}\n\n' + text.split('\n\n')[1]
        self.assertEqual(seo.prose_marker(jsx), seo.prose_marker(text))

    def test_video_iframes_are_collected_from_initial_html(self):
        page = seo.Page()
        page.feed('<iframe title="Debounce" src="https://www.youtube-nocookie.com/embed/Lfdqz7FSS_g?start=0&amp;rel=0"></iframe>')
        self.assertEqual(page.iframes, [{'title': 'Debounce', 'src': 'https://www.youtube-nocookie.com/embed/Lfdqz7FSS_g?start=0&rel=0'}])

    def test_lesson_approach_and_language_links_must_be_in_initial_html(self):
        base = 'https://school.example'
        slug = 'target-two-sum'
        overview = seo.OVERVIEWS[slug]
        languages = seo.LESSON_LANGUAGES[slug]
        text = ''.join('<p>' + value + '</p>' for value in [overview['focus'], overview['approach'], overview['cost'], *overview['checks']])
        links = ''.join('<a href="/interview-prep/' + language + '">Language</a>' for language in languages)
        reading_links = ['/course/' + slug + '/' + language for language in languages]
        links += ''.join('<a href="' + link + '">Read lesson</a>' for link in reading_links)
        entity = {'hasPart': [{'url': base + link} for link in reading_links], '@type': ['WebPage', 'LearningResource'], 'url': base + '/course/' + slug,
                  'teaches': overview['focus'], 'about': [{'@type': 'ComputerLanguage', 'url': base + '/interview-prep/' + language} for language in languages]}
        html = ('<head><title>Two Sum</title><meta name="description" content="Pairs">'
                '<link rel="canonical" href="' + base + '/course/' + slug + '"></head><h1>Two Sum</h1>'
                '<section aria-label="Approach and test strategy"><details>' + text + '</details></section>' + links +
                '<script type="application/ld+json">' + json.dumps(entity) + '</script>')
        def inspect(body):
            with patch.object(seo, 'fetch', return_value=(200, {'Content-Type': 'text/html'}, body, base + '/course/' + slug)):
                return seo.inspect_page('/course/' + slug, base, base, None, 5, False)
        self.assertEqual(inspect(html)['issues'], [])
        self.assertTrue(inspect(html)['lessonOverview'])
        hidden = inspect(html.replace(overview['cost'], 'Sign in to continue'))
        self.assertIn('Public lesson approach, checks, or cost model absent from initial HTML', hidden['issues'])
        missing = inspect(html.replace('/interview-prep/python', '/unpublished/python'))
        self.assertIn('Missing lesson programming-language preparation links', missing['issues'])

    def test_concept_and_javascript_lessons_require_their_complete_language_links(self):
        base = 'https://school.example'
        for slug in ['arrays', 'implement-a-queue', 'debounce']:
            languages = seo.LESSON_LANGUAGES[slug]
            readings = ['/course/' + slug + '/' + language for language in languages]
            entity = {'@type': 'LearningResource', 'url': base + '/course/' + slug,
                      'about': [{'@type': 'ComputerLanguage', 'url': base + '/interview-prep/' + language} for language in languages],
                      'hasPart': [{'url': base + link} for link in readings]}
            links = readings + ['/interview-prep/' + language for language in languages]
            html = ('<head><title>Lesson</title><meta name="description" content="Lesson">'
                    '<link rel="canonical" href="' + base + '/course/' + slug + '"></head><h1>Lesson</h1>' +
                    ''.join('<a href="' + link + '">Read</a>' for link in links) +
                    '<script type="application/ld+json">' + json.dumps(entity) + '</script>')
            with patch.object(seo, 'fetch', return_value=(200, {'Content-Type': 'text/html'}, html, base + '/course/' + slug)):
                result = seo.inspect_page('/course/' + slug, base, base, None, 5, False)
            self.assertEqual(result['issues'], [])
            self.assertTrue(result['lessonLanguageLinks'])
            with patch.object(seo, 'fetch', return_value=(200, {'Content-Type': 'text/html'}, html.replace('href="' + readings[-1] + '"', 'href="/missing"'), base + '/course/' + slug)):
                missing = seo.inspect_page('/course/' + slug, base, base, None, 5, False)
            self.assertIn('Missing lesson language reading links or membership metadata', missing['issues'])

    def test_cross_page_fragment_checks_handle_encoding_queries_and_legacy_names(self):
        page = seo.Page()
        page.feed('<h2 id="lesson-walkthroughs">Lessons</h2><a name="old-anchor">Old</a><h2 id="é">Text</h2>')
        links = ['/interview-prep/python#lesson-walkthroughs', '/interview-prep/python?from=home#%C3%A9', '/interview-prep/python#old-anchor', '#top', 'https://elsewhere.example/#missing']
        errors, verified = seo.inspect_fragments({
            '/': {'status': 200, 'links': links},
            '/interview-prep/python': {'status': 200, 'anchors': page.anchors},
        }, 'https://school.example')
        self.assertEqual(errors, [])
        self.assertEqual(verified, 4)

    def test_fragment_checks_detect_missing_and_ambiguous_targets_without_cascading_404s(self):
        errors, verified = seo.inspect_fragments({
            '/': {'status': 200, 'links': ['/course#arrays', '/course#twice', '/missing#absent']},
            '/course': {'status': 200, 'anchors': ['twice', 'twice']},
            '/missing': {'status': 404},
        }, 'https://school.example')
        self.assertEqual(verified, 0)
        self.assertEqual(len(errors), 2)
        self.assertEqual(errors[0]['urls'], ['/course#arrays'])
        self.assertEqual(errors[1]['urls'], ['/course#twice'])

    def test_course_index_needs_its_catalog_even_with_a_title_and_valid_schema(self):
        base = 'https://school.example'
        head = '<head><title>Course</title><meta name="description" content="Course"><link rel="canonical" href="' + base + '/course"></head><h1>Course</h1>'
        schema = '<script type="application/ld+json">{"@type":"Course"}</script>'
        def inspect(body):
            with patch.object(seo, 'fetch', return_value=(200, {'Content-Type': 'text/html'}, body, base + '/course')):
                return seo.inspect_page('/course', base, base, None, 5, False)
        missing = inspect(head + schema)
        self.assertIn('Published course lessons or category targets absent from initial HTML', missing['issues'])
        catalog = ''.join('<section id="' + category['slug'] + '"></section>' for category in seo.COURSE['categories'])
        catalog += ''.join('<a href="/course/' + lesson['slug'] + '">Lesson</a>' for lesson in seo.COURSE['lessons'])
        self.assertIn('Course structured data omits published lessons', inspect(head + catalog + schema)['issues'])
        schema = '<script type="application/ld+json">' + json.dumps({'@type': 'Course', 'hasPart': [
            {'@type': 'LearningResource', 'url': base + '/course/' + lesson['slug']} for lesson in seo.COURSE['lessons']]}) + '</script>'
        result = inspect(head + catalog + schema)
        self.assertEqual(result['issues'], [])
        self.assertTrue(result['courseCatalog'])

    def test_missing_image_alternatives_are_detected_but_explicit_decorations_are_allowed(self):
        base = 'https://school.example'
        head = '<head><title>Page</title><meta name="description" content="Page"><link rel="canonical" href="' + base + '/about"></head><h1>Page</h1><script type="application/ld+json">{"@type":"WebPage"}</script>'
        for markup, missing in [('<img src="/diagram.png">', True), ('<img src="/icon.svg" alt="">', False), ('<img src="/diagram.png" alt="A tree splits into two branches">', False)]:
            with patch.object(seo, 'fetch', return_value=(200, {'Content-Type': 'text/html'}, head + markup, base + '/about')):
                result = seo.inspect_page('/about', base, base, None, 5, False)
            self.assertEqual('Image alternative text is missing' in result['issues'], missing)

    def test_query_and_slash_variants_need_a_clean_canonical(self):
        base = 'https://school.example'
        def fetch(url, timeout):
            pathname = seo.urlsplit(url).path.rstrip('/') or '/'
            return 200, {}, '<link rel="canonical" href="' + base + pathname + '">', base + pathname
        with patch.object(seo, 'fetch', side_effect=fetch):
            errors, verified = seo.inspect_canonical_variants(base, base, [], 5)
        self.assertEqual((errors, verified), ([], 7))
        with patch.object(seo, 'fetch', return_value=(200, {}, '<link rel="canonical" href="' + base + '/?utm_source=seo-audit">', base + '/')):
            errors, _ = seo.inspect_canonical_variants(base, base, [], 5)
        self.assertEqual(len(errors), 7)

    def test_manifest_icons_must_belong_to_the_configured_deployment(self):
        base = 'https://school.example'
        manifest = {'name': 'School', 'start_url': '/', 'scope': '/', 'icons': [{'src': base + '/icon.png'}]}
        headers = {'Content-Type': 'application/manifest+json', 'X-Robots-Tag': 'noindex'}
        def fetch(url, timeout):
            return (200, headers, json.dumps(manifest), url) if url.endswith('manifest.json') else (200, {'Content-Type': 'image/png'}, '', url)
        with patch.object(seo, 'fetch', side_effect=fetch):
            self.assertTrue(seo.inspect_manifest(base, base, 5))
            manifest['icons'][0]['src'] = 'https://other.example/icon.png'
            with self.assertRaisesRegex(ValueError, 'different deployment'):
                seo.inspect_manifest(base, base, 5)

    def test_prose_marker_keeps_visible_inline_values_and_origin_rejects_credentials(self):
        marker = seo.prose_marker('Use `Map()` with [a guide](/guides/demo) before writing a longer example with a repeated key.\n\n## More')
        self.assertIn('Use Map() with a guide', marker)
        for value in ['file:///tmp', 'https://user:password@example.com', 'https://school.example/path']:
            with self.assertRaises(argparse.ArgumentTypeError):
                seo.origin(value)


if __name__ == '__main__':
    unittest.main()
