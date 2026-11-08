/**
 * Control programs for every language's harness (docs/adding-a-language.md,
 * "Controls and conformance"): the ways learner code
 * misbehaves, and what the runner must report for each. Each language's
 * programs are in controls/<language>.ts.
 */
import fs from 'fs';
import path from 'path';
import { runInDocker } from 'services/server/runner/backends/docker';
import { checkProgram } from 'services/server/runner/evaluate';
import { runtimeFor } from 'services/server/runner/runtimes';
import { LanguageRuntime } from 'services/server/runner/runtimes/types';
import { CodingLanguage } from 'utils/constants/lesson';
import { defineSpec } from 'utils/shared/runner/spec';
import { LanguageControls } from './controls/types';

const LANGUAGES: LanguageControls[] = fs
  .readdirSync(path.join(__dirname, 'controls'))
  .filter((file) => file.endsWith('.ts') && file !== 'types.ts')
  .sort()
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  .map((file) => require(path.join(__dirname, 'controls', file)).default);

// add(a, b), where the third test is the one the controls misbehave on
const spec = defineSpec({
  kind: 'function',
  entry: 'addNumbers',
  params: [
    { name: 'a', type: 'int' },
    { name: 'b', type: 'int' },
  ],
  returns: 'int',
  tests: [
    { description: 'small', args: [1, 2], expected: 3 },
    { description: 'zero', args: [0, 0], expected: 0 },
    { description: 'the third', args: [7, 7], expected: 14 },
    { description: 'negative', args: [-5, 2], expected: -3 },
  ],
});

const run = async (language: CodingLanguage, code: string) => {
  const result = await checkProgram(spec, language, code);

  if (!result.ok) {
    throw new Error(result.errors.join('; '));
  }

  return { ...result.evaluation, stderr: result.outcome.stderr };
};

describe.each(LANGUAGES.map((controls) => [controls.name, controls] as const))(
  '%s harness',
  (_name, controls) => {
    const { language } = controls;
    it('passes a correct solution', async () => {
      const { verdict } = await run(language, controls.correct);

      expect(verdict.problem).toBeNull();
      expect(verdict.tests.map((test) => test.status)).toEqual([
        'passed',
        'passed',
        'passed',
        'passed',
      ]);
      expect(verdict.passed).toBe(true);
    });

    it('reports an exception on the test that threw, and keeps running the rest', async () => {
      const { verdict } = await run(language, controls.throwsOnThird);

      expect(verdict.tests.map((test) => test.status)).toEqual([
        'passed',
        'passed',
        'error',
        'passed',
      ]);
      expect(verdict.tests[2].error).toMatch(/no sevens/);
      expect(verdict.passed).toBe(false);
    });

    it('keeps earlier results when the program exits mid-run, and blames the running test', async () => {
      const { verdict } = await run(language, controls.exitsOnThird);

      expect(verdict.tests.map((test) => test.status)).toEqual([
        'passed',
        'passed',
        'crashed',
        'not_run',
      ]);
      expect(verdict.problem).toBe('crashed');
      expect(verdict.problemDetail).toBe('Exited with error status 3');
    });

    it('reports a time-out on the test that never finished', async () => {
      const { verdict, stderr } = await run(language, controls.loopsOnThird);

      expect(verdict.tests.map((test) => test.status)).toEqual([
        'passed',
        'passed',
        'timeout',
        'not_run',
      ]);
      expect(verdict.problem).toBe('timed_out');
      // As on Judge0, no shell reports the signal
      expect(stderr).toBe('');
    });

    it("treats the learner's prints as that test's logs, even a fake result line", async () => {
      const { verdict } = await run(language, controls.prints);

      expect(verdict.passed).toBe(true);
      expect(verdict.tests[0].logs).toContain('debug 1');
      expect(verdict.tests[1].logs).toContain('debug 0');
    });

    it("places a syntax error on the learner's own line", async () => {
      const { verdict, diagnostics } = await run(language, controls.syntaxErrorOnLine7);

      expect(verdict.passed).toBe(false);
      expect(diagnostics.length).toBeGreaterThan(0);
      expect(diagnostics[0].line).toBe(7);
    });

    it('keeps what was written to stderr before a test ran out of time', async () => {
      const { verdict, stderr } = await run(language, controls.writesStderrThenLoops);

      expect(verdict.problem).toBe('timed_out');
      expect(stderr).toBe('stuck\n');
    });

    const shadowsHarnessNames = controls.shadowsHarnessNames;

    if (shadowsHarnessNames) {
      it("can't be broken by code that reuses the harness's names", async () => {
        const { verdict } = await run(language, shadowsHarnessNames);

        expect(verdict.passed).toBe(true);
      });
    }

    const iteratesSetsAndMaps = controls.iteratesSetsAndMaps;

    if (iteratesSetsAndMaps) {
      it('iterates Sets and Maps (compiled for ES2022, not ES3)', async () => {
        const { verdict } = await run(language, iteratesSetsAndMaps);

        expect(verdict.passed).toBe(true);
      });
    }

    const { missingClosingBrace, wrongSignature, ignoresCpuSignalThenLoops } = controls;

    if (ignoresCpuSignalThenLoops) {
      it('reports a time-out even when the program ignores the CPU limit signal', async () => {
        const { verdict } = await run(language, ignoresCpuSignalThenLoops);

        expect(verdict.problem).toBe('timed_out');
        expect(verdict.tests.map((test) => test.status)).toEqual([
          'passed',
          'passed',
          'timeout',
          'not_run',
        ]);
      });
    }

    if (missingClosingBrace) {
      it('reports a missing closing brace as such', async () => {
        const { verdict, diagnostics } = await run(language, missingClosingBrace);

        expect(verdict.problem).toBe('compile_error');
        expect(diagnostics.map((diagnostic) => diagnostic.message).join('\n')).toMatch(
          /`}` is missing/,
        );
      });
    }

    if (wrongSignature) {
      it("explains a method that doesn't match what the tests call", async () => {
        const { verdict, diagnostics } = await run(language, wrongSignature);

        expect(verdict.problem).toBe('compile_error');
        expect(diagnostics.map((diagnostic) => diagnostic.message).join('\n')).toMatch(
          /doesn't match what the tests call/,
        );
      });
    }

    const deepRecursion = controls.deepRecursion;

    if (deepRecursion) {
      it('has room for deep recursion', async () => {
        const { verdict } = await run(language, deepRecursion);

        expect(verdict.passed).toBe(true);
      });
    }
  },
);

// A lesson whose code calls a function the tests provide, like isBadVersion.
// Learners often keep a stub of it from testing on their own machine; the
// tests' version must still be the one called.
const injectedSpec = defineSpec({
  kind: 'function',
  entry: 'countBelow',
  params: [{ name: 'n', type: 'int' }],
  hidden: [{ name: 'limit', type: 'int' }],
  injected: {
    name: 'isBelow',
    baseClass: 'Checker',
    params: [{ name: 'value', type: 'int' }],
    returns: 'bool',
    body: LANGUAGES.reduce(
      (bodies, controls) =>
        controls.injectedBody ? { ...bodies, [controls.language]: controls.injectedBody } : bodies,
      {},
    ),
  },
  returns: 'int',
  tests: [
    { description: 'some below', args: [10], hidden: [4], expected: 4 },
    { description: 'none below', args: [10], hidden: [0], expected: 0 },
  ],
});

describe.each(LANGUAGES.map((controls) => [controls.name, controls] as const))(
  '%s harness, with a function the tests provide',
  (_name, controls) => {
    it("calls the tests' version even when the learner wrote a stub of it", async () => {
      const result = await checkProgram(injectedSpec, controls.language, controls.stubsInjected);

      if (!result.ok) {
        throw new Error(result.errors.join('; '));
      }

      expect(result.evaluation.verdict.tests.map((test) => test.status)).toEqual([
        'passed',
        'passed',
      ]);
    });
  },
);

describe('the Docker backend', () => {
  it('says how to get an image that is missing, without pulling it', async () => {
    const runtime = runtimeFor(CodingLanguage.Javascript) as LanguageRuntime;
    const outcome = await runInDocker(
      { ...runtime, docker: { ...runtime.docker, image: 'skilled-runner/not-built:0' } },
      'console.log(1);\n',
      '',
    );

    expect(outcome.statusId).toBe(13);
    expect(outcome.message).toBe(
      "The Docker image skilled-runner/not-built:0 isn't available. Run `npm run runner:images` to build it.",
    );
  });
});
