/**
 * /api/v1/judge0/refresh/[token]
 *
 * The fallback for a Judge0 callback that never arrives: the editor asks while
 * it waits, and this fetches the result from Judge0 and records it. Mocked at
 * the I/O boundary: the GraphQL reads and writes, Judge0, and the viewer.
 */
import { createMocks, RequestMethod } from 'node-mocks-http';
import { NextApiRequest, NextApiResponse } from 'next';
import { SEPARATOR_STRING } from 'utils/constants/codeRunner';

jest.mock('isomorphic-unfetch', () =>
  jest.fn(() => {
    throw new Error('network access attempted in test');
  }),
);
jest.mock('services/server/coderunner/judge0/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
}));
jest.mock('services/server/graphql/mutations/updateCodeSubmissionResults', () => jest.fn());
jest.mock('services/server/graphql/mutations/claimCodeSubmissionRefresh', () => jest.fn());
jest.mock('services/server/graphql/queries/getCodeSubmissionToRefresh', () => jest.fn());
jest.mock('utils/server/jwt', () => ({ getValidViewerId: jest.fn() }));

import api from 'services/server/coderunner/judge0/api';
import updateCodeSubmissionResults from 'services/server/graphql/mutations/updateCodeSubmissionResults';
import claimCodeSubmissionRefresh from 'services/server/graphql/mutations/claimCodeSubmissionRefresh';
import getCodeSubmissionToRefresh from 'services/server/graphql/queries/getCodeSubmissionToRefresh';
import { getValidViewerId } from 'utils/server/jwt';
import countIslandsSpec from 'content/lessons/count-islands/runner.spec';
import handler, { LOOKUP_INTERVAL_MS } from 'pages/api/v1/judge0/refresh/[token]';

const mockJudge0Get = api.get as unknown as jest.Mock;
const mockUpdate = updateCodeSubmissionResults as unknown as jest.Mock;
const mockClaim = claimCodeSubmissionRefresh as unknown as jest.Mock;
const mockGetSubmission = getCodeSubmissionToRefresh as unknown as jest.Mock;
const mockViewerId = getValidViewerId as unknown as jest.Mock;

const TOKEN = '6a3b1d2e-0f4c-4b5a-9e8d-7c6b5a4f3e2d';
const NONCE = '0123456789abcdef0123456789abcdef';
const ORIGINAL_ENV = process.env;

const encode = (value: string) => Buffer.from(value, 'utf8').toString('base64');

const legacyRun = {
  id: 'submission-1',
  userId: 'user-1',
  code: 'const countIslands = () => 0;',
  language: 'JAVASCRIPT',
  runnerVersion: null,
  executionStatus: 'EXECUTING',
  createdAt: new Date(Date.now() - 20000).toISOString(),
  lesson: { slug: 'count-islands' },
};

const judge0Result = (overrides: Record<string, unknown> = {}) => ({
  stdin: null,
  stdout: encode(`logs\n${SEPARATOR_STRING}\n${JSON.stringify({ results: [{ passed: true }] })}`),
  stderr: null,
  compile_output: null,
  message: null,
  time: '0.05',
  memory: 3200,
  status: { id: 3, description: 'Accepted' },
  ...overrides,
});

const call = async ({
  method = 'POST',
  token = TOKEN,
}: { method?: RequestMethod; token?: unknown } = {}) => {
  const { req, res } = createMocks({ method, query: { token } as never });

  await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);
  return res;
};

beforeEach(() => {
  jest.clearAllMocks();
  process.env = { ...ORIGINAL_ENV, CODE_RUNNER: 'judge0' };
  mockViewerId.mockReturnValue('user-1');
  mockGetSubmission.mockResolvedValue({
    ...legacyRun,
    createdAt: new Date(Date.now() - 20000).toISOString(),
  });
  mockJudge0Get.mockResolvedValue(judge0Result());
  mockUpdate.mockResolvedValue({ update_code_submissions: { affected_rows: 1 } });
  mockClaim.mockResolvedValue(true);
});

afterAll(() => {
  process.env = ORIGINAL_ENV;
});

describe('/api/v1/judge0/refresh/[token]', () => {
  it('only accepts POST', async () => {
    const res = await call({ method: 'GET' });

    expect(res._getStatusCode()).toBe(405);
    expect(mockJudge0Get).not.toHaveBeenCalled();
  });

  it('has nothing to do when code runs in Docker, which writes results straight away', async () => {
    process.env.CODE_RUNNER = 'docker';

    const res = await call();

    expect(res._getStatusCode()).toBe(404);
    expect(mockGetSubmission).not.toHaveBeenCalled();
  });

  it("records an old runner's result fetched from Judge0", async () => {
    const res = await call();

    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toEqual({ status: 'updated' });
    expect(mockGetSubmission).toHaveBeenCalledWith(TOKEN);
    expect(mockJudge0Get).toHaveBeenCalledWith(
      `submissions/${TOKEN}?base64_encoded=true&fields=stdin,stdout,stderr,compile_output,message,time,memory,status`,
    );
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'submission-1',
        executionStatus: 'COMPLETE',
        resultStatus: 'PASSED',
        results: [{ passed: true }],
        logs: 'logs',
      }),
    );
  });

  it("judges a new runner's result, with the nonce from the run's stdin", async () => {
    const expected = countIslandsSpec.tests.map((test) => test.expected);
    const stdout =
      expected
        .map(
          (out, i) =>
            `${NONCE}{"t":"start","i":${i}}\n${NONCE}${JSON.stringify({ t: 'result', i, ok: true, out, ms: 0.1 })}\n`,
        )
        .join('') + `${NONCE}{"t":"done"}\n`;
    mockGetSubmission.mockResolvedValue({
      ...legacyRun,
      code: 'const countIslands = (grid) => 0;\n',
      language: 'TYPESCRIPT',
      runnerVersion: 'typescript-1',
    });
    mockJudge0Get.mockResolvedValue(
      judge0Result({ stdin: encode(`${NONCE}\n{"tests":[]}`), stdout: encode(stdout) }),
    );

    const res = await call();

    expect(res._getStatusCode()).toBe(200);
    const update = mockUpdate.mock.calls[0][0];
    expect(update).toMatchObject({
      id: 'submission-1',
      executionStatus: 'COMPLETE',
      resultStatus: 'PASSED',
    });
    expect(update.results.tests.map((test: { status: string }) => test.status)).toEqual(
      expected.map(() => 'passed'),
    );
  });

  it('works for a learner who is not logged in, on their own run', async () => {
    mockViewerId.mockReturnValue('');
    mockGetSubmission.mockResolvedValue({ ...legacyRun, userId: null });

    const res = await call();

    expect(res._getStatusCode()).toBe(200);
    expect(mockUpdate).toHaveBeenCalled();
  });

  it.each([
    ['no submission has the token', null, 'user-1'],
    ['the run is someone else’s', legacyRun, 'user-2'],
    ['a logged-out visitor asks about a learner’s run', legacyRun, ''],
  ])('answers 404 when %s', async (_case, submission, viewerId) => {
    mockGetSubmission.mockResolvedValue(submission);
    mockViewerId.mockReturnValue(viewerId);

    const res = await call();

    expect(res._getStatusCode()).toBe(404);
    expect(mockJudge0Get).not.toHaveBeenCalled();
  });

  it('asks Judge0 nothing for a run that already has its result', async () => {
    mockGetSubmission.mockResolvedValue({ ...legacyRun, executionStatus: 'COMPLETE' });

    const res = await call();

    expect(res._getJSONData()).toEqual({ status: 'done' });
    expect(mockJudge0Get).not.toHaveBeenCalled();
  });

  it('asks Judge0 nothing in the first seconds, while the callback is still on its way', async () => {
    mockGetSubmission.mockResolvedValue({ ...legacyRun, createdAt: new Date().toISOString() });

    const res = await call();

    expect(res._getStatusCode()).toBe(202);
    expect(mockJudge0Get).not.toHaveBeenCalled();
    expect(mockClaim).not.toHaveBeenCalled();
  });

  it('looks a run up at most once every few seconds', async () => {
    const before = Date.now();

    const res = await call();

    expect(res._getStatusCode()).toBe(200);
    expect(mockClaim).toHaveBeenCalledTimes(1);
    const { id, lastBefore } = mockClaim.mock.calls[0][0];
    expect(id).toBe('submission-1');
    expect(new Date(lastBefore).getTime()).toBeGreaterThanOrEqual(before - LOOKUP_INTERVAL_MS);
    expect(new Date(lastBefore).getTime()).toBeLessThanOrEqual(Date.now() - LOOKUP_INTERVAL_MS);
  });

  it('asks Judge0 nothing when the run was looked up moments ago', async () => {
    mockClaim.mockResolvedValue(false);

    const res = await call();

    expect(res._getStatusCode()).toBe(429);
    expect(res.getHeader('Retry-After')).toBe(String(LOOKUP_INTERVAL_MS / 1000));
    expect(mockJudge0Get).not.toHaveBeenCalled();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('asks Judge0 nothing when it cannot tell when the run was last looked up', async () => {
    mockClaim.mockRejectedValue(new Error('connection refused'));

    const res = await call();

    expect(res._getStatusCode()).toBe(500);
    expect(mockJudge0Get).not.toHaveBeenCalled();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('records nothing while Judge0 is still running the code', async () => {
    mockJudge0Get.mockResolvedValue(
      judge0Result({ stdout: null, status: { id: 2, description: 'Processing' } }),
    );

    const res = await call();

    expect(res._getStatusCode()).toBe(202);
    expect(res._getJSONData()).toEqual({ status: 'pending' });
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('reports that the callback got there first', async () => {
    mockUpdate.mockResolvedValue({ update_code_submissions: { affected_rows: 0 } });

    const res = await call();

    expect(res._getJSONData()).toEqual({ status: 'done' });
  });

  it('leaves the run waiting when Judge0 cannot be reached, as the callback may still come', async () => {
    mockJudge0Get.mockRejectedValue(new Error('ECONNRESET'));

    const res = await call();

    expect(res._getStatusCode()).toBe(502);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('marks the run as an error when its result cannot be recorded', async () => {
    mockGetSubmission.mockResolvedValue({
      ...legacyRun,
      runnerVersion: 'typescript-1',
      language: 'TYPESCRIPT',
    });
    // A new runner result without the stdin that carries its nonce
    mockJudge0Get.mockResolvedValue(judge0Result({ stdin: null }));

    const res = await call();

    expect(res._getStatusCode()).toBe(500);
    expect(mockUpdate).toHaveBeenCalledTimes(1);
    expect(mockUpdate).toHaveBeenCalledWith({ id: 'submission-1', executionStatus: 'ERROR' });
  });
});
