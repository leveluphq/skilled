const { site, absoluteUrl } = require('../shared/site');
const catalog = require('../../content/resources/catalog.json');
const course = require('../../content/resources/course.json');
const walkthroughs = require('../../content/lesson-walkthroughs/catalog.json');
const videos = require('../../content/videos/catalog.json');

/** @param {string} value */
const escapeXml = (value) =>
  value.replace(
    /[<>&"']/g,
    (character) =>
      ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[character] ||
      character,
  );

const publicPaths = () => [
  ...[
    '/',
    '/about',
    '/course',
    '/pricing',
    '/privacy',
    '/terms',
    '/learn',
    '/docs',
    '/guides',
    '/topics',
    '/patterns',
    '/tools',
    '/interview-prep',
    '/study-plans',
    '/reference',
    '/watch',
  ].map((path) => ({ path, updated: '' })),
  ...course.lessons.map((lesson) => ({ path: `/course/${lesson.slug}`, updated: '' })),
  ...catalog.map((resource) => ({
    path: `/${resource.section}/${resource.slug}`,
    updated: resource.updated,
  })),
  ...walkthroughs.map((page) => ({ path: `/course/${page.lesson}/${page.language}`, updated: '' })),
  ...videos.map((video) => ({ path: `/watch/${video.slug}`, updated: '' })),
];

const buildSitemap = () =>
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${publicPaths()
    .map(
      ({ path, updated }) =>
        `  <url><loc>${escapeXml(absoluteUrl(path))}</loc>${
          updated ? `<lastmod>${escapeXml(updated)}</lastmod>` : ''
        }${videoEntry(path)}${imageEntry(path)}</url>`,
    )
    .join('\n')}\n</urlset>\n`;

const imageEntry = (path) =>
  (catalog.find((entry) => path === `/${entry.section}/${entry.slug}`)?.images || [])
    .map(
      (image) =>
        `<image:image><image:loc>${escapeXml(absoluteUrl(image))}</image:loc></image:image>`,
    )
    .join('');

const videoEntry = (path) => {
  const video = videos.find((entry) => path === `/watch/${entry.slug}`);
  return video
    ? `<video:video><video:thumbnail_loc>${escapeXml(absoluteUrl(`/images/videos/${video.slug}.jpg`))}</video:thumbnail_loc><video:title>${escapeXml(video.title)}</video:title><video:description>${escapeXml(video.description)}</video:description><video:player_loc>${escapeXml(`https://www.youtube-nocookie.com/embed/${video.videoId}`)}</video:player_loc><video:duration>${video.durationSeconds}</video:duration><video:publication_date>${escapeXml(video.uploadDate)}</video:publication_date></video:video>`
    : '';
};

const buildRobots = () =>
  site.indexable
    ? `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /auth/\nDisallow: /my\nDisallow: /friend/\nDisallow: /checkout\nDisallow: /logout\n\nSitemap: ${absoluteUrl(
        '/sitemap.xml',
      )}\n`
    : 'User-agent: *\nDisallow: /\n';

module.exports = { publicPaths, buildSitemap, buildRobots };
