/**
 * The runner's generated modules must match their sources, and every lesson
 * spec must be valid.
 */
import fs from 'fs';
import specs from 'content/runnerSpecs.gen';
import { validateSpec } from 'utils/shared/runner/spec';
import { runtimes } from 'services/server/runner/runtimes';
import { LanguageRuntime } from 'services/server/runner/runtimes/types';

/* eslint-disable @typescript-eslint/no-var-requires */
const preludes = require('../../../../../scripts/generate-runner-preludes');
const specRegistry = require('../../../../../scripts/generate-runner-specs');
const lessonLanguages = require('../../../../../scripts/generate-lesson-languages');
const languageImports = require('../../../../../scripts/add-language-imports');
const { IMAGES } = require('../../../../../scripts/runner-images');
const lessonSnippets = require('../../../../../scripts/lesson-snippets');
/* eslint-enable @typescript-eslint/no-var-requires */

describe('generated runner modules', () => {
  it.each([
    ['preludes.gen.ts', preludes],
    ['runnerSpecs.gen.ts', specRegistry],
    ['lessonLanguages.gen.ts', lessonLanguages],
  ])('%s is up to date (run `npm run runner:generate`)', (_name, generator) => {
    expect(fs.readFileSync(generator.output, 'utf8')).toBe(generator.generate());
  });
});

it('imports every lesson code file (run `node scripts/add-language-imports.js`)', () => {
  expect(
    languageImports.changes().map((change: { indexFile: string }) => change.indexFile),
  ).toEqual([]);
});

it("lists every runtime's Docker image in scripts/runner-images.js", () => {
  const listed = (Object.values(IMAGES) as { image: string }[]).map((entry) => entry.image).sort();
  const used = Object.values(runtimes)
    .map((runtime) => (runtime as LanguageRuntime).docker.image)
    .sort();

  expect(listed).toEqual(used);
});

describe('lesson snippets', () => {
  it.each((lessonSnippets.LANGUAGES as [string][]).map(([language]) => language))(
    'every code block and inline snippet has %s (node scripts/lesson-snippets.js --missing)',
    (language) => {
      const { folders, inline } = lessonSnippets.missingIn(language);

      expect({ folders, inline }).toEqual({ folders: [], inline: [] });
    },
  );
});

describe('lesson specs', () => {
  it('has at least one spec', () => {
    expect(Object.keys(specs).length).toBeGreaterThan(0);
  });

  it.each(Object.keys(specs).sort())('%s is valid', (slug) => {
    expect(validateSpec(specs[slug])).toEqual([]);
  });
});
