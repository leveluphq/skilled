/**
 * Every way a run can end, and what the results pane shows for it. Before this
 * existed, compile errors, time-outs, crashes with no stderr and runner failures
 * all left the learner watching the loading animation.
 */
import getSubmissionOutcome from '../submissionOutcome';
import { Results, ErrorMessage, CompileError, RunProblem } from '../ExecutionResults';
import RunnerResults from '../RunnerResults';

const encode = (value: string) => Buffer.from(value, 'utf8').toString('base64');

const submission = (overrides: Record<string, unknown> = {}) =>
  ({
    executionStatus: 'COMPLETE',
    codeRunnerStatusId: 3,
    codeRunnerStatusDescription: 'Accepted',
    results: null,
    logs: null,
    stderrDecoded: null,
    messageDecoded: null,
    compileOutput: null,
    ...overrides,
  }) as any;

describe('getSubmissionOutcome', () => {
  it('shows the test results', () => {
    const results = [{ passed: false, description: 'adds', expected: 2, userAnswer: 3 }];

    const { element, isUnexpected } = getSubmissionOutcome(
      submission({ results, logs: 'printed', stderrDecoded: 'a warning' }),
    );

    expect(element.type).toBe(Results);
    expect(element.props).toEqual({ results, logs: 'printed', err: 'a warning' });
    expect(isUnexpected).toBeFalsy();
  });

  it('shows the decoded compiler output for a compile error, at the line in the editor', () => {
    // The compiled file starts with a `// @ts-nocheck` line the learner never sees
    const { element } = getSubmissionOutcome(
      submission({
        language: 'TYPESCRIPT',
        codeRunnerStatusId: 6,
        compileOutput: encode(
          "script.ts(3,15): error TS1005: ',' expected.\nscript.ts(12,1): error TS1128: Declaration expected.\n",
        ),
      }),
    );

    expect(element.type).toBe(CompileError);
    expect(element.props.output).toBe(
      "Line 2, column 15: error TS1005: ',' expected.\nLine 11, column 1: error TS1128: Declaration expected.",
    );
  });

  it('leaves compiler output it cannot place unchanged', () => {
    const { element } = getSubmissionOutcome(
      submission({
        language: 'TYPESCRIPT',
        codeRunnerStatusId: 6,
        compileOutput: encode('Compilation time limit exceeded.'),
      }),
    );

    expect(element.props.output).toBe('Compilation time limit exceeded.');
  });

  it('shows the error output of a run that crashed', () => {
    const { element } = getSubmissionOutcome(
      submission({
        codeRunnerStatusId: 11,
        stderrDecoded: 'ReferenceError: x is not defined',
        logs: 'before',
      }),
    );

    expect(element.type).toBe(ErrorMessage);
    expect(element.props).toEqual({ message: 'ReferenceError: x is not defined', logs: 'before' });
  });

  it('explains a time-out, keeping whatever was printed', () => {
    const { element } = getSubmissionOutcome(submission({ codeRunnerStatusId: 5, logs: 'step 1' }));

    expect(element.type).toBe(RunProblem);
    expect(element.props).toMatchObject({ title: 'Time limit exceeded', logs: 'step 1' });
  });

  it("explains a crash that wrote nothing to stderr, using Judge0's message", () => {
    const { element } = getSubmissionOutcome(
      submission({
        codeRunnerStatusId: 7,
        codeRunnerStatusDescription: 'Runtime Error (SIGSEGV)',
        messageDecoded: 'Exited with error status 139',
      }),
    );

    expect(element.type).toBe(RunProblem);
    expect(element.props).toMatchObject({
      title: 'Your code crashed',
      detail: 'Exited with error status 139',
    });
  });

  it('falls back to the status description for a crash with no message', () => {
    const { element } = getSubmissionOutcome(
      submission({ codeRunnerStatusId: 8, codeRunnerStatusDescription: 'Runtime Error (SIGXFSZ)' }),
    );

    expect(element.props.detail).toBe('Runtime Error (SIGXFSZ)');
  });

  it('explains a runner failure, and flags it as unexpected', () => {
    const { element, isUnexpected } = getSubmissionOutcome(
      submission({ executionStatus: 'ERROR', codeRunnerStatusId: 13 }),
    );

    expect(element.type).toBe(RunProblem);
    expect(element.props.title).toBe('Something went wrong');
    expect(isUnexpected).toBe(true);
  });

  it('explains a run that reported no tests, and flags it as unexpected', () => {
    const { element, isUnexpected } = getSubmissionOutcome(
      submission({ results: [], logs: 'hello' }),
    );

    expect(element.type).toBe(RunProblem);
    expect(element.props).toMatchObject({ title: 'No test results', logs: 'hello' });
    expect(isUnexpected).toBe(true);
  });
});

describe('getSubmissionOutcome, for the new runner', () => {
  const runnerResults = (overrides: Record<string, unknown> = {}) => ({
    version: 2,
    tests: [{ description: 'adds', status: 'passed', expected: 2, actual: 2, logs: '', ms: 1 }],
    problem: null,
    problemDetail: null,
    ...overrides,
  });

  it('shows the judged tests, with compile errors placed in the editor', () => {
    const onSelectLine = jest.fn();
    const diagnostics = [{ line: 3, column: 1, message: 'expected ;' }];

    const { element, isUnexpected } = getSubmissionOutcome(
      submission({
        runnerVersion: 'typescript-1',
        results: runnerResults({ problem: 'compile_error' }),
        compileOutputDecoded: 'script.ts(3,1): error',
        diagnostics,
        logs: 'printed',
      }),
      { onSelectLine },
    );

    expect(element.type).toBe(RunnerResults);
    expect(element.props).toMatchObject({
      outsideLogs: 'printed',
      compileOutput: 'script.ts(3,1): error',
      diagnostics,
      onSelectLine,
    });
    expect(isUnexpected).toBeFalsy();
  });

  it('flags a run the runner could not finish as unexpected', () => {
    const { isUnexpected } = getSubmissionOutcome(
      submission({
        runnerVersion: 'python-1',
        executionStatus: 'ERROR',
        results: runnerResults({ problem: 'runner_error' }),
      }),
    );

    expect(isUnexpected).toBe(true);
  });

  it('treats a row without a runner version as an old one', () => {
    const { element } = getSubmissionOutcome(
      submission({ results: [{ passed: true, description: 'adds' }] }),
    );

    expect(element.type).toBe(Results);
  });
});
