/** Public deployment identity shared by the app and the sitemap preview CLI. */
const getSiteOrigin = () => {
  const configured = process.env.ROOT_URL || 'https://skilled.dev';
  const url = new URL(configured);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
    throw new Error('ROOT_URL must be an absolute HTTP(S) URL without credentials.');
  }
  return url.origin;
};

const publicOrigin = getSiteOrigin();
const site = {
  name: process.env.SITE_NAME || 'Skilled.dev',
  description:
    process.env.SITE_DESCRIPTION ||
    'Learn data structures, algorithms, and JavaScript interview skills with explanations, coding exercises, and interactive tools.',
  origin: publicOrigin,
  image: new URL(process.env.SITE_IMAGE || '/social-share.png', publicOrigin).href,
  logo: new URL(process.env.SITE_LOGO || '/logo-square.png', publicOrigin).href,
  twitter:
    process.env.SITE_TWITTER || (publicOrigin === 'https://skilled.dev' ? '@skilled_dev' : ''),
  // The open-source repository the site links to ("Star on GitHub", the footer, the docs).
  sourceUrl: (process.env.SITE_SOURCE_URL || 'https://github.com/leveluphq/skilled').replace(/\/+$/, ''),
  indexable: process.env.APP_STAGE === 'production' && process.env.SITE_INDEXABLE !== 'false',
};

/** @param {string} [path] */
const absoluteUrl = (path = '/') => {
  // Content paths cannot change the configured origin. UI/query state is not a
  // distinct document; language-specific resources have their own paths.
  const pathname = path.split(/[?#]/)[0];
  const normalized = `/${pathname.replace(/^\/+/, '')}`.replace(/\/{2,}/g, '/');
  return `${site.origin}${normalized === '/' ? '/' : normalized.replace(/\/$/, '')}`;
};

module.exports = { site, absoluteUrl };
