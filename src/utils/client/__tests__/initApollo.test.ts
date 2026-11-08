/**
 * `initApollo` builds the Apollo client used on both sides of the app. The parts worth
 * pinning down are the ones that are silently wrong rather than loudly broken:
 *  - the server must build a *fresh* client per request (a shared one would leak one
 *    user's cache and forwarded Cookie header into another user's render),
 *  - the GraphQL endpoint it derives, including the untrusted `host` header branch,
 *  - the custom cache key for `users_lessons_status` rows, which have no `id` column,
 *  - the error link actually being in the chain so failures reach Sentry.
 *
 * No network: `isomorphic-unfetch` is mocked, so any real request would fail loudly.
 */
const mockFetch = jest.fn();
const mockCreateHttpLink = jest.fn();
const mockCaptureMessage = jest.fn();
const mockCaptureException = jest.fn();

jest.mock('isomorphic-unfetch', () => ({
  __esModule: true,
  default: (...args: any[]) => mockFetch(...args),
}));

jest.mock('utils/shared/sentry', () => ({
  __esModule: true,
  default: {
    withScope: (callback: (scope: any) => void) => callback({}),
    captureMessage: (...args: any[]) => mockCaptureMessage(...args),
    captureException: (...args: any[]) => mockCaptureException(...args),
  },
}));

jest.mock('@apollo/client', () => {
  const actual = jest.requireActual('@apollo/client');

  return {
    ...actual,
    createHttpLink: (options: any) => {
      mockCreateHttpLink(options);
      return actual.createHttpLink(options);
    },
  };
});

import { gql } from '@apollo/client';
import initApollo from 'utils/client/initApollo';

const ORIGINAL_ROOT_URL = process.env.ROOT_URL;
const ORIGINAL_NODE_ENV = process.env.NODE_ENV;

const lastHttpOptions = () => mockCreateHttpLink.mock.calls[mockCreateHttpLink.mock.calls.length - 1][0];

const uriFor = (headers: Record<string, string | string[]> = {}) => {
  initApollo(undefined, { headers: headers as any });
  return lastHttpOptions().uri;
};

const restoreEnv = (key: 'ROOT_URL' | 'NODE_ENV', value: string | undefined) => {
  if (value === undefined) {
    delete (process.env as any)[key];
  } else {
    (process.env as any)[key] = value;
  }
};

beforeEach(() => {
  jest.clearAllMocks();
  restoreEnv('ROOT_URL', ORIGINAL_ROOT_URL);
  restoreEnv('NODE_ENV', ORIGINAL_NODE_ENV);
});

afterAll(() => {
  restoreEnv('ROOT_URL', ORIGINAL_ROOT_URL);
  restoreEnv('NODE_ENV', ORIGINAL_NODE_ENV);
});

describe('initApollo - per-request isolation on the server', () => {
  it('builds a brand new client for every server-side call', () => {
    // Sharing a client across SSR requests would serve one user's cached data - and
    // their forwarded Cookie header - to the next visitor.
    const first = initApollo(undefined, { headers: { cookie: 'session=alice' } });
    const second = initApollo(undefined, { headers: { cookie: 'session=bob' } });

    expect(first).not.toBe(second);
    expect(first.cache).not.toBe(second.cache);
    expect(mockCreateHttpLink.mock.calls[0][0].headers).toEqual({ cookie: 'session=alice' });
    expect(mockCreateHttpLink.mock.calls[1][0].headers).toEqual({ cookie: 'session=bob' });
  });

  it('does not bleed one request\'s cache into the next', () => {
    const QUERY = gql`
      query Me {
        me {
          id
          email
        }
      }
    `;
    const alice = initApollo(undefined, { headers: { cookie: 'session=alice' } });
    alice.cache.writeQuery({
      query: QUERY,
      data: { me: { __typename: 'users', id: 'alice', email: 'alice@example.com' } },
    });

    const bob = initApollo(undefined, { headers: { cookie: 'session=bob' } });

    expect(JSON.stringify(bob.cache.extract())).not.toContain('alice@example.com');
  });

  it('runs in ssrMode on the server so each query only fires once per render', () => {
    expect(initApollo().disableNetworkFetches).toBe(true);
  });

  it('reuses one client in the browser and points at the relative proxy path', () => {
    // Browser-side there is no per-request isolation to preserve and the browser
    // attaches cookies itself, so the client is a module singleton on a relative URI.
    (global as any).window = {};

    try {
      let browserInitApollo: typeof initApollo = undefined as any;
      jest.isolateModules(() => {
        browserInitApollo = require('utils/client/initApollo').default;
      });

      const first = browserInitApollo(undefined, { headers: { cookie: 'session=alice' } });
      const second = browserInitApollo({ 'lessons:1': { __typename: 'lessons', id: '1' } }, {});

      expect(second).toBe(first);
      expect(mockCreateHttpLink).toHaveBeenCalledTimes(1);
      expect(lastHttpOptions().uri).toBe('/api/graphql');
      // The singleton means a later call's apolloState is dropped rather than restored.
      expect(second.cache.extract()['lessons:1']).toBeUndefined();
    } finally {
      delete (global as any).window;
    }
  });

  it('rehydrates the cache from the serialized apollo state', () => {
    const state = { 'lessons:1': { __typename: 'lessons', id: '1', title: 'Two Sum' } };

    expect(initApollo(state).cache.extract()).toMatchObject(state);
  });
});

describe('initApollo - server GraphQL endpoint resolution', () => {
  it('falls back to ROOT_URL when the caller passes no headers', () => {
    process.env.ROOT_URL = 'https://skilled.dev';

    expect(uriFor()).toBe('https://skilled.dev/api/graphql');
    expect(uriFor({})).toBe('https://skilled.dev/api/graphql');
  });

  it('falls back to localhost when neither a host header nor ROOT_URL is available', () => {
    delete (process.env as any).ROOT_URL;

    expect(uriFor()).toBe('http://localhost:3000/api/graphql');
  });

  // BUG (latent, currently unreachable): `host` and `x-forwarded-proto` are
  // attacker-controlled request headers, and they take priority over ROOT_URL. If any
  // caller ever forwarded `req.headers` wholesale, a spoofed Host would make SSR post
  // the user's forwarded session cookie to an attacker's origin. Today the only caller
  // (withApollo) passes `{ cookie }` alone, so this branch is dead - but it should
  // validate the host against an allowlist / prefer ROOT_URL. Current behaviour:
  it('prefers the request host header over ROOT_URL', () => {
    process.env.ROOT_URL = 'https://skilled.dev';

    expect(uriFor({ host: 'evil.example.com' })).toBe('http://evil.example.com/api/graphql');
  });

  it('honours x-forwarded-proto, including when the proxy sends it as a list', () => {
    expect(uriFor({ host: 'skilled.dev', 'x-forwarded-proto': 'https' })).toBe(
      'https://skilled.dev/api/graphql',
    );
    expect(uriFor({ host: 'skilled.dev', 'x-forwarded-proto': ['https', 'http'] })).toBe(
      'https://skilled.dev/api/graphql',
    );
  });

  it('defaults to https for a host header in production and http elsewhere', () => {
    (process.env as any).NODE_ENV = 'production';
    expect(uriFor({ host: 'skilled.dev' })).toBe('https://skilled.dev/api/graphql');

    (process.env as any).NODE_ENV = 'development';
    expect(uriFor({ host: 'skilled.dev' })).toBe('http://skilled.dev/api/graphql');
  });

  it('ignores an empty host header and falls back to ROOT_URL', () => {
    process.env.ROOT_URL = 'https://skilled.dev';

    expect(uriFor({ host: '' })).toBe('https://skilled.dev/api/graphql');
    expect(uriFor({ host: [] as any })).toBe('https://skilled.dev/api/graphql');
  });

  it('ignores an empty x-forwarded-proto and uses the environment default protocol', () => {
    expect(uriFor({ host: 'skilled.dev', 'x-forwarded-proto': [] as any })).toBe(
      'http://skilled.dev/api/graphql',
    );
    expect(uriFor({ host: 'skilled.dev', 'x-forwarded-proto': '' })).toBe(
      'http://skilled.dev/api/graphql',
    );
  });

  it('takes the first value when host arrives as a duplicated header array', () => {
    // Header smuggling sends `host` twice; node surfaces that as an array.
    expect(uriFor({ host: ['skilled.dev', 'evil.example.com'] })).toBe(
      'http://skilled.dev/api/graphql',
    );
  });

  it('sends the forwarded headers on the request and keeps credentials same-origin', () => {
    initApollo(undefined, { headers: { cookie: 'session=alice' } });

    expect(lastHttpOptions()).toMatchObject({
      headers: { cookie: 'session=alice' },
      credentials: 'same-origin',
    });
  });

  it('sends no cookie header at all when the caller forwards none', () => {
    initApollo();

    expect(lastHttpOptions().headers).toEqual({});
  });

  it('copies the caller\'s headers instead of aliasing them', () => {
    // withApollo hands the same options object to the SSR render tree after this
    // call; aliasing would let a later mutation there rewrite the live link's headers.
    const options = { headers: { cookie: 'session=alice' } };
    initApollo(undefined, options);

    const sent = lastHttpOptions().headers;
    options.headers.cookie = 'session=mallory';

    expect(sent).toEqual({ cookie: 'session=alice' });
  });
});

describe('initApollo - cache identity for users_lessons_status', () => {
  const STATUS_QUERY = gql`
    query Statuses {
      users_lessons_status {
        userId
        lessonId
        isCompleted
      }
    }
  `;

  it('keys rows by userId + lessonId instead of collapsing them together', () => {
    // `users_lessons_status` has no `id` column, so the default key function would
    // return undefined and every row for a lesson would be stored unnormalized.
    const client = initApollo();

    client.cache.writeQuery({
      query: STATUS_QUERY,
      data: {
        users_lessons_status: [
          { __typename: 'users_lessons_status', userId: 'u1', lessonId: 'l1', isCompleted: true },
          { __typename: 'users_lessons_status', userId: 'u1', lessonId: 'l2', isCompleted: false },
          { __typename: 'users_lessons_status', userId: 'u2', lessonId: 'l1', isCompleted: false },
        ],
      },
    });

    const keys = Object.keys(client.cache.extract());
    expect(keys).toEqual(
      expect.arrayContaining([
        'users_lessons_status:u1:l1',
        'users_lessons_status:u1:l2',
        'users_lessons_status:u2:l1',
      ]),
    );
  });

  it('merges a repeat write of the same user/lesson pair into one entry', () => {
    const client = initApollo();
    const write = (isCompleted: boolean) =>
      client.cache.writeQuery({
        query: STATUS_QUERY,
        data: {
          users_lessons_status: [
            { __typename: 'users_lessons_status', userId: 'u1', lessonId: 'l1', isCompleted },
          ],
        },
      });

    write(false);
    write(true);

    const extracted: any = client.cache.extract();
    expect(Object.keys(extracted).filter((key) => key.startsWith('users_lessons_status'))).toEqual([
      'users_lessons_status:u1:l1',
    ]);
    expect(extracted['users_lessons_status:u1:l1'].isCompleted).toBe(true);
  });

  it('still uses the default Typename:id key for every other type', () => {
    const client = initApollo();

    client.cache.writeQuery({
      query: gql`
        query Lesson {
          lessons {
            id
            title
          }
        }
      `,
      data: { lessons: [{ __typename: 'lessons', id: 'abc', title: 'Two Sum' }] },
    });

    expect(Object.keys(client.cache.extract())).toEqual(expect.arrayContaining(['lessons:abc']));
  });
});

describe('initApollo - error link wiring', () => {
  const PING = gql`
    query Ping {
      ping
    }
  `;

  it('reports network failures to Sentry and still rejects the query', async () => {
    mockFetch.mockRejectedValue(new Error('ECONNREFUSED'));
    const client = initApollo();

    await expect(client.query({ query: PING, fetchPolicy: 'no-cache' })).rejects.toThrow();

    expect(mockCaptureException).toHaveBeenCalledTimes(1);
    expect(mockCaptureException.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(mockCaptureMessage).not.toHaveBeenCalled();
  });

  it('reports each GraphQL error message to Sentry', async () => {
    mockFetch.mockResolvedValue({
      status: 200,
      ok: true,
      text: () =>
        Promise.resolve(
          JSON.stringify({ errors: [{ message: 'permission denied' }, { message: 'field missing' }] }),
        ),
    });
    const client = initApollo();

    await expect(client.query({ query: PING, fetchPolicy: 'no-cache' })).rejects.toThrow();

    expect(mockCaptureMessage.mock.calls.map((call) => call[0])).toEqual([
      'permission denied',
      'field missing',
    ]);
    expect(mockCaptureException).not.toHaveBeenCalled();
  });

  it('does not report anything to Sentry on a successful query', async () => {
    mockFetch.mockResolvedValue({
      status: 200,
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ data: { ping: 'pong' } })),
    });
    const client = initApollo();

    await expect(client.query({ query: PING, fetchPolicy: 'no-cache' })).resolves.toMatchObject({
      data: { ping: 'pong' },
    });

    expect(mockCaptureException).not.toHaveBeenCalled();
    expect(mockCaptureMessage).not.toHaveBeenCalled();
  });
});
