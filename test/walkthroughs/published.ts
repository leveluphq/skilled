import fs from 'fs';
import path from 'path';
import manifest from '../../src/content/lesson-walkthroughs/curriculum/manifest.json';
import { readCode, LESSONS_DIR } from '../conformance/lessonCode';
import { buildProgram } from 'services/server/runner/program';
import { evaluate } from 'services/server/runner/evaluate';
import { CodingLanguage } from 'utils/constants/lesson';
import { LessonSpec } from 'utils/shared/runner/types';
import { withGeneratedCases } from './cases';
import { runPublished } from './native';

export function definePublishedTests(language: CodingLanguage) {
  const selected = (process.env.WALKTHROUGH_LANGUAGES || 'javascript,typescript,python').split(',');
  const describeLanguage =
    selected.includes(language.toLowerCase()) || selected.includes('all')
      ? describe
      : describe.skip;
  describeLanguage(`${language} published curriculum`, () => {
    for (const entry of manifest)
      it(`${entry.lesson}: published code passes contract and independent cases`, async () => {
        const slug = language.toLowerCase();
        const file = path.resolve(
          __dirname,
          '../../src/content/lesson-walkthroughs',
          entry.lesson,
          `${slug}.mdx`,
        );
        const published = readCode(file);
        expect(published).toBeTruthy();
        // This assertion prevents an editor from changing only the reference asset
        // while the public page keeps showing an older implementation.
        expect(published!.trim()).toBe(
          readCode(
            path.join(LESSONS_DIR, entry.lesson, 'Solution/code', entry.variant, `${slug}.mdx`),
          )!.trim(),
        );
        expect(fs.readFileSync(file, 'utf8')).toContain(
          entry.notes[slug as keyof typeof entry.notes],
        );
        const original: LessonSpec = require(
          path.join(LESSONS_DIR, entry.lesson, 'runner.spec.ts'),
        ).default;
        const spec = withGeneratedCases(entry.lesson, original);
        const result = buildProgram(spec, language, published!);
        if (!result.ok) throw new Error(result.errors.join('\n'));
        const outcome = await runPublished(result.program);
        const verdict = evaluate(spec, result.program, outcome).verdict;
        if (!verdict.passed)
          throw new Error(
            JSON.stringify(
              {
                problem: verdict.problem,
                detail: verdict.problemDetail,
                tests: verdict.tests.filter((t) => t.status !== 'passed').slice(0, 4),
                stderr: verdict.stderr,
              },
              null,
              2,
            ),
          );
      });
  });
}
