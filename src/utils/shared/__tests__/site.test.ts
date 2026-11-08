export {};
const original = {
  ROOT_URL: process.env.ROOT_URL,
  APP_STAGE: process.env.APP_STAGE,
  SITE_NAME: process.env.SITE_NAME,
  SITE_INDEXABLE: process.env.SITE_INDEXABLE,
  SITE_IMAGE: process.env.SITE_IMAGE,
};

afterEach(() => {
  for (const [key, value] of Object.entries(original)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  jest.resetModules();
});

it('uses the configured publisher origin and removes tracking and fragments from canonicals', () => {
  jest.resetModules();
  process.env.ROOT_URL = 'https://academy.example/';
  process.env.SITE_NAME = 'Example Academy';
  const { site, absoluteUrl } = require('../site');
  expect(site.name).toBe('Example Academy');
  expect(absoluteUrl('/guides/arrays/?utm_source=mail#example')).toBe(
    'https://academy.example/guides/arrays',
  );
  expect(new URL(absoluteUrl('//another.example/path')).origin).toBe('https://academy.example');
  expect(site.image).toBe('https://academy.example/social-share.png');
});

it.each(['ftp://example.com', 'https://name:password@example.com'])(
  'rejects an unsupported public origin %s',
  (url) => {
    jest.resetModules();
    process.env.ROOT_URL = url;
    expect(() => require('../site')).toThrow('ROOT_URL');
  },
);

it.each([
  ['development', 'true', false],
  ['staging', 'true', false],
  ['production', 'false', false],
  ['production', 'true', true],
])('uses explicit indexing policy for %s and SITE_INDEXABLE=%s', (stage, indexable, expected) => {
  jest.resetModules();
  process.env.APP_STAGE = stage;
  process.env.SITE_INDEXABLE = indexable;
  const { site } = require('../site');
  expect(site.indexable).toBe(expected);
});
