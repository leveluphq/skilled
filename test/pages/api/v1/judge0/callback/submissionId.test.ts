/**
 * /api/v1/judge0/callback/[submissionId]
 *
 * Judge0 PUTs each run's result here. Mocked at the I/O boundary only: the
 * GraphQL mutation that writes the result. Parsing the callback is the real
 * code (covered on its own in services/server/coderunner/judge0).
 */
import { createMocks, RequestMethod } from 'node-mocks-http';
import { NextApiRequest, NextApiResponse } from 'next';
import { SEPARATOR_STRING } from 'utils/constants/codeRunner';

jest.mock('isomorphic-unfetch', () =>
  jest.fn(() => {
    throw new Error('network access attempted in test');
  }),
);
jest.mock('services/server/graphql/mutations/updateCodeSubmissionResults', () => jest.fn());
jest.mock('services/server/graphql/queries/getCodeSubmissionForRunner', () => jest.fn());

import updateCodeSubmissionResults from 'services/server/graphql/mutations/updateCodeSubmissionResults';
import getCodeSubmissionForRunner from 'services/server/graphql/queries/getCodeSubmissionForRunner';
import countIslandsSpec from 'content/lessons/count-islands/runner.spec';
import handler, { config } from 'pages/api/v1/judge0/callback/[submissionId]';

const mockUpdate = updateCodeSubmissionResults as unknown as jest.Mock;
const mockGetSubmission = getCodeSubmissionForRunner as unknown as jest.Mock;

const CALLBACK_SECRET = 'judge0-shared-secret';
const ORIGINAL_ENV = process.env;

const encode = (value: string) => Buffer.from(value, 'utf8').toString('base64');

const callbackBody = (overrides: Record<string, unknown> = {}) => ({
  token: 'judge0-token',
  time: '0.05',
  memory: 3200,
  stdout: encode(`logs\n${SEPARATOR_STRING}\n${JSON.stringify({ results: [{ passed: true }] })}`),
  stderr: null,
  compile_output: null,
  message: null,
  status: { id: 3, description: 'Accepted' },
  ...overrides,
});

const call = async ({
  method = 'PUT',
  query = { submissionId: 'submission-1', callback_secret: CALLBACK_SECRET },
  body = callbackBody(),
}: {
  method?: RequestMethod;
  query?: Record<string, unknown>;
  body?: unknown;
} = {}) => {
  const { req, res } = createMocks({ method, query: query as never, body: body as never });
  // node-mocks-http turns a null body into {}; Next passes null for a literal `null` payload
  (req as unknown as { body: unknown }).body = body;

  await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);
  return res;
};

beforeEach(() => {
  jest.clearAllMocks();
  process.env = { ...ORIGINAL_ENV, JUDGE0_CALLBACK_SECRET: CALLBACK_SECRET };
  mockUpdate.mockResolvedValue({ update_code_submissions: { affected_rows: 1 } });
});

afterAll(() => {
  process.env = ORIGINAL_ENV;
});

describe('/api/v1/judge0/callback/[submissionId]', () => {
  it('accepts callbacks of up to 4mb, since Judge0 sends the whole output and never retries a 413', () => {
    expect(config.api.bodyParser.sizeLimit).toBe('4mb');
  });

  it('records the result on the submission named in the URL', async () => {
    const res = await call();

    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toEqual({ success: true });
    expect(mockUpdate).toHaveBeenCalledTimes(1);
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

  it('answers 200 without changing anything when the submission already has its result', async () => {
    // The conditional update matched no EXECUTING row: a repeated callback
    mockUpdate.mockResolvedValue({ update_code_submissions: { affected_rows: 0 } });

    const res = await call();

    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toEqual({ success: false });
    expect(mockUpdate).toHaveBeenCalledTimes(1);
  });

  it.each([
    [1, 'In Queue'],
    [2, 'Processing'],
  ])(
    'writes nothing for a callback that is not finished yet (status %i)',
    async (id, description) => {
      const res = await call({ body: callbackBody({ status: { id, description }, stdout: null }) });

      expect(res._getStatusCode()).toBe(202);
      expect(mockUpdate).not.toHaveBeenCalled();
    },
  );

  it('records a compile error as a finished run', async () => {
    const compileOutput = encode('error TS1005');

    await call({
      body: callbackBody({
        stdout: null,
        compile_output: compileOutput,
        status: { id: 6, description: 'Compilation Error' },
      }),
    });

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        executionStatus: 'COMPLETE',
        resultStatus: 'FAILED',
        codeRunnerStatusId: 6,
        compileOutput,
      }),
    );
  });

  it('finishes the submission as an error when the callback has no status', async () => {
    const body = callbackBody();
    delete (body as Record<string, unknown>).status;

    const res = await call({ body });

    expect(res._getStatusCode()).toBe(200);
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ executionStatus: 'ERROR' }));
  });

  it('marks the submission as an error when its result cannot be written', async () => {
    mockUpdate
      .mockRejectedValueOnce(new Error('hasura: permission denied for update'))
      .mockResolvedValueOnce({ update_code_submissions: { affected_rows: 1 } });

    const res = await call();

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.stringify(res._getData())).not.toContain('permission denied');
    expect(mockUpdate).toHaveBeenLastCalledWith({ id: 'submission-1', executionStatus: 'ERROR' });
  });

  it('still answers 500 when marking the error fails too', async () => {
    mockUpdate.mockRejectedValue(new Error('hasura is down'));

    const res = await call();

    expect(res._getStatusCode()).toBe(500);
    expect(mockUpdate).toHaveBeenCalledTimes(2);
  });

  it.each([
    ['a wrong secret', { submissionId: 'submission-1', callback_secret: 'guess' }],
    ['no secret', { submissionId: 'submission-1' }],
  ])('401s and writes nothing for %s', async (_label, query) => {
    const res = await call({ query });

    expect(res._getStatusCode()).toBe(401);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('does not echo the configured or the guessed secret in the 401 body', async () => {
    // The rejection is what someone probing for the secret sees, so it stays a
    // fixed message with no "expected X, got Y" detail.
    const res = await call({ query: { submissionId: 'submission-1', callback_secret: 'guess-1' } });

    const body = JSON.stringify(res._getData());
    expect(res._getStatusCode()).toBe(401);
    expect(body).not.toContain(CALLBACK_SECRET);
    expect(body).not.toContain('guess-1');
  });

  it('401s for every caller when the server has no secret configured', async () => {
    process.env = { ...ORIGINAL_ENV, JUDGE0_CALLBACK_SECRET: '' };

    const res = await call({ query: { submissionId: 'submission-1', callback_secret: '' } });

    expect(res._getStatusCode()).toBe(401);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it.each([
    ['a missing submission id', { callback_secret: CALLBACK_SECRET }, callbackBody()],
    [
      'a repeated submission id',
      { submissionId: ['a', 'b'], callback_secret: CALLBACK_SECRET },
      callbackBody(),
    ],
    ['a null body', { submissionId: 'submission-1', callback_secret: CALLBACK_SECRET }, null],
    [
      'a non-object body',
      { submissionId: 'submission-1', callback_secret: CALLBACK_SECRET },
      'text',
    ],
  ])('400s for %s', async (_label, query, body) => {
    const res = await call({ query, body });

    expect(res._getStatusCode()).toBe(400);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it.each(['GET', 'POST', 'DELETE'] as RequestMethod[])('405s for %s', async (method) => {
    const res = await call({ method });

    expect(res._getStatusCode()).toBe(405);
    expect(res._getHeaders().allow).toEqual(['PUT']);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  describe('results from the new runner', () => {
    const NONCE = '0123456789abcdef0123456789abcdef';
    const query = { submissionId: 'submission-1', callback_secret: CALLBACK_SECRET, nonce: NONCE };
    const protocol = (outputs: unknown[]) =>
      outputs
        .map(
          (out, i) =>
            `${NONCE}{"t":"start","i":${i}}\n${NONCE}${JSON.stringify({ t: 'result', i, ok: true, out, ms: 0.1 })}\n`,
        )
        .join('') + `${NONCE}{"t":"done"}\n`;

    beforeEach(() => {
      mockGetSubmission.mockResolvedValue({
        id: 'submission-1',
        code: 'const countIslands = (grid) => 0;\n',
        language: 'TYPESCRIPT',
        runnerVersion: 'typescript-1',
        executionStatus: 'EXECUTING',
        lesson: { slug: 'count-islands' },
      });
    });

    it('judges the output against the lesson spec and records each test', async () => {
      const expected = countIslandsSpec.tests.map((test) => test.expected);

      const res = await call({ query, body: callbackBody({ stdout: encode(protocol(expected)) }) });

      expect(res._getStatusCode()).toBe(200);
      const update = mockUpdate.mock.calls[0][0];
      expect(update).toMatchObject({
        id: 'submission-1',
        executionStatus: 'COMPLETE',
        resultStatus: 'PASSED',
      });
      expect(update.results.version).toBe(2);
      expect(update.results.tests.map((test: { status: string }) => test.status)).toEqual(
        expected.map(() => 'passed'),
      );
      // The protocol stream (and its nonce) isn't stored
      expect(update.stdout).toBeNull();
      expect(JSON.stringify(update)).not.toContain(NONCE);
    });

    it('records which test a wrong answer failed', async () => {
      const outputs = countIslandsSpec.tests.map((test) => test.expected);
      outputs[4] = 99;

      await call({ query, body: callbackBody({ stdout: encode(protocol(outputs)) }) });

      const update = mockUpdate.mock.calls[0][0];
      expect(update.resultStatus).toBe('FAILED');
      expect(update.results.tests[4]).toMatchObject({ status: 'failed', expected: 4, actual: 99 });
    });

    it("places a compile error on the learner's own line", async () => {
      await call({
        query,
        body: callbackBody({
          stdout: null,
          compile_output: encode("script.ts(2,15): error TS1005: ',' expected.\n"),
          status: { id: 6, description: 'Compilation Error' },
        }),
      });

      const update = mockUpdate.mock.calls[0][0];
      expect(update.results.problem).toBe('compile_error');
      expect(update.compileOutputDecoded).toContain('TS1005');
      // Line 2 of the file is line 1 of the learner's code, after `// @ts-nocheck`
      expect(update.diagnostics).toEqual([
        { line: 1, column: 15, message: "error TS1005: ',' expected." },
      ]);
    });

    it('answers 200 and records nothing for a submission it cannot find', async () => {
      mockGetSubmission.mockResolvedValue(null);

      const res = await call({ query, body: callbackBody() });

      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual({ success: false });
      expect(mockUpdate).not.toHaveBeenCalled();
    });
  });
});
