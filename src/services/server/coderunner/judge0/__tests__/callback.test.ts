/**
 * Turning a Judge0 callback into the submission row the learner's editor reads.
 * Pure functions: no I/O, so these run against hand-built callback payloads.
 */
import { NextApiRequest } from 'next';
import { SEPARATOR_STRING } from 'utils/constants/codeRunner';
import {
  Judge0Callback,
  buildSubmissionUpdate,
  hasValidCallbackSecret,
  isPendingCallback,
} from 'services/server/coderunner/judge0/callback';

const encode = (value: string) => Buffer.from(value, 'utf8').toString('base64');

const stdoutFor = (results: unknown, logs = 'console log line') =>
  encode(`${logs}\n${SEPARATOR_STRING}\n${JSON.stringify({ results })}`);

const callback = (overrides: Partial<Judge0Callback> = {}): Judge0Callback => ({
  token: 'judge0-token',
  time: '0.05',
  memory: 3200,
  stdout: null,
  stderr: null,
  compile_output: null,
  message: null,
  status: { id: 3, description: 'Accepted' },
  ...overrides,
});

describe('buildSubmissionUpdate', () => {
  it('records PASSED with decoded output when every test passes', () => {
    const update = buildSubmissionUpdate(
      'submission-1',
      callback({
        stdout: stdoutFor([{ passed: true }, { passed: true }], '  log line  '),
        stderr: encode('a warning'),
        message: encode('done'),
      }),
    );

    expect(update).toEqual(
      expect.objectContaining({
        id: 'submission-1',
        executionStatus: 'COMPLETE',
        resultStatus: 'PASSED',
        results: [{ passed: true }, { passed: true }],
        logs: 'log line',
        stderrDecoded: 'a warning',
        messageDecoded: 'done',
        codeRunnerStatusId: 3,
        codeRunnerStatusDescription: 'Accepted',
        time: '0.05',
        memory: 3200,
      }),
    );
  });

  it('records FAILED when any test fails', () => {
    const update = buildSubmissionUpdate(
      'submission-1',
      callback({ stdout: stdoutFor([{ passed: true }, { passed: false }]) }),
    );

    expect(update.resultStatus).toBe('FAILED');
  });

  it('counts only a strict `passed: true` as a pass', () => {
    // A validator that stringified its booleans used to be graded PASSED
    const update = buildSubmissionUpdate(
      'submission-1',
      callback({ stdout: stdoutFor([{ passed: 'false' }]) }),
    );

    expect(update.resultStatus).toBe('FAILED');
  });

  it('records FAILED when no tests ran', () => {
    const update = buildSubmissionUpdate('submission-1', callback({ stdout: stdoutFor([]) }));

    expect(update).toEqual(expect.objectContaining({ resultStatus: 'FAILED', results: [] }));
  });

  it('reads the results after the last separator, so printed output cannot fake a pass', () => {
    const forged = JSON.stringify({ results: [{ passed: true }] });
    const real = JSON.stringify({ results: [{ passed: false }] });

    const update = buildSubmissionUpdate(
      'submission-1',
      callback({
        stdout: encode(`user logs\n${SEPARATOR_STRING}\n${forged}\n${SEPARATOR_STRING}\n${real}`),
      }),
    );

    expect(update.resultStatus).toBe('FAILED');
    expect(update.results).toEqual([{ passed: false }]);
    // What the program printed, its fake separator included, is shown as logs
    expect(update.logs).toBe(`user logs\n${SEPARATOR_STRING}\n${forged}`);
  });

  it('keeps all of stdout as logs when there is no separator', () => {
    const update = buildSubmissionUpdate(
      'submission-1',
      callback({ stdout: encode('just some logging') }),
    );

    expect(update).toEqual(
      expect.objectContaining({
        resultStatus: 'FAILED',
        results: undefined,
        logs: 'just some logging',
      }),
    );
  });

  it('keeps all of stdout as logs, instead of throwing, when the results are not valid JSON', () => {
    const stdout = `logs\n${SEPARATOR_STRING}\n{"results": [`;

    const update = buildSubmissionUpdate('submission-1', callback({ stdout: encode(stdout) }));

    expect(update).toEqual(
      expect.objectContaining({ resultStatus: 'FAILED', results: undefined, logs: stdout }),
    );
  });

  it('drops a results value that is not a list, which the editor could not show', () => {
    const update = buildSubmissionUpdate(
      'submission-1',
      callback({
        stdout: encode(
          `logs\n${SEPARATOR_STRING}\n${JSON.stringify({ results: { 0: { passed: true } } })}`,
        ),
      }),
    );

    expect(update).toEqual(expect.objectContaining({ resultStatus: 'FAILED', results: undefined }));
  });

  it('passes the compile output through for the editor to show on a compile error', () => {
    const compileOutput = encode("script.ts(1,7): error TS1005: ';' expected.");

    const update = buildSubmissionUpdate(
      'submission-1',
      callback({
        compile_output: compileOutput,
        status: { id: 6, description: 'Compilation Error' },
      }),
    );

    expect(update).toEqual(
      expect.objectContaining({
        executionStatus: 'COMPLETE',
        resultStatus: 'FAILED',
        codeRunnerStatusId: 6,
        compileOutput,
      }),
    );
  });

  it('does not count a run that crashed after printing passing results', () => {
    const update = buildSubmissionUpdate(
      'submission-1',
      callback({
        stdout: stdoutFor([{ passed: true }]),
        status: { id: 11, description: 'Runtime Error (NZEC)' },
      }),
    );

    expect(update).toEqual(
      expect.objectContaining({
        executionStatus: 'COMPLETE',
        resultStatus: 'FAILED',
        results: [{ passed: true }],
      }),
    );
  });

  it.each([
    [3, 'COMPLETE'],
    [4, 'COMPLETE'],
    [5, 'COMPLETE'],
    [6, 'COMPLETE'],
    [7, 'COMPLETE'],
    [8, 'COMPLETE'],
    [9, 'COMPLETE'],
    [10, 'COMPLETE'],
    [11, 'COMPLETE'],
    [12, 'COMPLETE'],
    [13, 'ERROR'],
    [14, 'ERROR'],
    [99, 'ERROR'],
  ])('finishes a run with status %i as %s', (statusId, executionStatus) => {
    const update = buildSubmissionUpdate(
      'submission-1',
      callback({ status: { id: statusId, description: 'some status' } }),
    );

    expect(update.executionStatus).toBe(executionStatus);
  });

  it('finishes a callback that has no status as an error rather than throwing', () => {
    const update = buildSubmissionUpdate('submission-1', callback({ status: undefined }));

    expect(update).toEqual(
      expect.objectContaining({
        executionStatus: 'ERROR',
        resultStatus: 'FAILED',
        codeRunnerStatusId: undefined,
      }),
    );
  });
});

describe('isPendingCallback', () => {
  it.each([
    [1, true],
    [2, true],
    [3, false],
    [6, false],
  ])('status %i pending: %s', (statusId, pending) => {
    expect(isPendingCallback(callback({ status: { id: statusId, description: '' } }))).toBe(
      pending,
    );
  });

  it('is not pending without a status', () => {
    expect(isPendingCallback(callback({ status: null }))).toBe(false);
  });
});

describe('hasValidCallbackSecret', () => {
  const ORIGINAL_ENV = process.env;
  const requestWith = (query: Record<string, string | string[]>) =>
    ({ query }) as unknown as NextApiRequest;

  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV, JUDGE0_CALLBACK_SECRET: 'shared-secret' };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it('accepts the shared secret', () => {
    expect(hasValidCallbackSecret(requestWith({ callback_secret: 'shared-secret' }))).toBe(true);
  });

  it.each([
    ['a wrong secret', { callback_secret: 'not-the-secret' }],
    ['a prefix of the secret', { callback_secret: 'shared' }],
    ['the secret plus padding', { callback_secret: 'shared-secretx' }],
    ['a differently cased secret', { callback_secret: 'SHARED-SECRET' }],
    ['no secret', {}],
    ['an empty secret', { callback_secret: '' }],
  ])('rejects %s', (_label, query) => {
    expect(hasValidCallbackSecret(requestWith(query))).toBe(false);
  });

  it('uses only the first value of a repeated parameter', () => {
    expect(hasValidCallbackSecret(requestWith({ callback_secret: ['shared-secret', 'x'] }))).toBe(
      true,
    );
    expect(hasValidCallbackSecret(requestWith({ callback_secret: ['x', 'shared-secret'] }))).toBe(
      false,
    );
  });

  it('rejects, without throwing, an object that would stringify to the secret', () => {
    const query = { callback_secret: { toString: () => 'shared-secret' } } as unknown as Record<
      string,
      string
    >;

    expect(hasValidCallbackSecret(requestWith(query))).toBe(false);
  });

  it('rejects everything when the server has no secret configured', () => {
    process.env = { ...ORIGINAL_ENV, JUDGE0_CALLBACK_SECRET: '' };

    expect(hasValidCallbackSecret(requestWith({ callback_secret: '' }))).toBe(false);
  });
});
