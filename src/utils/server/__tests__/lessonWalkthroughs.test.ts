import catalog from 'content/lesson-walkthroughs/catalog.json';
import policy from 'content/lesson-walkthroughs/coverage.json';
import { readFileSync } from 'fs';
import { join } from 'path';

it('validates every edited walkthrough and keeps its generated public route current', () => {
  const { validateWalkthroughs } = require('../../../scripts/generateWalkthroughs');
  const entries = validateWalkthroughs();
  expect(entries).toHaveLength(catalog.length);
  expect(catalog.length).toBeGreaterThan(0);
  for (const slug of new Set(catalog.map((page) => page.lesson))) {
    expect(
      catalog
        .filter((page) => page.lesson === slug)
        .map((page) => page.language)
        .sort(),
    ).toEqual(
      policy
        .find((entry) => entry.lesson === slug)!
        .languages.slice()
        .sort(),
    );
  }
  for (const { page, info } of entries) {
    const route = readFileSync(
      join(process.cwd(), 'src/pages/course', page.lesson, `${page.language}.tsx`),
      'utf8',
    );
    expect(route).toContain(JSON.stringify(page));
    expect(route).toContain(`headings={${JSON.stringify(info.headings)}}`);
    expect(route).toContain(`minutes={${info.minutes}}`);
    expect(route).not.toContain('withApollo');
  }
});
