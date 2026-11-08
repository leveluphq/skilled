import catalog from 'content/resources/catalog.json';
import walkthroughs from 'content/lesson-walkthroughs/catalog.json';
import videos from 'content/videos/catalog.json';
export {};

const original = { ROOT_URL: process.env.ROOT_URL, SITE_NAME: process.env.SITE_NAME };
afterEach(() => {
  for (const [key, value] of Object.entries(original)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  jest.resetModules();
});

it('lists the complete public resource inventory with the configured publisher and origin', () => {
  jest.resetModules();
  process.env.ROOT_URL = 'https://school.example';
  process.env.SITE_NAME = 'School [Code]';
  const { buildLlms } = require('../llms');
  const text = buildLlms();
  expect(text.startsWith('# School \\[Code\\]\n\n> ')).toBe(true);
  expect(text).not.toContain('skilled.dev');
  const links = Array.from(
    text.matchAll(/\]\((https:[^)]+)\)/g),
    (match: RegExpMatchArray) => match[1],
  );
  const expected = new Set([
    '/learn',
    '/interview-prep',
    '/course',
    ...catalog.map((r) => `/${r.section}/${r.slug}`),
    ...walkthroughs.map((page) => `/course/${page.lesson}/${page.language}`),
    ...videos.map((video) => `/watch/${video.slug}`),
  ]);
  expect(new Set(links.map((url) => new URL(url).pathname))).toEqual(expected);
  for (const url of links) expect(new URL(url).origin).toBe('https://school.example');
  for (const disallowed of [
    '/api/',
    '/my/',
    '/internal-docs/',
    '/course/knapsack',
    '/course/system-design',
  ])
    expect(text).not.toContain(disallowed);
  expect(text).toContain('individual lesson access varies');
});

it('keeps configuration and titles from creating extra Markdown headings or broken labels', () => {
  const { inlineText } = require('../llms');
  expect(inlineText('School\n\n## Hidden [link] \\ path')).toBe(
    'School ## Hidden \\[link\\] \\\\ path',
  );
});
