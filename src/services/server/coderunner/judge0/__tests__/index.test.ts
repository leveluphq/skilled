/**
 * Judge0 code-runner client.
 *
 * Every assertion here is made against the arguments handed to `fetch`, which is
 * the only I/O boundary in this module. Nothing dials out: `isomorphic-unfetch`
 * is replaced with a jest.fn for the whole file, so a regression that removed the
 * mock would surface as an undefined response rather than a live request.
 *
 * Each case sets the env it needs and re-imports through `loadJudge0`, so no
 * module state carries over from one case to the next.
 */

import { CodingLanguage } from 'utils/constants/lesson';

jest.mock('isomorphic-unfetch', () => jest.fn());

const ORIGINAL_ENV = process.env;

const BASE_ENV = {
  ROOT_URL: 'https://skilled.dev',
  JUDGE0_CALLBACK_SECRET: 'callback-secret-value',
  JUDGE0_API_KEY: 'rapidapi-key-value',
};

type Judge0Module = typeof import('services/server/coderunner/judge0');

interface LoadedJudge0 {
  judge0: Judge0Module;
  fetchMock: jest.Mock;
}

const loadJudge0 = (env: Record<string, string | undefined> = {}): LoadedJudge0 => {
  jest.resetModules();

  const nextEnv: Record<string, string | undefined> = { ...ORIGINAL_ENV, ...BASE_ENV, ...env };
  Object.keys(env).forEach((key) => {
    if (env[key] === undefined) {
      delete nextEnv[key];
    }
  });
  process.env = nextEnv as NodeJS.ProcessEnv;

  // Required *after* resetModules so the client module and this test share the
  // same mock instance from the fresh registry.
  const fetchMock = require('isomorphic-unfetch') as jest.Mock;
  fetchMock.mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ token: 'judge0-token' }),
  });

  const judge0 = require('services/server/coderunner/judge0') as Judge0Module;

  return { judge0, fetchMock };
};

const lastRequest = (fetchMock: jest.Mock) => {
  const [url, config] = fetchMock.mock.calls[fetchMock.mock.calls.length - 1];
  return {
    url: url as string,
    config: config as RequestInit,
    get payload() {
      return JSON.parse(String(config.body)) as Record<string, unknown>;
    },
  };
};

afterEach(() => {
  process.env = ORIGINAL_ENV;
});

describe('judge0 client', () => {
  describe('endpoint', () => {
    it('posts to the RapidAPI submissions endpoint with the RapidAPI credentials', async () => {
      // NOTE: the Judge0 base URL is a hardcoded constant in judge0/api.ts, so it
      // cannot be pointed at a self-hosted instance per deploy, and it disagrees
      // with the CSP in services/server/security/headers.ts, which allows
      // https://ce.judge0.com. Pinned here so the host and the key header stay
      // together: the key is only valid for, and must only be sent to, RapidAPI.
      const { judge0, fetchMock } = loadJudge0();

      await judge0.executeCodeSubmission('console.log(1)', CodingLanguage.Javascript, 'lesson-1');

      const { url, config } = lastRequest(fetchMock);

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(url).toBe('https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&fields=*');
      expect(config.method).toBe('POST');
      expect(config.headers).toMatchObject({
        'content-type': 'application/json',
        'x-rapidapi-key': 'rapidapi-key-value',
        'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
      });
    });
  });

  describe('executeCodeSubmission() resource limits', () => {
    it('sends a 5 second cpu_time_limit and the mapped language id', async () => {
      const { judge0, fetchMock } = loadJudge0();

      await judge0.executeCodeSubmission('print(1)', CodingLanguage.Python, 'lesson-1');

      const { payload } = lastRequest(fetchMock);
      expect(payload.cpu_time_limit).toBe(5);
      expect(payload.language_id).toBe(71);
      expect(payload.source_code).toBe('print(1)');
    });

    it('never asks Judge0 to enable network access or to run longer than the cpu cap', async () => {
      // This endpoint runs untrusted, unauthenticated code (see the route test),
      // so the two things that must never regress are "no outbound network from
      // the sandbox" and "a bounded cpu budget".
      //
      // FINDING (deliberately not asserted, so that fixing it does not break this
      // test): cpu_time_limit is the *only* limit sent. wall_time_limit,
      // memory_limit, stack_limit, max_processes_and_or_threads, max_file_size and
      // an explicit `enable_network: false` are all left to whatever the shared
      // RapidAPI instance defaults to, which this project does not control.
      const { judge0, fetchMock } = loadJudge0();

      await judge0.executeCodeSubmission('while(true){}', CodingLanguage.Javascript, 'lesson-1');

      const { payload } = lastRequest(fetchMock);
      expect(payload.enable_network ?? false).toBe(false);
      expect(payload.cpu_time_limit).toBeLessThanOrEqual(5);
    });

    it('compiles TypeScript for ES2017 without the DOM types', async () => {
      // With tsc's defaults the DOM `Node` type collides with the `Node` class in
      // the linked-list lessons' tests, and every TypeScript run of those lessons
      // fails to compile. Confirmed against the hosted Judge0 on 2026-10-14.
      const { judge0, fetchMock } = loadJudge0();

      await judge0.executeCodeSubmission('class Node {}', CodingLanguage.Typescript, 'lesson-1');

      expect(lastRequest(fetchMock).payload.compiler_options).toBe('--target ES2017 --lib ES2017');
    });

    it.each([CodingLanguage.Javascript, CodingLanguage.Python])(
      'sends no compiler options for %s',
      async (language) => {
        const { judge0, fetchMock } = loadJudge0();

        await judge0.executeCodeSubmission('1', language, 'lesson-1');

        expect(lastRequest(fetchMock).payload).not.toHaveProperty('compiler_options');
      },
    );

    it('never sends a supported runtime id for a language outside the map', async () => {
      // Reachable in production: the route's language guard is a truthiness check
      // against a plain object literal, so inherited keys such as 'constructor'
      // pass validation and land here (see the route test). `mapLanguageToId
      // ['constructor']` is the Object constructor, which JSON.stringify drops -
      // Judge0 receives a submission with no language rather than the client
      // refusing to send it. What must never happen is an unmapped language
      // silently executing under a *real* runtime, e.g. as JavaScript.
      const { judge0, fetchMock } = loadJudge0();

      await judge0.executeCodeSubmission('class A {}', 'constructor' as CodingLanguage, 'lesson-1');

      const { payload } = lastRequest(fetchMock);
      expect(Object.values(judge0.mapLanguageToId)).not.toContain(payload.language_id);
    });
  });

  describe('callback url', () => {
    it('addresses the callback to the submission row on ROOT_URL, with the shared secret', async () => {
      const { judge0, fetchMock } = loadJudge0({
        ROOT_URL: 'https://www.skilled.dev',
        JUDGE0_CALLBACK_BASE_URL: undefined,
      });

      await judge0.executeCodeSubmission('code', CodingLanguage.Javascript, 'submission-abc');

      const callbackUrl = new URL(String(lastRequest(fetchMock).payload.callback_url));
      expect(callbackUrl.origin).toBe('https://www.skilled.dev');
      expect(callbackUrl.pathname).toBe('/api/v1/judge0/callback/submission-abc');
      expect(callbackUrl.searchParams.get('callback_secret')).toBe('callback-secret-value');
      // Judge0 sends every callback base64-encoded with its default fields, so
      // the URL carries nothing but the secret.
      expect(Array.from(callbackUrl.searchParams.keys())).toEqual(['callback_secret']);
    });

    it('prefers JUDGE0_CALLBACK_BASE_URL, so local development can use a tunnel', async () => {
      const { judge0, fetchMock } = loadJudge0({
        ROOT_URL: 'http://localhost:3000',
        JUDGE0_CALLBACK_BASE_URL: 'https://my-tunnel.example.dev/',
      });

      await judge0.executeCodeSubmission('code', CodingLanguage.Javascript, 'submission-abc');

      const callbackUrl = String(lastRequest(fetchMock).payload.callback_url);
      expect(callbackUrl.startsWith('https://my-tunnel.example.dev/api/v1/judge0/callback/')).toBe(true);
    });

    it.each(['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost'])(
      'refuses to submit with a callback Judge0 cannot reach (%s), and never sends the secret elsewhere',
      async (ROOT_URL) => {
        // There used to be a hardcoded ngrok host here that received the real
        // secret whenever ROOT_URL was localhost.
        const { judge0, fetchMock } = loadJudge0({ ROOT_URL, JUDGE0_CALLBACK_BASE_URL: undefined });

        await expect(
          judge0.executeCodeSubmission('code', CodingLanguage.Javascript, 'submission-1'),
        ).rejects.toThrow('Set JUDGE0_CALLBACK_BASE_URL');
        expect(fetchMock).not.toHaveBeenCalled();
      },
    );

    it('encodes the submission id, so nothing in it can cut off the secret', async () => {
      const { judge0, fetchMock } = loadJudge0();

      await judge0.executeCodeSubmission('code', CodingLanguage.Javascript, 'odd#id?x=1');

      const callbackUrl = new URL(String(lastRequest(fetchMock).payload.callback_url));
      expect(callbackUrl.pathname).toBe('/api/v1/judge0/callback/odd%23id%3Fx%3D1');
      expect(callbackUrl.searchParams.get('callback_secret')).toBe('callback-secret-value');
    });

    it.each([
      ['unset', undefined],
      // The empty-env-var misconfiguration has to fail closed too.
      ['empty', ''],
    ])(
      'refuses to submit when ROOT_URL is %s rather than posting an unroutable callback',
      async (_label, ROOT_URL) => {
        const { judge0, fetchMock } = loadJudge0({ ROOT_URL, JUDGE0_CALLBACK_BASE_URL: undefined });

        await expect(
          judge0.executeCodeSubmission('code', CodingLanguage.Javascript, 'lesson-1'),
        ).rejects.toThrow('ROOT_URL environment variable is required');
        expect(fetchMock).not.toHaveBeenCalled();
      },
    );

    it.each([
      ['unset', undefined],
      ['empty', ''],
    ])(
      'refuses to submit when JUDGE0_CALLBACK_SECRET is %s (fails closed)',
      async (_label, JUDGE0_CALLBACK_SECRET) => {
        // The callback route authenticates Judge0 with this secret. Submitting
        // without one would produce results the route must reject with a 401, so
        // the client has to refuse before it spends a Judge0 execution.
        const { judge0, fetchMock } = loadJudge0({ JUDGE0_CALLBACK_SECRET });

        await expect(
          judge0.executeCodeSubmission('code', CodingLanguage.Javascript, 'lesson-1'),
        ).rejects.toThrow('JUDGE0_CALLBACK_SECRET environment variable is required');
        expect(fetchMock).not.toHaveBeenCalled();
      },
    );
  });

  describe('mapLanguageToId', () => {
    it('pins each language to its Judge0 runtime id', () => {
      // Running a submission under the wrong runtime silently fails every test
      // case for a user, so these ids are load bearing.
      const { judge0 } = loadJudge0();

      expect(judge0.mapLanguageToId).toEqual({
        [CodingLanguage.Javascript]: 63,
        [CodingLanguage.Typescript]: 74,
        [CodingLanguage.Python]: 71,
      });
    });
  });

  describe('getCodeSubmission()', () => {
    // NOTE: `getCodeSubmission` is exported but has no caller anywhere in src/ -
    // the results come back over the PUT callback instead. Kept to one test that
    // pins the request shape; a test asserting that an unencoded token can walk
    // out of /submissions/ was removed, because the token is not reachable from a
    // request today and the assertion could only ever fail once someone added the
    // encodeURIComponent that fixes it.
    it('fetches the submission by token with a GET', async () => {
      const { judge0, fetchMock } = loadJudge0();

      await judge0.getCodeSubmission('abc-123');

      const { url, config } = lastRequest(fetchMock);
      expect(url).toBe(
        'https://judge0-ce.p.rapidapi.com/submissions/abc-123?base64_encoded=false&fields=*',
      );
      expect(config.method).toBe('GET');
      expect(config.body).toBeUndefined();
    });
  });

  describe('error propagation', () => {
    it('rejects with the parsed Judge0 error body when the response is not ok', async () => {
      const { judge0, fetchMock } = loadJudge0();
      fetchMock.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'quota exceeded' }),
      });

      await expect(
        judge0.executeCodeSubmission('code', CodingLanguage.Javascript, 'lesson-1'),
      ).rejects.toEqual({ error: 'quota exceeded' });
    });
  });
});
