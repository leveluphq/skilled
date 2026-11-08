/**
 * Tests for the Hasura GraphQL proxy (`src/pages/api/graphql.ts`).
 *
 * This endpoint holds the Hasura admin secret, so the security property that
 * matters is: the upstream `x-hasura-*` headers are derived ONLY from the
 * server-verified session cookie, and NOTHING the client sends in headers is
 * forwarded. Every test below inspects the exact header set handed to `fetch`.
 */

import { createMocks, RequestOptions } from 'node-mocks-http';
import jwt from 'jsonwebtoken';
import type { NextApiRequest, NextApiResponse } from 'next';

const JWT_SECRET = Buffer.alloc(64, 'a').toString('base64');
const JWT_TOKEN_NAME = 'skilled-proxy-token';
const HASURA_CLAIMS_KEY = 'https://hasura.io/jwt/claims';
const GRAPHQL_URL = 'https://hasura.internal.test/v1/graphql';
const ADMIN_SECRET = 'admin-secret-must-never-leak';

const ENV = {
  JWT_SECRET,
  JWT_TOKEN_NAME,
  ROOT_DOMAIN: 'skilled.test',
  ROOT_URL: 'https://skilled.test',
  GRAPHQL_URL,
  HASURA_GRAPHQL_ADMIN_SECRET: ADMIN_SECRET,
};

const originalEnv = { ...process.env };
const originalFetch = global.fetch;

type Handler = (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void;

/**
 * The proxy reads GRAPHQL_URL / HASURA_GRAPHQL_ADMIN_SECRET at module scope, so
 * the module has to be loaded after the environment is arranged for each case.
 */
const loadHandler = (envOverrides: Record<string, string | undefined> = {}): Handler => {
  jest.resetModules();
  Object.assign(process.env, ENV, envOverrides);

  Object.entries(envOverrides).forEach(([key, value]) => {
    if (value === undefined) {
      delete process.env[key];
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require('pages/api/graphql').default as Handler;
};

const signToken = (userId: string, roles: string[] = ['user', 'anonymous'], defaultRole = 'user') =>
  jwt.sign(
    {
      tokenId: 'token-id',
      sub: userId,
      [HASURA_CLAIMS_KEY]: {
        'x-hasura-allowed-roles': roles,
        'x-hasura-default-role': defaultRole,
        'x-hasura-user-id': userId,
      },
    },
    JWT_SECRET,
    { expiresIn: '1h' },
  );

const mockUpstream = ({
  status = 200,
  body = '{"data":{"ok":true}}',
  contentType = 'application/json; charset=utf-8',
}: { status?: number; body?: string; contentType?: string | null } = {}) => {
  const fetchMock = jest.fn().mockResolvedValue({
    status,
    text: jest.fn().mockResolvedValue(body),
    headers: { get: (name: string) => (name === 'content-type' ? contentType : null) },
  });

  (global as any).fetch = fetchMock;

  return fetchMock;
};

type CallOptions = Omit<RequestOptions, 'body'> & { body?: unknown };

const call = async (handler: Handler, options: CallOptions) => {
  const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
    method: 'POST',
    ...options,
  } as RequestOptions);

  await handler(req, res);

  return res;
};

const sentHeaders = (fetchMock: jest.Mock): Record<string, string> =>
  fetchMock.mock.calls[0][1].headers;

describe('api/graphql (Hasura proxy)', () => {
  afterEach(() => {
    process.env = { ...originalEnv };
    (global as any).fetch = originalFetch;
    jest.restoreAllMocks();
  });

  describe('header derivation', () => {
    it('ignores every client-supplied x-hasura-* header for an anonymous caller', async () => {
      const fetchMock = mockUpstream();
      const handler = loadHandler();

      await call(handler, {
        headers: {
          'x-hasura-role': 'admin',
          'x-hasura-user-id': 'victim-user-id',
          'x-hasura-admin-secret': 'attacker-guessed-secret',
          'x-hasura-allowed-roles': 'admin',
        },
        body: { query: '{ users { id } }' },
      });

      const headers = sentHeaders(fetchMock);

      expect(headers['x-hasura-role']).toBe('anonymous');
      expect(headers['x-hasura-admin-secret']).toBe(ADMIN_SECRET);
      // No session -> no user id may be asserted upstream at all.
      expect(headers).not.toHaveProperty('x-hasura-user-id');
      expect(headers).not.toHaveProperty('x-hasura-allowed-roles');
      // The full header set is a fixed allowlist, not a merge of request headers.
      expect(Object.keys(headers).sort()).toEqual([
        'content-type',
        'x-hasura-admin-secret',
        'x-hasura-role',
      ]);
    });

    it('derives role and user id from the verified session, not from spoofed headers', async () => {
      const fetchMock = mockUpstream();
      const handler = loadHandler();

      await call(handler, {
        cookies: { [JWT_TOKEN_NAME]: signToken('real-user-id') },
        headers: {
          'x-hasura-role': 'admin',
          'x-hasura-user-id': 'victim-user-id',
        },
        body: { query: '{ users { id } }' },
      });

      const headers = sentHeaders(fetchMock);

      expect(headers['x-hasura-role']).toBe('user');
      expect(headers['x-hasura-user-id']).toBe('real-user-id');
      expect(headers['x-hasura-user-id']).not.toBe('victim-user-id');
      // The authenticated branch is a fixed allowlist too. Without this the
      // anonymous-only key-set assertion misses a regression that merges the
      // request headers in only when a session is present.
      expect(Object.keys(headers).sort()).toEqual([
        'content-type',
        'x-hasura-admin-secret',
        'x-hasura-role',
        'x-hasura-user-id',
      ]);
    });

    it('stays anonymous for a correctly signed token that carries no hasura claims', async () => {
      const fetchMock = mockUpstream();
      const handler = loadHandler();

      // Correct secret, correct signature - but no `x-hasura-user-id` claim to
      // read. The proxy must fall back to anonymous rather than asserting an
      // `x-hasura-user-id: undefined` upstream.
      const claimless = jwt.sign({ sub: 'real-user-id' }, JWT_SECRET, { expiresIn: '1h' });

      await call(handler, {
        cookies: { [JWT_TOKEN_NAME]: claimless },
        body: { query: '{ users { id } }' },
      });

      const headers = sentHeaders(fetchMock);

      expect(headers['x-hasura-role']).toBe('anonymous');
      expect(headers).not.toHaveProperty('x-hasura-user-id');
    });

    it('falls back to anonymous when the session cookie is forged or tampered with', async () => {
      const fetchMock = mockUpstream();
      const handler = loadHandler();

      // Signed with a different secret: the payload claims a user, the signature does not verify.
      const forged = jwt.sign(
        {
          sub: 'attacker',
          [HASURA_CLAIMS_KEY]: {
            'x-hasura-allowed-roles': ['admin'],
            'x-hasura-default-role': 'admin',
            'x-hasura-user-id': 'attacker',
          },
        },
        Buffer.alloc(64, 'z').toString('base64'),
      );

      await call(handler, {
        cookies: { [JWT_TOKEN_NAME]: forged },
        body: { query: '{ users { id } }' },
      });

      const headers = sentHeaders(fetchMock);

      expect(headers['x-hasura-role']).toBe('anonymous');
      expect(headers).not.toHaveProperty('x-hasura-user-id');
    });

    it('never escalates to the admin role even when the session token claims it', async () => {
      const fetchMock = mockUpstream();
      const handler = loadHandler();

      await call(handler, {
        cookies: { [JWT_TOKEN_NAME]: signToken('admin-user', ['user', 'anonymous', 'admin'], 'admin') },
        body: { query: '{ users { id } }' },
      });

      // Role is hard-coded to user/anonymous: an admin session gets no extra
      // Hasura privileges through this proxy.
      expect(sentHeaders(fetchMock)['x-hasura-role']).toBe('user');
    });

    it('does not forward the request cookie or authorization header upstream', async () => {
      const fetchMock = mockUpstream();
      const handler = loadHandler();

      await call(handler, {
        cookies: { [JWT_TOKEN_NAME]: signToken('real-user-id') },
        headers: {
          cookie: `${JWT_TOKEN_NAME}=something; other=value`,
          authorization: 'Bearer attacker-token',
        },
        body: { query: '{ users { id } }' },
      });

      const headers = sentHeaders(fetchMock);

      expect(headers).not.toHaveProperty('cookie');
      expect(headers).not.toHaveProperty('authorization');
    });
  });

  describe('request forwarding', () => {
    it('posts the serialized body to the configured upstream URL', async () => {
      const fetchMock = mockUpstream();
      const handler = loadHandler();
      const body = { query: '{ users { id } }', variables: { id: 1 } };

      await call(handler, { body });

      const [url, init] = fetchMock.mock.calls[0];

      expect(url).toBe(GRAPHQL_URL);
      expect(init.method).toBe('POST');
      expect(init.body).toBe(JSON.stringify(body));
    });

    it('passes a raw string body through untouched rather than double-encoding it', async () => {
      const fetchMock = mockUpstream();
      const handler = loadHandler();
      const raw = '{"query":"{ users { id } }"}';

      await call(handler, { body: raw });

      expect(fetchMock.mock.calls[0][1].body).toBe(raw);
    });

    it.each([['undefined', undefined], ['null', null]])(
      'sends an empty JSON object when req.body is %s',
      async (_label, value) => {
        const fetchMock = mockUpstream();
        const handler = loadHandler();

        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({ method: 'POST' });
        // node-mocks-http coerces a missing `body` option to `{}`, so passing
        // `body: undefined` through `createMocks` never reaches the `req.body ||
        // {}` fallback - it has to be assigned after the request is built.
        (req as { body?: unknown }).body = value;

        await handler(req, res);

        expect(fetchMock.mock.calls[0][1].body).toBe('{}');
      },
    );

    it('mirrors the upstream status code and content type back to the caller', async () => {
      mockUpstream({ status: 400, body: '{"errors":[{"message":"bad"}]}', contentType: 'application/json' });
      const handler = loadHandler();

      const res = await call(handler, { body: { query: 'bad' } });

      expect(res._getStatusCode()).toBe(400);
      expect(res.getHeader('Content-Type')).toBe('application/json');
      expect(res._getData()).toBe('{"errors":[{"message":"bad"}]}');
    });

    it('defaults the content type to application/json when upstream omits it', async () => {
      mockUpstream({ contentType: null });
      const handler = loadHandler();

      const res = await call(handler, { body: { query: '{ ok }' } });

      expect(res.getHeader('Content-Type')).toBe('application/json');
    });
  });

  describe('failure modes', () => {
    it('rejects non-POST requests with 405 and an Allow header', async () => {
      const fetchMock = mockUpstream();
      const handler = loadHandler();

      const res = await call(handler, { method: 'GET' });

      expect(res._getStatusCode()).toBe(405);
      expect(res.getHeader('Allow')).toEqual(['POST']);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('fails closed with 500 when the admin secret is not configured', async () => {
      const fetchMock = mockUpstream();
      const handler = loadHandler({ HASURA_GRAPHQL_ADMIN_SECRET: undefined });

      const res = await call(handler, { body: { query: '{ ok }' } });

      expect(res._getStatusCode()).toBe(500);
      expect(fetchMock).not.toHaveBeenCalled();
      expect(res._getData()).toEqual({
        message: 'GraphQL proxy is not configured',
        statusCode: 500,
      });
    });

    it('fails closed with 500 when the upstream URL is not configured', async () => {
      const fetchMock = mockUpstream();
      const handler = loadHandler({ GRAPHQL_URL: undefined });

      const res = await call(handler, { body: { query: '{ ok }' } });

      expect(res._getStatusCode()).toBe(500);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('returns a generic 500 without leaking the upstream error when fetch rejects', async () => {
      const fetchMock = jest
        .fn()
        .mockRejectedValue(new Error(`connect ECONNREFUSED ${GRAPHQL_URL} secret=${ADMIN_SECRET}`));
      (global as any).fetch = fetchMock;
      const handler = loadHandler();

      const res = await call(handler, { body: { query: '{ ok }' } });

      expect(res._getStatusCode()).toBe(500);
      expect(res._getData()).toEqual({
        message: 'Failed to process GraphQL request',
        statusCode: 500,
      });
      expect(JSON.stringify(res._getData())).not.toContain(ADMIN_SECRET);
    });

    it('applies security headers to every response, including rejected methods', async () => {
      mockUpstream();
      const handler = loadHandler();

      const res = await call(handler, { method: 'DELETE' });

      expect(res.getHeader('X-Frame-Options')).toBe('DENY');
      expect(res.getHeader('X-Content-Type-Options')).toBe('nosniff');
    });
  });
});
