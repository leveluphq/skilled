/**
 * The shared Hasura client is the single trust boundary for every server-side
 * query and mutation in the app: it is the thing that attaches the admin secret
 * (which bypasses every Hasura permission rule). These tests drive the real
 * client with a fake `fetch` so they assert what actually goes
 * out on the wire — endpoint, headers, and how variables are serialised.
 */

// This file defers its imports so setup can run first, leaving it without a
// top-level import/export. Mark it as a module for isolatedModules.
export {};


const ORIGINAL_ENV = process.env;
const ORIGINAL_FETCH = (global as any).fetch;

interface RequestingClient {
  request: <T = any>(query: string, variables?: object) => Promise<T>;
}

let fetchMock: jest.Mock;

const jsonResponse = (body: unknown, { ok = true, status = 200 } = {}) => ({
  ok,
  status,
  headers: {
    get: (name: string) => (name.toLowerCase() === 'content-type' ? 'application/json' : null),
  },
  json: async () => body,
  text: async () => JSON.stringify(body),
});

/**
 * `client.ts` reads its configuration at import time, so every scenario needs a
 * fresh module registry. The client calls the global `fetch`, so assigning ours
 * first puts the mock in place.
 */
const loadClient = (): RequestingClient => {
  jest.resetModules();
  fetchMock = jest.fn();
  (global as any).fetch = fetchMock;

  return require('services/server/graphql/client').default as RequestingClient;
};

/**
 * Same as `loadClient`, but surfaces an import-time throw instead of failing the
 * test — used by the config tests below, where "throws at boot" is one of the
 * acceptable outcomes.
 */
const tryLoadClient = (): { client?: RequestingClient; error?: unknown } => {
  try {
    return { client: loadClient() };
  } catch (error) {
    return { error };
  }
};

const lastFetchCall = () => {
  const [url, init] = fetchMock.mock.calls[0] as [string, any];

  return { url, init, headers: init.headers as Record<string, string> };
};

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

afterAll(() => {
  process.env = ORIGINAL_ENV;
  (global as any).fetch = ORIGINAL_FETCH;
});

describe('graphql client', () => {
  it('posts to GRAPHQL_URL with the Hasura admin secret attached', async () => {
    process.env.GRAPHQL_URL = 'https://hasura.example.test/v1/graphql';
    process.env.HASURA_GRAPHQL_ADMIN_SECRET = 'super-secret-value';

    const client = loadClient();
    fetchMock.mockResolvedValue(jsonResponse({ data: { users: [] } }));

    await client.request('query getUsers { users { id } }');

    const { url, init, headers } = lastFetchCall();

    expect(url).toBe('https://hasura.example.test/v1/graphql');
    expect(init.method).toBe('POST');
    expect(headers['x-hasura-admin-secret']).toBe('super-secret-value');
    expect(headers['Content-Type']).toBe('application/json');
  });

  it('sends variables as a separate JSON field instead of interpolating them into the document', async () => {
    process.env.GRAPHQL_URL = 'https://hasura.example.test/v1/graphql';
    process.env.HASURA_GRAPHQL_ADMIN_SECRET = 'secret';

    const client = loadClient();
    fetchMock.mockResolvedValue(jsonResponse({ data: { users: [] } }));

    // An attacker-supplied value that would break out of the document if the
    // wrappers ever switched to string interpolation.
    const injection =
      '" } }) { id } } mutation evil { delete_users(where: {}) { affected_rows } } #';
    const document = 'query getUserByEmail($email: String) { users(where: {email: {_eq: $email}}) { id } }';

    await client.request(document, { email: injection });

    const { init } = lastFetchCall();
    const body = JSON.parse(init.body);

    expect(body.query).toBe(document);
    expect(body.query).not.toContain(injection);
    expect(body.query).not.toContain('delete_users');
    expect(body.variables).toEqual({ email: injection });
  });

  it('resolves the unwrapped `data` payload, not the raw envelope', async () => {
    process.env.GRAPHQL_URL = 'https://hasura.example.test/v1/graphql';
    process.env.HASURA_GRAPHQL_ADMIN_SECRET = 'secret';

    const client = loadClient();
    fetchMock.mockResolvedValue(jsonResponse({ data: { users: [{ id: 'user-1' }] } }));

    const result = await client.request('query { users { id } }');

    expect(result).toEqual({ users: [{ id: 'user-1' }] });
  });

  it('rejects when Hasura answers with GraphQL errors rather than returning partial data', async () => {
    process.env.GRAPHQL_URL = 'https://hasura.example.test/v1/graphql';
    process.env.HASURA_GRAPHQL_ADMIN_SECRET = 'secret';

    const client = loadClient();
    fetchMock.mockResolvedValue(
      jsonResponse({
        data: { users: null },
        errors: [{ message: 'field "users" not found in type: "query_root"' }],
      }),
    );

    // Every wrapper in queries/ and mutations/ relies on this: a failed request
    // must reject, never resolve to an empty-looking result that a caller would
    // read as "no such row".
    await expect(client.request('query { users { id } }')).rejects.toMatchObject({
      response: { errors: [{ message: 'field "users" not found in type: "query_root"' }] },
    });
  });

  it('rejects with the text of a response that is not JSON, and the request', async () => {
    process.env.GRAPHQL_URL = 'https://hasura.example.test/v1/graphql';
    process.env.HASURA_GRAPHQL_ADMIN_SECRET = 'super-secret-value';

    const client = loadClient();
    fetchMock.mockResolvedValue({
      ok: false,
      status: 502,
      headers: { get: () => 'text/html' },
      text: async () => '<html>Bad Gateway</html>',
    });

    const error = await client
      .request('query getUsers { users { id } }', { id: 1 })
      .catch((e) => e);

    expect(error.response).toEqual({ error: '<html>Bad Gateway</html>', status: 502 });
    expect(error.request).toEqual({
      query: 'query getUsers { users { id } }',
      variables: { id: 1 },
    });
    expect(error.message).toBe(
      'GraphQL Error (Code: 502): {"response":{"error":"<html>Bad Gateway</html>","status":502},"request":{"query":"query getUsers { users { id } }","variables":{"id":1}}}',
    );
    expect(error.message).not.toContain('super-secret-value');
  });

  it('rejects on a non-2xx transport response', async () => {
    process.env.GRAPHQL_URL = 'https://hasura.example.test/v1/graphql';
    process.env.HASURA_GRAPHQL_ADMIN_SECRET = 'secret';

    const client = loadClient();
    fetchMock.mockResolvedValue(
      jsonResponse({ error: 'unauthorized' }, { ok: false, status: 401 }),
    );

    await expect(client.request('query { users { id } }')).rejects.toMatchObject({
      response: { status: 401 },
    });
  });

  /**
   * The admin secret bypasses every Hasura permission rule, so the one place it
   * is allowed to appear is the request header. A secret that also lands in the
   * URL ends up in proxy/CDN access logs and in Sentry's `url` tag; one that
   * lands in the body ends up in request-body capture. Both are the exact
   * disclosure shape commit 03382f36 had to clean up elsewhere.
   */
  it('keeps the admin secret in the header only — never in the URL or the request body', async () => {
    process.env.GRAPHQL_URL = 'https://hasura.example.test/v1/graphql';
    process.env.HASURA_GRAPHQL_ADMIN_SECRET = 'super-secret-value';

    const client = loadClient();
    fetchMock.mockResolvedValue(jsonResponse({ data: { users: [] } }));

    await client.request('query getUsers { users { id } }', { email: 'a@b.c' });

    const { url, init, headers } = lastFetchCall();

    expect(headers['x-hasura-admin-secret']).toBe('super-secret-value');
    expect(url).not.toContain('super-secret-value');
    expect(init.body).not.toContain('super-secret-value');
  });

  /**
   * BUG (reported, deliberately not pinned as passing behaviour): client.ts
   * defaults `HASURA_GRAPHQL_ADMIN_SECRET` to '' and `GRAPHQL_URL` to the
   * relative path '/v1/graphql'. A missing secret therefore produces an
   * anonymous Hasura request instead of a loud failure at boot, and a missing
   * URL produces an opaque fetch error on the first query. These tests assert
   * the *desired* behaviour and are expected to fail today; when the config is
   * validated at import time they will start passing and `.failing` must be
   * dropped.
   */
  it.failing('refuses to issue an anonymous request when the admin secret is missing', async () => {
    process.env.GRAPHQL_URL = 'https://hasura.example.test/v1/graphql';
    delete process.env.HASURA_GRAPHQL_ADMIN_SECRET;

    const loaded = tryLoadClient();

    // Either acceptable fix passes this test: throwing at import, or refusing
    // to send a blank secret.
    if (loaded.error) {
      expect(loaded.error).toBeInstanceOf(Error);

      return;
    }

    fetchMock.mockResolvedValue(jsonResponse({ data: { users: [] } }));
    await loaded.client!.request('query { users { id } }');

    expect(lastFetchCall().headers['x-hasura-admin-secret']).not.toBe('');
  });

  it.failing('refuses to issue a request against a relative endpoint', async () => {
    delete process.env.GRAPHQL_URL;
    process.env.HASURA_GRAPHQL_ADMIN_SECRET = 'secret';

    const loaded = tryLoadClient();

    if (loaded.error) {
      expect(loaded.error).toBeInstanceOf(Error);

      return;
    }

    fetchMock.mockResolvedValue(jsonResponse({ data: {} }));
    await loaded.client!.request('query { users { id } }');

    expect(lastFetchCall().url).toMatch(/^https?:\/\//);
  });
});
