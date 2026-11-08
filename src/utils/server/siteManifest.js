const { site, absoluteUrl } = require('../shared/site');

const buildManifest = () => ({
  id: '/',
  name: site.name,
  short_name: site.name,
  description: site.description,
  lang: 'en',
  start_url: '/',
  scope: '/',
  display: 'standalone',
  background_color: '#040405',
  theme_color: '#040405',
  icons: [36, 48, 72, 96, 144, 192].map((size) => ({
    src: absoluteUrl(`/icons/android-icon-${size}x${size}.png`),
    sizes: `${size}x${size}`,
    type: 'image/png',
  })),
});

module.exports = { buildManifest };
