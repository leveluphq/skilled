export {};
const rootUrl = process.env.ROOT_URL;
const stage = process.env.APP_STAGE;
const indexing = process.env.SITE_INDEXABLE;

afterEach(() => {
  for (const [key, value] of Object.entries({
    ROOT_URL: rootUrl,
    APP_STAGE: stage,
    SITE_INDEXABLE: indexing,
  })) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  jest.resetModules();
});

it('includes published course and resource pages on an independent domain without draft lessons', () => {
  jest.resetModules();
  process.env.ROOT_URL = 'https://school.example';
  const { buildSitemap, publicPaths } = require('../discovery');
  const xml = buildSitemap();
  const paths = publicPaths().map((entry: { path: string }) => entry.path);
  expect(xml).toContain('https://school.example/course/first-bad-version');
  expect(xml).toContain('https://school.example/course/best-time-to-buy-and-sell-stock');
  expect(xml).toContain('https://school.example/tools/debounce-throttle');
  expect(xml).toContain('https://school.example/course/target-two-sum/python');
  expect(xml).toContain('/course/target-two-sum/rust');
  expect(xml).not.toContain('/course/target-two-sum/ruby');
  expect(xml).not.toContain('skilled.dev');
  for (const draft of ['knapsack', 'system-design', 'backtracking', 'detect-a-loop'])
    expect(paths).not.toContain(`/course/${draft}`);
  expect(new Set(paths).size).toBe(paths.length);
  expect(xml).not.toContain('2020-12-11');
  expect(xml).not.toContain('<priority>');
  expect(xml).toContain('xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"');
  expect(xml).toContain('https://school.example/watch/debounce');
  expect(xml).toContain('<video:duration>831</video:duration>');
  expect(xml).toContain('<video:publication_date>2025-10-15T15:32:27-07:00</video:publication_date>');
  expect(paths).toContain('/course/count-islands/java');
  expect(xml).toContain('<image:loc>https://school.example/images/algorithms/url-shortener-architecture.svg</image:loc>');
});

it('keeps preview robots closed and publishes discovery on an indexable deployment', () => {
  jest.resetModules();
  process.env.APP_STAGE = 'staging';
  expect(require('../discovery').buildRobots()).toBe('User-agent: *\nDisallow: /\n');
  jest.resetModules();
  process.env.APP_STAGE = 'production';
  process.env.SITE_INDEXABLE = 'true';
  process.env.ROOT_URL = 'https://school.example';
  const robots = require('../discovery').buildRobots();
  expect(robots).toContain('Allow: /');
  expect(robots).toContain('Disallow: /my\n');
  expect(robots).toContain('Sitemap: https://school.example/sitemap.xml');
});
