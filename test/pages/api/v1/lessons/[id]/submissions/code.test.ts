/**
 * /api/v1/lessons/[id]/submissions/code
 *
 * POST submits user code to Judge0. The result comes back to a separate route,
 * /api/v1/judge0/callback/[submissionId]. Mocked at the I/O boundary only: the
 * GraphQL query/mutation modules and `executeCodeSubmission`. `mapLanguageToId`
 * and `validatorForLanguage` are the real ones, since language validation is
 * under test. `isomorphic-unfetch` is mocked to throw so that any accidental
 * live request fails loudly instead of dialling out.
 */

import { createMocks, RequestMethod } from 'node-mocks-http';
import { NextApiRequest, NextApiResponse } from 'next';
import { CodingLanguage } from 'utils/constants/lesson';
import { JAVASCRIPT_VALIDATOR, PYTHON_VALIDATOR } from 'utils/constants/codeRunner';

jest.mock('isomorphic-unfetch', () =>
  jest.fn(() => {
    throw new Error('network access attempted in test');
  }),
);
const mockPaymentFlags = { openAllLessons: false };

jest.mock('utils/constants/payments', () => {
  const actual = jest.requireActual('utils/constants/payments');
  return Object.defineProperty({ ...actual, __esModule: true }, 'OPEN_ALL_LESSONS', {
    get: () => mockPaymentFlags.openAllLessons,
  });
});
jest.mock('services/server/graphql/queries/getViewerById', () => jest.fn());
jest.mock('services/server/graphql/queries/getLessonForRunner', () => jest.fn());
jest.mock('services/server/runner/submit', () => ({
  ...jest.requireActual('services/server/runner/submit'),
  startRun: jest.fn(),
}));
// count-islands offers JavaScript, TypeScript and Python, whatever else is ported
jest.mock('content/lessonLanguages.gen', () => ({
  __esModule: true,
  default: { 'count-islands': ['JAVASCRIPT', 'TYPESCRIPT', 'PYTHON'] },
}));
jest.mock('services/server/graphql/queries/countCodeSubmissions', () => jest.fn());
jest.mock('services/server/graphql/mutations/insertNewCodeSubmission', () => jest.fn());
jest.mock('services/server/graphql/mutations/setSubmissionToken', () => jest.fn());
jest.mock('services/server/graphql/mutations/updateCodeSubmissionResults', () => jest.fn());
jest.mock('services/server/coderunner', () => ({
  ...jest.requireActual('services/server/coderunner'),
  executeCodeSubmission: jest.fn(),
}));

import getViewerById from 'services/server/graphql/queries/getViewerById';
import getLessonForRunner from 'services/server/graphql/queries/getLessonForRunner';
import { startRun } from 'services/server/runner/submit';
import countIslandsSpec from 'content/lessons/count-islands/runner.spec';
import insertNewCodeSubmission from 'services/server/graphql/mutations/insertNewCodeSubmission';
import countCodeSubmissions from 'services/server/graphql/queries/countCodeSubmissions';
import setSubmissionToken from 'services/server/graphql/mutations/setSubmissionToken';
import updateCodeSubmissionResults from 'services/server/graphql/mutations/updateCodeSubmissionResults';
import { executeCodeSubmission } from 'services/server/coderunner';
import { javascriptRuntime } from 'services/server/runner/runtimes/javascript';
import handler from 'pages/api/v1/lessons/[id]/submissions/code';

const mockGetViewer = getViewerById as unknown as jest.Mock;
const mockGetLesson = getLessonForRunner as unknown as jest.Mock;
const mockStartRun = startRun as unknown as jest.Mock;

// A lesson with no runner spec, so it always uses the old runner
const OLD_RUNNER_LESSON = {
  id: 'lesson-uuid',
  slug: 'legacy-lesson',
  accessLevel: 'FREE',
  status: 'ACTIVE',
};
const ORIGINAL_ENV = process.env;
const mockInsert = insertNewCodeSubmission as unknown as jest.Mock;
const mockCount = countCodeSubmissions as unknown as jest.Mock;
const mockSetToken = setSubmissionToken as unknown as jest.Mock;
const mockUpdateResults = updateCodeSubmissionResults as unknown as jest.Mock;
const mockExecute = executeCodeSubmission as unknown as jest.Mock;

const VIEWER = { id: 'user-1', email: 'viewer@example.com' };

const NO_RAW_BODY = Symbol('no-raw-body');

interface CallOptions {
  method: RequestMethod;
  query?: Record<string, unknown>;
  body?: unknown;
  /**
   * Installs a body node-mocks-http would otherwise normalise away - notably
   * `null`, which is what Next hands the handler for a literal `null` JSON body.
   */
  rawBody?: unknown;
  // The connection's address; node-mocks-http leaves it unset
  remoteAddress?: string;
  headers?: Record<string, string>;
}

const call = async ({
  method,
  query = { id: 'lesson-uuid' },
  body = {},
  rawBody = NO_RAW_BODY,
  remoteAddress,
  headers,
}: CallOptions) => {
  const { req, res } = createMocks({
    method,
    query: query as never,
    body: body as never,
    headers,
    url: '/api/v1/lessons/lesson-uuid/submissions/code',
  });

  if (remoteAddress) {
    Object.defineProperty(req, 'socket', { value: { remoteAddress } });
  }

  if (rawBody !== NO_RAW_BODY) {
    (req as unknown as { body: unknown }).body = rawBody;
  }

  await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);
  return res;
};

const post = (options: Omit<CallOptions, 'method'>) => call({ method: 'POST', ...options });

beforeAll(() => {
  // The route logs on every error path.
  jest.spyOn(console, 'log').mockImplementation(() => undefined);
});

beforeEach(() => {
  jest.clearAllMocks();
  mockPaymentFlags.openAllLessons = false;
  process.env = { ...ORIGINAL_ENV, CODE_RUNNER: 'judge0', RUNNER_V2_LESSONS: '' };
  mockGetLesson.mockResolvedValue(OLD_RUNNER_LESSON);

  mockGetViewer.mockResolvedValue(VIEWER);
  mockCount.mockResolvedValue({ count: 0, startedAt: null });
  mockInsert.mockResolvedValue({
    insert_code_submissions: { returning: [{ id: 'submission-1' }] },
  });
  mockExecute.mockResolvedValue({ token: 'judge0-token' });
  mockSetToken.mockResolvedValue({});
  mockUpdateResults.mockResolvedValue({ update_code_submissions: { affected_rows: 1 } });
});

afterAll(() => {
  process.env = ORIGINAL_ENV;
  jest.restoreAllMocks();
});

describe('/api/v1/lessons/[id]/submissions/code', () => {
  describe('method handling', () => {
    it.each(['PUT', 'DELETE', 'PATCH'] as RequestMethod[])(
      'rejects %s with 405',
      async (method) => {
        // Judge0's callback moved to /api/v1/judge0/callback/[submissionId]
        const res = await call({ method });

        expect(res._getStatusCode()).toBe(405);
        expect(res.getHeader('Allow')).toEqual(['POST', 'GET']);
        expect(mockExecute).not.toHaveBeenCalled();
        expect(mockInsert).not.toHaveBeenCalled();
      },
    );

    it('answers GET with a stub and never reads any submission', async () => {
      const res = await call({ method: 'GET' });

      // The GET branch is unimplemented (see the comments in the route). Pinned
      // so that wiring it up later has to come with its own authorisation test:
      // right now it would happily be reached by an anonymous caller.
      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual({ success: true });
      expect(mockGetViewer).not.toHaveBeenCalled();
    });

    it('sets security headers on the POST success path', async () => {
      const res = await post({
        body: { code: 'x', tests: '', language: CodingLanguage.Javascript },
      });

      expect(res.getHeader('X-Frame-Options')).toBe('DENY');
      expect(res.getHeader('X-Content-Type-Options')).toBe('nosniff');
    });
  });

  describe('POST input validation', () => {
    it('400s when the language is missing', async () => {
      const res = await post({ body: { code: 'const a = 1;', tests: '' } });

      expect(res._getStatusCode()).toBe(400);
      expect(res._getData()).toEqual({
        message: 'Did not contain a valid programming language',
        statusCode: 400,
      });
      expect(mockInsert).not.toHaveBeenCalled();
      expect(mockExecute).not.toHaveBeenCalled();
    });

    it.each([
      ['an unsupported language', 'JAVA'],
      ['a non-string language', 63],
      ['an empty string', ''],
      ['a lowercase variant', 'javascript'],
    ])('400s for %s and never reaches the code runner', async (_label, language) => {
      const res = await post({ body: { code: 'x', tests: '', language } });

      expect(res._getStatusCode()).toBe(400);
      expect(mockExecute).not.toHaveBeenCalled();
    });

    it.each(['constructor', '__proto__', 'toString'])(
      'rejects a prototype key such as %s as a language',
      async (language) => {
        // The old check looked languages up on plain object literals, where
        // inherited keys are truthy, so these used to reach Judge0
        const res = await post({ body: { code: 'x', tests: '', language } });

        expect(res._getStatusCode()).toBe(400);
        expect(mockInsert).not.toHaveBeenCalled();
        expect(mockExecute).not.toHaveBeenCalled();
      },
    );

    it('500s instead of 400 when the parsed body is null', async () => {
      // BUG: `const { code = '' } = body` throws a TypeError for a `null` body
      // (what Next hands over for a literal `null` JSON payload), so a malformed
      // request is reported as a server error and captured in Sentry as one.
      const res = await post({ rawBody: null });

      expect(res._getStatusCode()).toBe(500);
      expect(res._getData()).toEqual({
        message: 'There was an error submitting your code',
        statusCode: 500,
      });
    });

    it('accepts non-string code and stringifies it into the program', async () => {
      // BUG: `code`/`tests` are typed as strings but never checked. An object is
      // interpolated as "[object Object]" and an array is joined, so garbage is
      // billed to Judge0 and stored as the user's submission instead of a 400.
      await post({
        body: { code: { evil: true }, tests: ['a', 'b'], language: CodingLanguage.Javascript },
      });

      const [submittedCode] = mockExecute.mock.calls[0];
      expect(submittedCode).toBe(`[object Object]\na,b\n${JAVASCRIPT_VALIDATOR}`);
    });

    it('forwards an oversized source blob with no length check', async () => {
      // BUG: neither `code` nor `tests` has a maximum length. The only ceiling is
      // Next's default 1mb body parser limit, which this route does not configure
      // and could be raised by a later `export const config`. A per-field cap
      // belongs in the handler.
      const hugeCode = 'a'.repeat(400_000);

      const res = await post({
        body: { code: hugeCode, tests: '', language: CodingLanguage.Javascript },
      });

      expect(res._getStatusCode()).toBe(200);
      expect(String(mockExecute.mock.calls[0][0]).length).toBeGreaterThan(400_000);
    });

    it.each([
      ['missing', {}],
      ['repeated', { id: ['lesson-a', 'lesson-b'] }],
      ['empty', { id: '' }],
    ])('400s before any external call when the lesson id is %s', async (_label, query) => {
      const res = await post({
        query,
        body: { code: 'x', tests: '', language: CodingLanguage.Javascript },
      });

      expect(res._getStatusCode()).toBe(400);
      expect(res._getData()).toEqual({
        message: 'Did not contain a valid lesson',
        statusCode: 400,
      });
      expect(mockInsert).not.toHaveBeenCalled();
      expect(mockExecute).not.toHaveBeenCalled();
    });
  });

  describe('POST authorisation', () => {
    it('runs code for an anonymous caller and stores the submission with no user', async () => {
      // BUG: there is no authentication on this endpoint. `getViewerById` returning
      // null is treated as "anonymous submission" rather than 401, so anyone on the
      // internet can run arbitrary code on the project's metered Judge0 account and
      // insert rows into code_submissions. Combined with the missing resource limits
      // in the Judge0 client this is a direct cost/abuse channel.
      mockGetViewer.mockResolvedValue(null);

      const res = await post({
        body: { code: 'require("child_process")', tests: '', language: CodingLanguage.Javascript },
      });

      expect(res._getStatusCode()).toBe(200);
      expect(mockExecute).toHaveBeenCalledTimes(1);
      expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({ userId: undefined }));
    });
  });

  describe('POST submission flow', () => {
    it('composes header + code + tests + validator and links the Judge0 token', async () => {
      const res = await post({
        body: {
          code: 'const solve = () => 1;',
          tests: 'const tests = [1];',
          language: CodingLanguage.Typescript,
        },
      });

      // Judge0 calls back to the submission row, not the lesson
      expect(mockExecute).toHaveBeenCalledWith(
        `// @ts-nocheck\nconst solve = () => 1;\nconst tests = [1];\n${JAVASCRIPT_VALIDATOR}`,
        CodingLanguage.Typescript,
        'submission-1',
      );
      expect(mockInsert).toHaveBeenCalledWith({
        lessonId: 'lesson-uuid',
        userId: 'user-1',
        language: CodingLanguage.Typescript,
        code: 'const solve = () => 1;',
        tests: 'const tests = [1];',
        validator: JAVASCRIPT_VALIDATOR,
        executionStatus: 'EXECUTING',
        // No address on this request to hash
        ipHash: null,
        environment: 'JUDGE0',
      });
      expect(mockSetToken).toHaveBeenCalledWith({
        id: 'submission-1',
        codeRunnerToken: 'judge0-token',
      });
      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual({ token: 'judge0-token' });
    });

    it('uses the python validator and no file header for python', async () => {
      await post({
        body: { code: 'def solve(): pass', tests: '', language: CodingLanguage.Python },
      });

      expect(mockExecute.mock.calls[0][0]).toBe(`def solve(): pass\n\n${PYTHON_VALIDATOR}`);
    });

    it('500s and marks the saved submission as an error when Judge0 rejects it', async () => {
      // No result will ever arrive for this row, so it must not stay EXECUTING
      mockExecute.mockRejectedValue({ error: 'quota exceeded' });

      const res = await post({
        body: { code: 'x', tests: '', language: CodingLanguage.Javascript },
      });

      expect(res._getStatusCode()).toBe(500);
      expect(res._getData()).toEqual({
        message: 'There was an error submitting your code',
        statusCode: 500,
      });
      expect(mockSetToken).not.toHaveBeenCalled();
      expect(mockUpdateResults).toHaveBeenCalledWith({
        id: 'submission-1',
        executionStatus: 'ERROR',
      });
    });

    it('still answers 500 when marking the rejected submission fails too', async () => {
      mockExecute.mockRejectedValue({ error: 'quota exceeded' });
      mockUpdateResults.mockRejectedValue(new Error('hasura is down'));

      const res = await post({
        body: { code: 'x', tests: '', language: CodingLanguage.Javascript },
      });

      expect(res._getStatusCode()).toBe(500);
    });

    it('500s without running anything when the submission was not saved', async () => {
      mockInsert.mockResolvedValue({ insert_code_submissions: { returning: [] } });

      const res = await post({
        body: { code: 'x', tests: '', language: CodingLanguage.Javascript },
      });

      expect(res._getStatusCode()).toBe(500);
      expect(mockExecute).not.toHaveBeenCalled();
    });

    it('does not leak the underlying error message to the caller', async () => {
      mockInsert.mockRejectedValue(new Error('x-hasura-admin-secret rejected: topsecret'));

      const res = await post({
        body: { code: 'x', tests: '', language: CodingLanguage.Javascript },
      });

      expect(res._getStatusCode()).toBe(500);
      expect(JSON.stringify(res._getData())).not.toContain('topsecret');
      expect(JSON.stringify(res._getData())).not.toContain('x-hasura-admin-secret');
    });
  });

  describe('POST run limits', () => {
    it('refuses a run over the limit, saying when to try again', async () => {
      mockCount.mockResolvedValue({ count: 120, startedAt: new Date(Date.now() - 540000) });

      const res = await post({
        body: { code: 'x', tests: 'y', language: CodingLanguage.Javascript },
      });

      expect(res._getStatusCode()).toBe(429);
      expect(res._getHeaders()['retry-after']).toMatch(/^\d+$/);
      expect(res._getData().message).toMatch(
        /^You've run code 120 times in the last 10 minutes\. You can run it again in /,
      );
      expect(mockInsert).not.toHaveBeenCalled();
      expect(mockExecute).not.toHaveBeenCalled();
    });

    it('saves a hash of the address with each run, never the address', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        query: { id: 'lesson-uuid' } as never,
        body: { code: 'x', tests: 'y', language: CodingLanguage.Javascript } as never,
        headers: { 'x-forwarded-for': '203.0.113.7' },
      });

      await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);

      const { ipHash } = mockInsert.mock.calls[0][0];
      expect(ipHash).toMatch(/^[0-9a-f]{32}$/);
      expect(JSON.stringify(mockInsert.mock.calls[0][0])).not.toContain('203.0.113.7');
    });

    it('lets the run through when the count fails', async () => {
      mockCount.mockRejectedValue(new Error('Hasura is down'));

      const res = await post({
        body: { code: 'x', tests: 'y', language: CodingLanguage.Javascript },
      });

      expect(res._getStatusCode()).toBe(200);
      expect(mockExecute).toHaveBeenCalled();
    });
  });

  describe('POST on the new runner', () => {
    const FREE_SPEC_LESSON = {
      id: 'lesson-uuid',
      slug: 'count-islands',
      accessLevel: 'FREE',
      status: 'ACTIVE',
    };
    const solution = 'const countIslands = (grid) => 0;';

    beforeEach(() => {
      process.env = { ...process.env, RUNNER_V2_LESSONS: 'count-islands' };
      mockGetLesson.mockResolvedValue(FREE_SPEC_LESSON);
      mockStartRun.mockResolvedValue('judge0-token');
    });

    it('runs the lesson spec, ignoring tests sent by the client', async () => {
      const res = await post({
        body: {
          code: solution,
          tests: 'const tests = []; // from the client',
          language: CodingLanguage.Javascript,
        },
      });

      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual({ token: 'judge0-token' });
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          lessonId: 'lesson-uuid',
          language: CodingLanguage.Javascript,
          code: solution,
          tests: expect.stringMatching(/^spec:[0-9a-f]{16}$/),
          runnerVersion: javascriptRuntime.version,
          executionStatus: 'EXECUTING',
          environment: 'JUDGE0',
        }),
      );
      const [spec, program, submissionId] = mockStartRun.mock.calls[0];
      expect(spec).toBe(countIslandsSpec);
      expect(program.assembled.source.startsWith(`${solution}\n`)).toBe(true);
      expect(program.assembled.source).not.toContain('from the client');
      expect(submissionId).toBe('submission-1');
      expect(mockSetToken).toHaveBeenCalledWith({
        id: 'submission-1',
        codeRunnerToken: 'judge0-token',
      });
      expect(mockExecute).not.toHaveBeenCalled();
    });

    it.each([
      ['a logged-out visitor', null, 'TRIAL', 'Log in to run code for this lesson'],
      ['a visitor without access', null, 'SUBSCRIPTION', 'Log in to run code for this lesson'],
    ])(
      '403s %s, since the results show the expected answers',
      async (_label, viewer, accessLevel, message) => {
        mockGetViewer.mockResolvedValue(viewer);
        mockGetLesson.mockResolvedValue({ ...FREE_SPEC_LESSON, accessLevel });

        const res = await post({
          body: { code: solution, tests: '', language: CodingLanguage.Javascript },
        });

        expect(res._getStatusCode()).toBe(403);
        expect(res._getData()).toEqual({ message, statusCode: 403 });
        expect(mockInsert).not.toHaveBeenCalled();
        expect(mockStartRun).not.toHaveBeenCalled();
      },
    );

    it('runs any lesson for a logged-out visitor when every lesson is open (OPEN_ALL_LESSONS)', async () => {
      mockPaymentFlags.openAllLessons = true;
      mockGetViewer.mockResolvedValue(null);
      mockGetLesson.mockResolvedValue({ ...FREE_SPEC_LESSON, accessLevel: 'SUBSCRIPTION' });

      const res = await post({
        body: { code: solution, tests: '', language: CodingLanguage.Javascript },
      });

      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual({ token: 'judge0-token' });
      expect(mockStartRun).toHaveBeenCalledTimes(1);
    });

    describe('with the system runner (CODE_RUNNER=system)', () => {
      beforeEach(() => {
        process.env = { ...process.env, CODE_RUNNER: 'system' };
      });

      const body = { code: solution, tests: '', language: CodingLanguage.Javascript };

      it('runs code for a browser on this machine', async () => {
        const res = await post({ body, remoteAddress: '::1' });

        expect(res._getStatusCode()).toBe(200);
        expect(mockStartRun).toHaveBeenCalledTimes(1);
      });

      it.each([
        ['another machine', { remoteAddress: '192.168.1.20' }],
        ['a tunnel to this machine', { remoteAddress: '127.0.0.1', headers: { 'x-forwarded-for': '203.0.113.9' } }],
      ])('403s %s without saving anything, since code runs with no sandbox', async (_label, from) => {
        const res = await post({ body, ...from });

        expect(res._getStatusCode()).toBe(403);
        expect(res._getData()).toEqual({
          message:
            "This app runs code with this machine's own Node.js and Python (CODE_RUNNER=system), so only a browser on this machine can run it",
          statusCode: 403,
        });
        expect(mockGetLesson).not.toHaveBeenCalled();
        expect(mockInsert).not.toHaveBeenCalled();
        expect(mockStartRun).not.toHaveBeenCalled();
      });

      it('400s for a language only Docker runs, saying so', async () => {
        const res = await post({
          body: { code: 'class Solution {}', tests: '', language: CodingLanguage.Java },
          remoteAddress: '127.0.0.1',
        });

        expect(res._getStatusCode()).toBe(400);
        expect(res._getData()).toEqual({
          message:
            'Java runs only in Docker. With CODE_RUNNER=system, this app runs JavaScript, TypeScript and Python',
          statusCode: 400,
        });
        expect(mockInsert).not.toHaveBeenCalled();
      });
    });

    it("400s, without saving anything, for a language the lesson isn't available in yet", async () => {
      const res = await post({
        body: { code: 'class Solution {}', tests: '', language: CodingLanguage.Java },
      });

      expect(res._getStatusCode()).toBe(400);
      expect(res._getData()).toEqual({
        message: "This lesson isn't available in Java yet",
        statusCode: 400,
      });
      expect(mockInsert).not.toHaveBeenCalled();
    });

    it('keeps a lesson that is not in RUNNER_V2_LESSONS on the old runner', async () => {
      process.env = { ...process.env, RUNNER_V2_LESSONS: 'some-other-lesson' };

      await post({ body: { code: solution, tests: '', language: CodingLanguage.Javascript } });

      expect(mockExecute).toHaveBeenCalledTimes(1);
      expect(mockStartRun).not.toHaveBeenCalled();
    });

    it('uses the new runner for every lesson with a spec when code runs in Docker', async () => {
      process.env = { ...process.env, CODE_RUNNER: 'docker', RUNNER_V2_LESSONS: '' };

      await post({ body: { code: solution, tests: '', language: CodingLanguage.Javascript } });

      expect(mockStartRun).toHaveBeenCalledTimes(1);
      expect(mockExecute).not.toHaveBeenCalled();
    });

    it.each([
      ['service', 'SERVICE'],
      ['docker', 'DOCKER'],
      ['judge0', 'JUDGE0'],
    ])('records where a run goes (CODE_RUNNER=%s)', async (backend, environment) => {
      process.env = { ...process.env, CODE_RUNNER: backend, RUNNER_V2_LESSONS: 'all' };

      await post({ body: { code: solution, tests: '', language: CodingLanguage.Javascript } });

      expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({ environment }));
    });

    it('500s and marks the submission as an error when the run cannot start', async () => {
      mockStartRun.mockRejectedValue(new Error('quota exceeded'));

      const res = await post({
        body: { code: solution, tests: '', language: CodingLanguage.Javascript },
      });

      expect(res._getStatusCode()).toBe(500);
      expect(mockUpdateResults).toHaveBeenCalledWith({
        id: 'submission-1',
        executionStatus: 'ERROR',
      });
    });

    it('404s for a lesson that does not exist', async () => {
      mockGetLesson.mockResolvedValue(null);

      const res = await post({
        body: { code: solution, tests: '', language: CodingLanguage.Javascript },
      });

      expect(res._getStatusCode()).toBe(404);
      expect(mockInsert).not.toHaveBeenCalled();
    });
  });
});
