/**
 * Tests for `configureReq` in utils/shared/sentry.
 *
 * Everything this function attaches to the Sentry scope is uploaded with every
 * captured event, so the interesting assertions are all negative: the session
 * JWT (cookies), the Judge0 callback secret (query string of the url), the
 * Hasura admin secret (headers) and request-body credentials must not survive.
 *
 * `@sentry/node` is mocked at the module boundary so nothing is transmitted and
 * so the scope object passed to `configureScope` can be inspected.
 */

// This file defers its imports with require() so env vars can be set first,
// which leaves it without a top-level import/export. Mark it as a module so it
// satisfies the project's isolatedModules setting.
export {};

jest.mock('@sentry/node', () => {
  const scope = {
    setTag: jest.fn(),
    setContext: jest.fn(),
    setExtra: jest.fn(),
    setUser: jest.fn(),
    setLevel: jest.fn(),
  };

  return {
    __esModule: true,
    init: jest.fn(),
    configureScope: jest.fn((callback: (s: typeof scope) => void) => callback(scope)),
    withScope: jest.fn((callback: (s: typeof scope) => void) => callback(scope)),
    captureException: jest.fn(),
    __scope: scope,
  };
});

// eslint-disable-next-line @typescript-eslint/no-var-requires
const sentryNode = require('@sentry/node') as any;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { configureReq } = require('utils/shared/sentry') as typeof import('utils/shared/sentry');

const scope = sentryNode.__scope as {
  setTag: jest.Mock;
  setContext: jest.Mock;
};

const REDACTED = '[redacted]';

const SESSION_JWT =
  'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyLTEyMyJ9.s3cr3t-s1gnatur3-do-not-leak';

/** Last value written for a tag (configureReq may be called after module init). */
const tag = (name: string) => {
  const call = [...scope.setTag.mock.calls].reverse().find(([key]) => key === name);
  return call ? call[1] : undefined;
};

const context = (name: string) => {
  const call = [...scope.setContext.mock.calls].reverse().find(([key]) => key === name);
  return call ? call[1] : undefined;
};

/** Everything that would be shipped to Sentry, flattened for leak assertions. */
const everythingReported = () =>
  JSON.stringify([scope.setTag.mock.calls, scope.setContext.mock.calls]);

const asReq = (req: unknown) => req as Parameters<typeof configureReq>[0];

/** How many times a given tag/context key was written. */
const writeCount = (mock: jest.Mock, name: string) =>
  mock.mock.calls.filter(([key]) => key === name).length;

beforeEach(() => {
  scope.setTag.mockClear();
  scope.setContext.mockClear();
});

describe('configureReq — url tag', () => {
  it('strips the query string, where the Judge0 callback secret lives', () => {
    configureReq(
      asReq({
        url: '/api/v1/lessons/42/submissions/code?callbackSecret=judge0-shared-secret&id=7',
        method: 'PUT',
        headers: { host: 'skilled.dev' },
      }),
    );

    expect(tag('url')).toBe('/api/v1/lessons/42/submissions/code');
    expect(tag('method')).toBe('PUT');
    expect(tag('host')).toBe('skilled.dev');
    expect(everythingReported()).not.toContain('judge0-shared-secret');
  });

  it('strips everything after the first ? even with repeated question marks', () => {
    configureReq(asReq({ url: '/api/x?a=1?b=secret-value' }));

    expect(tag('url')).toBe('/api/x');
    expect(everythingReported()).not.toContain('secret-value');
  });

  it('defaults url/method to empty strings when the request has neither', () => {
    configureReq(asReq({}));

    expect(tag('url')).toBe('');
    expect(tag('method')).toBe('');
    expect(tag('host')).toBeUndefined();
    expect(context('cookieNames')).toEqual({ names: [] });
    expect(context('headers')).toEqual({});
  });
});

describe('configureReq — cookies', () => {
  it('reports cookie names only, never the session JWT value', () => {
    configureReq(
      asReq({
        url: '/api/v1/feedback',
        cookies: {
          skilledToken: SESSION_JWT,
          'skilledToken-viewer': '{"id":"user-123"}',
          _ga: 'GA1.2.3',
        },
      }),
    );

    expect(context('cookieNames')).toEqual({
      names: ['skilledToken', 'skilledToken-viewer', '_ga'],
    });
    expect(everythingReported()).not.toContain(SESSION_JWT);
    expect(everythingReported()).not.toContain('user-123');
  });

  it('reports an empty name list when cookies were never parsed onto the request', () => {
    // micro-auth handlers receive a raw IncomingMessage with no `cookies`.
    configureReq(asReq({ url: '/api/auth/google', headers: { cookie: `skilledToken=${SESSION_JWT}` } }));

    expect(context('cookieNames')).toEqual({ names: [] });
    expect(everythingReported()).not.toContain(SESSION_JWT);
  });
});

describe('configureReq — headers', () => {
  it('allowlists headers and drops credential-bearing ones', () => {
    configureReq(
      asReq({
        url: '/api/graphql',
        headers: {
          host: 'skilled.dev',
          'user-agent': 'jest',
          referer: 'https://skilled.dev/lessons',
          'content-type': 'application/json',
          'x-forwarded-for': '203.0.113.4',
          cookie: `skilledToken=${SESSION_JWT}`,
          authorization: 'Bearer super-secret-bearer',
          'x-hasura-admin-secret': 'hasura-admin-secret-value',
          'stripe-signature': 't=1,v1=stripe-sig-value',
        },
      }),
    );

    const headers = context('headers');

    expect(headers).toEqual({
      host: 'skilled.dev',
      'user-agent': 'jest',
      referer: 'https://skilled.dev/lessons',
      'content-type': 'application/json',
      'x-forwarded-for': '203.0.113.4',
    });
    expect(headers).not.toHaveProperty('cookie');
    expect(headers).not.toHaveProperty('authorization');

    const reported = everythingReported();
    expect(reported).not.toContain(SESSION_JWT);
    expect(reported).not.toContain('super-secret-bearer');
    expect(reported).not.toContain('hasura-admin-secret-value');
    expect(reported).not.toContain('stripe-sig-value');
  });

  it('omits allowlisted headers that are absent rather than emitting undefined keys', () => {
    configureReq(asReq({ url: '/x', headers: { host: 'skilled.dev' } }));

    expect(Object.keys(context('headers'))).toEqual(['host']);
  });

  it('returns an empty object when headers are not an object', () => {
    configureReq(asReq({ url: '/x', headers: 'not-an-object' }));

    expect(context('headers')).toEqual({});
  });
});

describe('configureReq — query and body redaction', () => {
  it('redacts credential-shaped query keys and keeps diagnostic ones', () => {
    configureReq(
      asReq({
        url: '/api/v1/lessons/42/submissions/code?callbackSecret=x',
        query: {
          callbackSecret: 'judge0-shared-secret',
          token: 'tok_live_123',
          state: 'oauth-state-value',
          sessionId: 'sess_123',
          id: '42',
          page: '3',
          lang: 'javascript',
        },
      }),
    );

    expect(context('query')).toEqual({
      callbackSecret: REDACTED,
      token: REDACTED,
      state: REDACTED,
      sessionId: REDACTED,
      id: '42',
      page: '3',
      lang: 'javascript',
    });
  });

  it('redacts every sensitive key variant the pattern is meant to catch', () => {
    configureReq(
      asReq({
        body: {
          secret: 'a',
          accessToken: 'b',
          password: 'c',
          passwd: 'd',
          authorization: 'e',
          auth: 'f',
          cookie: 'g',
          session: 'h',
          signature: 'i',
          credentials: 'j',
          apiKey: 'k',
          'api-key': 'l',
          jwt: 'm',
          state: 'n',
          HASURA_GRAPHQL_ADMIN_SECRET: 'o',
          'x-auth-token': 'p',
        },
      }),
    );

    const body = context('body');
    Object.values(body).forEach((value) => expect(value).toBe(REDACTED));
    expect(Object.keys(body)).toHaveLength(16);
  });

  it('over-matches loosely rather than leaking: `author` and `statement` are redacted too', () => {
    configureReq(asReq({ body: { author: 'Ada', statement: 'hello', email: 'a@b.co' } }));

    // Documented trade-off: the pattern is deliberately loose, so benign keys that
    // merely contain `auth`/`state` lose their value. Diagnostics over disclosure.
    expect(context('body')).toEqual({
      author: REDACTED,
      statement: REDACTED,
      email: 'a@b.co',
    });
  });

  it('redacts nested objects recursively without mutating the request body', () => {
    const body = {
      user: { email: 'a@b.co', password: 'hunter2' },
      request: { headers: { authorization: 'Bearer x', 'content-type': 'application/json' } },
      lessonId: '42',
    };

    configureReq(asReq({ body }));

    expect(context('body')).toEqual({
      user: { email: 'a@b.co', password: REDACTED },
      request: { headers: { authorization: REDACTED, 'content-type': 'application/json' } },
      lessonId: '42',
    });
    // The scrubber must not corrupt the body the API handler goes on to use.
    expect(body.user.password).toBe('hunter2');
    expect(body.request.headers.authorization).toBe('Bearer x');
  });

  it('walks arrays and redacts sensitive keys inside their elements', () => {
    configureReq(
      asReq({
        body: {
          submissions: [
            { id: '1', token: 'judge0-token-1' },
            { id: '2', token: 'judge0-token-2' },
          ],
          tags: ['arrays', 'pass', 'through'],
          counts: [1, 2, 3],
        },
      }),
    );

    expect(context('body')).toEqual({
      submissions: [
        { id: '1', token: REDACTED },
        { id: '2', token: REDACTED },
      ],
      tags: ['arrays', 'pass', 'through'],
      counts: [1, 2, 3],
    });
  });

  it('passes primitives and null through untouched', () => {
    configureReq(asReq({ body: 'raw string body', query: null }));

    expect(context('body')).toBe('raw string body');
    expect(context('query')).toBeNull();
  });

  it('reports undefined context when query/body are absent', () => {
    configureReq(asReq({ url: '/api/health' }));

    expect(context('query')).toBeUndefined();
    expect(context('body')).toBeUndefined();
  });

  it('terminates on a circular structure instead of overflowing the stack', () => {
    const body: Record<string, any> = { id: '1', token: 'tok' };
    body.self = body;
    body.list = [body];

    expect(() => configureReq(asReq({ body }))).not.toThrow();

    const result = context('body') as Record<string, any>;
    expect(result.id).toBe('1');
    expect(result.token).toBe(REDACTED);
    expect(result.list[0].token).toBe(REDACTED);
    // The cycle is broken by rebuilding rather than mutating: the reported copy
    // is not the request body itself.
    expect(result).not.toBe(body);
  });

  it('still redacts at the deepest level the budget covers', () => {
    // Guards the budget itself: shrinking `depth > 3` would stop scrubbing
    // credentials that really do sit this deep (e.g. GraphQL variables).
    configureReq(asReq({ body: { l1: { l2: { l3: { password: 'hunter2', id: 'deep' } } } } }));

    expect(context('body')).toEqual({
      l1: { l2: { l3: { password: REDACTED, id: 'deep' } } },
    });
    expect(everythingReported()).not.toContain('hunter2');
  });

  // KNOWN GAP (marked `failing`, not asserted as correct): `redact` bails out on
  // `depth > 3` by returning the *raw* subtree, so a credential nested five levels
  // deep — and, for the same reason, anything behind a cycle — reaches Sentry in
  // the clear. The fix is to emit a placeholder at the cut-off; when that lands
  // this test starts passing and Jest will flag it so the marker can be removed.
  it.failing('redacts sensitive keys nested past the depth budget', () => {
    configureReq(
      asReq({
        body: { a: { b: { c: { d: { password: 'hunter2', token: 'tok_live_1' } } } } },
      }),
    );

    expect(everythingReported()).not.toContain('hunter2');
    expect(everythingReported()).not.toContain('tok_live_1');
  });

  // KNOWN GAP (marked `failing`, not asserted as correct): the OAuth callback hits
  // /api/auth/[...provider] as a NextApiRequest, so `req.query.code` holds the
  // single-use authorization code and configureReq stores req.query in the Sentry
  // `query` context. SENSITIVE_KEY_PATTERN covers `state` but not `code`, so the
  // code is reported verbatim. `code` belongs in the pattern.
  it.failing('redacts the OAuth authorization code alongside the state', () => {
    configureReq(
      asReq({
        url: '/api/auth/google?code=4%2F0AX4XfWh-authorization-code&state=abc',
        query: { provider: ['google'], code: '4/0AX4XfWh-authorization-code', state: 'abc' },
      }),
    );

    expect(context('query')).toEqual({
      provider: ['google'],
      code: REDACTED,
      state: REDACTED,
    });
  });
});

describe('configureReq — shared global scope', () => {
  it('overwrites every field on each call so one request cannot bleed into the next', () => {
    configureReq(
      asReq({
        url: '/api/v1/feedback?token=abc',
        method: 'POST',
        headers: { host: 'skilled.dev', cookie: `skilledToken=${SESSION_JWT}` },
        cookies: { skilledToken: SESSION_JWT },
        query: { token: 'abc' },
        body: { message: 'hi' },
      }),
    );
    configureReq(asReq({ url: '/api/health' }));

    // The scope is process-global (see the NOTE in the source). Writing any of
    // these conditionally would attach request A's data to request B's events.
    expect(tag('url')).toBe('/api/health');
    expect(tag('method')).toBe('');
    expect(context('cookieNames')).toEqual({ names: [] });
    expect(context('headers')).toEqual({});
    expect(context('query')).toBeUndefined();
    expect(context('body')).toBeUndefined();

    ['host', 'url', 'method'].forEach((name) => expect(writeCount(scope.setTag, name)).toBe(2));
    ['query', 'cookieNames', 'body', 'headers'].forEach((name) =>
      expect(writeCount(scope.setContext, name)).toBe(2),
    );
  });
});
