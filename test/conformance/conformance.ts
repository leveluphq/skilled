import fs from 'fs';
import path from 'path';
import { checkProgram, CheckResult } from 'services/server/runner/evaluate';
import { CodingLanguage } from 'utils/constants/lesson';
import { validateSpec } from 'utils/shared/runner/spec';
import { LessonSpec } from 'utils/shared/runner/types';
import { formatValue } from 'utils/shared/runner/values';
import { LESSONS_DIR, referenceSolutions, starterCode } from './lessonCode';

// Read straight from the lesson folders rather than the generated registry, so
// a new spec is checked before the registry is regenerated
export const loadSpecs = (): Record<string, LessonSpec> => {
  const specs: Record<string, LessonSpec> = {};

  fs.readdirSync(LESSONS_DIR)
    .filter((slug) => fs.existsSync(path.join(LESSONS_DIR, slug, 'runner.spec.ts')))
    .forEach((slug) => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      specs[slug] = require(path.join(LESSONS_DIR, slug, 'runner.spec.ts')).default;
    });

  return specs;
};

// What went wrong, readably, for a failed expectation
const explain = (result: CheckResult) => {
  if (!result.ok) {
    return `Could not build the program: ${result.errors.join('; ')}`;
  }

  const { verdict } = result.evaluation;
  const lines = [];

  if (verdict.problem) {
    lines.push(`Run problem: ${verdict.problem}: ${verdict.problemDetail}`);
  }

  verdict.tests
    .filter((test) => test.status !== 'passed')
    .forEach((test) => {
      lines.push(
        `- ${test.description}: ${test.status}` +
          (test.status === 'failed'
            ? ` (expected ${formatValue(test.expected)}, got ${formatValue(test.actual)})`
            : '') +
          (test.error ? ` (${test.error})` : ''),
      );
    });

  result.evaluation.diagnostics.forEach((diagnostic) =>
    lines.push(
      `Diagnostic${diagnostic.line ? ` on line ${diagnostic.line}` : ''}: ${diagnostic.message}`,
    ),
  );

  if (verdict.stderr.trim()) {
    lines.push(`stderr: ${verdict.stderr.trim().slice(0, 1500)}`);
  }

  if (verdict.outsideLogs.trim()) {
    lines.push(`Printed outside the tests: ${verdict.outsideLogs.trim().slice(0, 500)}`);
  }

  return lines.join('\n');
};

export const defineConformanceTests = (language: CodingLanguage) => {
  const specs = loadSpecs();
  const lessons = Object.keys(specs).sort();

  describe(`${language} conformance`, () => {
    lessons.forEach((slug) => {
      const spec = specs[slug];
      const solutions = referenceSolutions(slug, language);
      const starter = starterCode(slug, language);

      if (!solutions.length && starter === null) {
        return;
      }

      describe(slug, () => {
        it('has a valid spec', () => {
          expect(validateSpec(spec)).toEqual([]);
        });

        solutions.forEach(({ label, code }) => {
          it(`reference solution ${label} passes every test`, async () => {
            const result = await checkProgram(spec, language, code);

            if (!result.ok || !result.evaluation.verdict.passed) {
              throw new Error(explain(result));
            }
          });
        });

        if (starter !== null) {
          it('starter code runs every test and fails at least one', async () => {
            const result = await checkProgram(spec, language, starter);

            if (!result.ok) {
              throw new Error(explain(result));
            }

            const { verdict } = result.evaluation;
            const ranEveryTest = verdict.tests.every((test) => test.status !== 'not_run');
            const crashed = verdict.problem !== null;

            if (crashed || !ranEveryTest || verdict.passed) {
              throw new Error(
                verdict.passed
                  ? 'The unchanged starter passes every test'
                  : `The starter didn't run cleanly:\n${explain(result)}`,
              );
            }
          });
        }
      });
    });
  });
};
