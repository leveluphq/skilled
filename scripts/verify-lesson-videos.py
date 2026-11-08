#!/usr/bin/env python3
"""Verify published course recordings against public YouTube metadata.

Author-only, explicit network check. Builds use the reviewed catalog and never
contact YouTube. No account, cookie, API key, or database connection is needed.
"""
import argparse
import concurrent.futures
import datetime
import json
from pathlib import Path
import re
import time
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
CHANNEL_ID = 'UC3v9kBR_ab4UHXXdknz8Fbg'


def fetch(url):
    for attempt in range(3):
        try:
            request = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(request, timeout=40) as response:
                return response.read()
        except (OSError, ValueError):
            if attempt == 2:
                raise
            time.sleep(attempt + 1)


def video_id(url):
    parsed = urllib.parse.urlsplit(url)
    if parsed.hostname == 'youtu.be':
        value = parsed.path.removeprefix('/')
    elif parsed.hostname in ('www.youtube.com', 'youtube.com') and parsed.path == '/watch':
        value = urllib.parse.parse_qs(parsed.query).get('v', [''])[0]
    else:
        raise ValueError(f'Unsupported YouTube source: {url}')
    if not re.fullmatch(r'[\w-]{11}', value):
        raise ValueError(f'Invalid YouTube video ID: {url}')
    return value


def verify(lesson):
    identity = video_id(lesson['solutionVideoUrl'])
    url = 'https://www.youtube.com/watch?v=' + identity
    html = fetch(url).decode('utf-8')
    match = re.search(r'(?:var\s+)?ytInitialPlayerResponse\s*=\s*', html)
    if not match:
        raise ValueError('Public watch page has no player metadata')
    player = json.JSONDecoder().raw_decode(html[match.end():])[0]
    status = player.get('playabilityStatus', {})
    details = player.get('videoDetails', {})
    micro = player.get('microformat', {}).get('playerMicroformatRenderer', {})
    if status.get('status') != 'OK' or status.get('playableInEmbed') is not True:
        raise ValueError('Recording is not publicly playable and embeddable')
    if details.get('isPrivate') is not False:
        raise ValueError('Recording is private')
    if details.get('channelId') != CHANNEL_ID or details.get('author') != 'Trey Huffine':
        raise ValueError('Recording author differs from the course author')
    oembed = json.loads(fetch('https://www.youtube.com/oembed?' + urllib.parse.urlencode({
        'url': url, 'format': 'json',
    })))
    if oembed.get('author_name') != details['author'] or oembed.get('title') != details['title']:
        raise ValueError('Watch and oEmbed metadata disagree')
    duration = int(details['lengthSeconds'])
    upload = micro['uploadDate']
    datetime.datetime.fromisoformat(upload)
    if duration < 1:
        raise ValueError('Invalid source duration')
    thumbnail = fetch('https://i.ytimg.com/vi/' + identity + '/hqdefault.jpg')
    if not thumbnail.startswith(b'\xff\xd8\xff'):
        raise ValueError('Source thumbnail is not a JPEG')
    return {
        'slug': lesson['slug'],
        'videoId': identity,
        'title': details['title'],
        'durationSeconds': duration,
        'uploadDate': upload,
        'author': details['author'],
        'channelId': details['channelId'],
        'channelUrl': 'https://www.youtube.com/@levelupdev',
        'isUnlisted': micro.get('isUnlisted'),
        'sourceCrawlable': details.get('isCrawlable'),
        'verified': datetime.datetime.now(datetime.timezone.utc).date().isoformat(),
    }, thumbnail


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--report', type=Path, required=True)
    parser.add_argument('--write-thumbnails', action='store_true')
    parser.add_argument('--workers', type=int, default=4, choices=range(1, 9))
    args = parser.parse_args()
    seed = json.loads((ROOT / 'hasura/seeds/course.json').read_text())
    lessons = [lesson for lesson in seed['lessons']
               if lesson['status'] == 'ACTIVE' and lesson.get('solutionVideoUrl')]
    verified, thumbnails, errors = {}, {}, []
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as pool:
        futures = {pool.submit(verify, lesson): lesson['slug'] for lesson in lessons}
        for future in concurrent.futures.as_completed(futures):
            slug = futures[future]
            try:
                metadata, thumbnail = future.result()
                verified[slug] = metadata
                thumbnails[slug] = thumbnail
                print(f'Verified {len(verified)}/{len(lessons)}: {slug}', flush=True)
            except (OSError, ValueError, KeyError) as error:
                errors.append({'slug': slug, 'error': str(error)})
                print(f'Failed: {slug}: {error}', flush=True)
    report = {'videos': [verified[l['slug']] for l in lessons if l['slug'] in verified],
              'errors': errors}
    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.report.write_text(json.dumps(report, indent=2) + '\n')
    if errors:
        raise SystemExit(1)
    if args.write_thumbnails:
        folder = ROOT / 'public/images/videos'
        folder.mkdir(parents=True, exist_ok=True)
        for slug, data in thumbnails.items():
            (folder / (slug + '.jpg')).write_bytes(data)
    print(f'Verified all {len(verified)} published recordings.')


if __name__ == '__main__':
    main()
