// Preview the deployment-aware sitemap. The live response is /sitemap.xml.
require('@next/env').loadEnvConfig(process.cwd(), process.env.NODE_ENV !== 'production', {
  info: () => {},
  error: console.error,
});
const { buildSitemap } = require('../../utils/server/discovery');
process.stdout.write(buildSitemap());
