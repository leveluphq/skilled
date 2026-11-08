if (process.env.NODE_ENV === 'development') {
  console.log('(( USING DOTENV ))');
  const path = require('path');
  const envPath = path.resolve(process.cwd(), '.env.local');
  require('dotenv').config({ path: envPath });
}

const withImages = require('next-images');
const rehypePrism = require('@mapbox/rehype-prism');
const withMDX = require('@next/mdx')({
  extension: /.mdx?$/,
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
  options: {
    rehypePlugins: [rehypePrism],
    providerImportSource: '@mdx-js/react',
  },
});
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const date = new Date();

// TODO: add next-optimized-images

/** @type {import('next').NextConfig} */
const nextConfig = {
  // REMOVED
  // target: 'serverless',
  // transpileModules: ['utils/shared'],
  reactStrictMode: false, // Turned this off because of bottom sheet component. Do I actually need it?
  poweredByHeader: false,
  images: {
    disableStaticImages: true,
  },
  compiler: {
    styledComponents: true,
  },
  typescript: {
    // Allow production builds to complete despite type errors
    // Type errors should still be fixed, but won't block deployments
    ignoreBuildErrors: true,
  },
  eslint: {
    // Allow production builds to complete despite ESLint errors
    ignoreDuringBuilds: true,
  },
  env: {
    APP_STAGE: process.env.APP_STAGE,
    BUILD_TIME: date.toString(),
    BUILD_TIMESTAMP: +date,
    STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
    ROOT_URL: process.env.ROOT_URL,
    SITE_NAME: process.env.SITE_NAME || '',
    SITE_DESCRIPTION: process.env.SITE_DESCRIPTION || '',
    SITE_IMAGE: process.env.SITE_IMAGE || '',
    SITE_LOGO: process.env.SITE_LOGO || '',
    SITE_TWITTER: process.env.SITE_TWITTER || '',
    SITE_INDEXABLE: process.env.SITE_INDEXABLE || '',
    JWT_TOKEN_NAME: process.env.JWT_TOKEN_NAME,
    GRAPHQL_URL: process.env.GRAPHQL_URL,
    SENTRY_DSN: process.env.SENTRY_DSN_CLIENT,
    FACEBOOK_APP_ID: process.env.FACEBOOK_APP_ID,
    GOOGLE_TAG_MANAGER_ID: process.env.GOOGLE_TAG_MANAGER_ID,
    // Where code runs, resolved here so the browser gets the mode and never the
    // Judge0 key (see src/utils/shared/runner/settings.ts)
    CODE_RUNNER: process.env.CODE_RUNNER || (process.env.JUDGE0_API_KEY ? 'judge0' : 'docker'),
    RUNNER_V2_LESSONS: process.env.RUNNER_V2_LESSONS || '',
    OPEN_ALL_LESSONS: process.env.OPEN_ALL_LESSONS || '',
  },
  webpack: (config, { isServer }) => {
    // FROM: https://github.com/UnlyEd/next-typescript-api-zeit-boilerplate/blob/3adf3d3fda0bec763cf20b031b8dfa3d612fa81d/next.config.js
    // Vercel official: https://github.com/vercel/next.js/tree/canary/examples/with-sentry
    if (!isServer) {
      config.resolve.alias['@sentry/node'] = '@sentry/browser';
    }

    return config;
  },
};

module.exports = withBundleAnalyzer(withMDX(withImages(nextConfig)));
