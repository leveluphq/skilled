import { parseRun } from 'services/server/runner/protocol';
import { judgeRun, RunOutcome } from 'services/server/runner/verdict';
import { defineSpec } from 'utils/shared/runner/spec';

const NONCE = 'n0nce';
const line = (message: object) => `${NONCE}${JSON.stringify(message)}\n`;

const spec = defineSpec({
  kind: 'function',
  entry: 'f',
  params: [{ name: 'n', type: 'int' }],
  returns: 'int',
  tests: [
    { description: 'one', args: [1], expected: 1 },
    { description: 'two', args: [2], expected: 2 },
  ],
});

const outcome = (overrides: Partial<RunOutcome> = {}): RunOutcome => ({
  statusId: 3,
  statusDescription: 'Accepted',
  stdout: Buffer.alloc(0),
  stderr: '',
  compileOutput: '',
  message: '',
  timeSeconds: 0.1,
  memoryKb: null,
  ...overrides,
});

const judge = (stdout: string, overrides: Partial<RunOutcome> = {}) =>
  judgeRun(
    spec,
    parseRun(stdout, NONCE, spec.tests.length),
    outcome({ stdout: Buffer.from(stdout), ...overrides }),
  );

const both = (out0: unknown, out1: unknown) =>
  line({ t: 'start', i: 0 }) +
  line({ t: 'result', i: 0, ok: true, out: out0 }) +
  line({ t: 'start', i: 1 }) +
  line({ t: 'result', i: 1, ok: true, out: out1 }) +
  line({ t: 'done' });

describe('judgeRun', () => {
  it('passes when every test passes and the run finished cleanly', () => {
    const verdict = judge(both(1, 2));

    expect(verdict.passed).toBe(true);
    expect(verdict.problem).toBeNull();
    expect(verdict.tests.map((test) => test.status)).toEqual(['passed', 'passed']);
  });

  it('fails a wrong answer and keeps it to show the learner', () => {
    const verdict = judge(both(1, 3));

    expect(verdict.passed).toBe(false);
    expect(verdict.tests[1]).toMatchObject({ status: 'failed', expected: 2, actual: 3 });
  });

  it('reports a compile error with no tests run', () => {
    const verdict = judge('', { statusId: 6, compileOutput: 'error: expected ;' });

    expect(verdict).toMatchObject({
      passed: false,
      problem: 'compile_error',
      problemDetail: 'error: expected ;',
    });
    expect(verdict.tests.map((test) => test.status)).toEqual(['not_run', 'not_run']);
  });

  it('blames a time-out on the test that was running', () => {
    const verdict = judge(line({ t: 'start', i: 0 }), { statusId: 5 });

    expect(verdict.problem).toBe('timed_out');
    expect(verdict.tests.map((test) => test.status)).toEqual(['timeout', 'not_run']);
  });

  it.each([
    ['a segfault', { statusId: 7, message: 'Exited with error status 139' }, 'Segmentation fault'],
    ['an abort', { statusId: 10, message: '' }, 'The program aborted'],
    [
      'a stack overflow',
      { statusId: 11, stderr: "thread 'main' has overflowed its stack" },
      'Stack overflow',
    ],
    [
      'a plain non-zero exit',
      { statusId: 11, message: 'Exited with error status 3' },
      'Exited with error status 3',
    ],
    [
      'running out of memory',
      { statusId: 12, message: 'Exited with error status 137' },
      'ran out of memory',
    ],
    ['printing too much', { statusId: 8 }, 'printed too much output'],
  ])('explains %s', (_label, overrides, detail) => {
    const verdict = judge(
      line({ t: 'start', i: 0 }) +
        line({ t: 'result', i: 0, ok: true, out: 1 }) +
        line({ t: 'start', i: 1 }),
      overrides,
    );

    expect(verdict.passed).toBe(false);
    expect(verdict.tests[0].status).toBe('passed');
    expect(verdict.tests[1].status).toBe('crashed');
    expect(verdict.problemDetail).toContain(detail);
  });

  it('says so when the code crashed before any test ran', () => {
    const verdict = judge('', {
      statusId: 11,
      stderr: 'SyntaxError: x',
      message: 'Exited with error status 1',
    });

    expect(verdict.problem).toBe('crashed_before_tests');
    expect(verdict.stderr).toBe('SyntaxError: x');
  });

  it("can't pass when the program exited cleanly before saying it was done", () => {
    const stdout =
      line({ t: 'start', i: 0 }) +
      line({ t: 'result', i: 0, ok: true, out: 1 }) +
      line({ t: 'start', i: 1 }) +
      line({ t: 'result', i: 1, ok: true, out: 2 });
    const verdict = judge(stdout);

    expect(verdict.tests.map((test) => test.status)).toEqual(['passed', 'passed']);
    expect(verdict).toMatchObject({ passed: false, problem: 'exited_early' });
  });

  it("can't pass when the harness output was out of order", () => {
    const verdict = judge(both(1, 2) + line({ t: 'start', i: 0 }));

    expect(verdict).toMatchObject({ passed: false, problem: 'anomaly' });
  });

  it("reports a runner failure separately from the learner's code", () => {
    expect(judge('', { statusId: 13, message: 'Internal Error' })).toMatchObject({
      passed: false,
      problem: 'runner_error',
    });
  });
});
