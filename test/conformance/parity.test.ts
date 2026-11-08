/**
 * Parity with the old runner. A live shadow run would spend the
 * website's Judge0 quota, so this compares the two offline, in the same Docker
 * images: each lesson's reference solution runs against the lesson's old tests
 * (its code, the tests and the validator, as the old runner sends them) and
 * against its spec. Both must pass, and every old test must be in the spec
 * with the same expected answer, so the new runner checks at least what the
 * old one did.
 */
import path from 'path';
import { runInDocker } from 'services/server/runner/backends/docker';
import { checkProgram } from 'services/server/runner/evaluate';
import { runtimeFor } from 'services/server/runner/runtimes';
import { DockerSettings, LanguageRuntime } from 'services/server/runner/runtimes/types';
import {
  SEPARATOR_STRING,
  fileHeaderForLanguage,
  validatorForLanguage,
} from 'utils/constants/codeRunner';
import { CodingLanguage } from 'utils/constants/lesson';
import { compareOutput } from 'utils/shared/runner/compare';
import { formatValue, parseJson } from 'utils/shared/runner/values';
import { loadSpecs } from './conformance';
import { FILE_FOR_LANGUAGE, LESSONS_DIR, readCode, referenceSolutions } from './lessonCode';

// The old runner's programs run in the same images as the new runner's
const LANGUAGES: [CodingLanguage, DockerSettings][] = [
  CodingLanguage.Javascript,
  CodingLanguage.Typescript,
  CodingLanguage.Python,
].map((language) => [language, (runtimeFor(language) as LanguageRuntime).docker]);

// Old tests the spec leaves out on purpose
const DROPPED: Record<string, string> = {
  'robot-maze/no board': 'The room is always a matrix, so a null room is not a valid input',
};

// TypeScript lessons ran the JavaScript tests
const TESTS_FILE: Partial<Record<CodingLanguage, string>> = {
  [CodingLanguage.Typescript]: FILE_FOR_LANGUAGE[CodingLanguage.Javascript],
};

// The spec reports an empty list or tree as [], where the old tests had null
const fromLegacy = (value: unknown, returns: string) =>
  value === null && /^(ListNode|BinaryNode)\??$/.test(returns) ? [] : value;

interface LegacyResult {
  passed: boolean;
  description: string;
  expected: unknown;
}

const runLegacy = async (language: CodingLanguage, settings: DockerSettings, program: string) => {
  const runtime = runtimeFor(language) as LanguageRuntime;
  const outcome = await runInDocker({ ...runtime, docker: settings }, program, '');
  const stdout = outcome.stdout.toString('utf8');
  const separator = stdout.lastIndexOf(SEPARATOR_STRING);

  if (separator < 0) {
    throw new Error(
      `The old tests reported no results (status ${outcome.statusId}):\n${outcome.compileOutput}${outcome.stderr}`.slice(
        0,
        2000,
      ),
    );
  }

  return (
    parseJson(stdout.slice(separator + SEPARATOR_STRING.length).trim()) as {
      results: LegacyResult[];
    }
  ).results;
};

describe.each(LANGUAGES)('%s parity with the old runner', (language, settings) => {
  const specs = loadSpecs();

  Object.keys(specs)
    .sort()
    .forEach((slug) => {
      const spec = specs[slug];
      const tests = readCode(
        path.join(LESSONS_DIR, slug, 'Tests', TESTS_FILE[language] || FILE_FOR_LANGUAGE[language]),
      );
      const solution = referenceSolutions(slug, language)[0];

      if (tests === null || !solution) {
        return;
      }

      it(`${slug}: the spec has every old test, with the same answer`, async () => {
        const program = `${fileHeaderForLanguage[language] || ''}${solution.code}\n${tests}\n${
          validatorForLanguage[language]
        }`;
        const [legacy, current] = await Promise.all([
          runLegacy(language, settings, program),
          checkProgram(spec, language, solution.code),
        ]);
        const problems: string[] = [];

        legacy
          .filter((result) => result.passed !== true)
          .forEach((result) => problems.push(`fails the old test "${result.description}"`));

        if (!current.ok || !current.evaluation.verdict.passed) {
          problems.push('fails the spec');
        }

        const descriptions = (spec.tests as { description: string }[]).map(
          (test) => test.description,
        );

        legacy.forEach((result) => {
          const index = descriptions.indexOf(result.description);

          if (index < 0) {
            if (DROPPED[`${slug}/${result.description}`]) {
              return;
            }

            problems.push(`the old test "${result.description}" isn't in the spec`);
            return;
          }

          // Design tests check a sequence of calls; the old ones don't share its shape
          if (spec.kind === 'function') {
            const matching = spec.tests[index];

            const expected = fromLegacy(result.expected, spec.returns);

            if (!compareOutput(spec.compare, expected, matching.expected, matching.args)) {
              problems.push(
                `"${result.description}" expects ${formatValue(
                  result.expected,
                )} in the old test, ${formatValue(matching.expected)} in the spec`,
              );
            }
          }
        });

        expect(problems).toEqual([]);
      });
    });
});
