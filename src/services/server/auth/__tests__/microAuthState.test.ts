/**
 * State/cookie behaviour of the three OAuth wrappers.
 *
 * The `state` cookie is the only CSRF defence on the OAuth callback: without it an
 * attacker can replay their own provider `code` against a victim's session and get the
 * victim signed in as the attacker (or, with account linking, the reverse). Every
 * branch that rejects a request here is a branch that must keep rejecting it, so these
 * tests assert both the rejection *and* that no token exchange was attempted.
 *
 * Nothing here touches the network: `fetchJson` is mocked at the module
 * boundary and `OAuth2Client.getToken`/`.request` are stubbed on the prototype. The
 * pure URL building (`generateAuthUrl`) is left real so the redirect assertions mean
 * something.
 */
import type { NextApiResponse } from 'next';

jest.mock('utils/server/fetchJson', () => {
  const actual = jest.requireActual('utils/server/fetchJson');

  return { ...actual, __esModule: true, default: jest.fn() };
});

const ORIGINAL_APP_STAGE = process.env.APP_STAGE;
const ORIGINAL_ROOT_DOMAIN = process.env.ROOT_DOMAIN;

// APP_STAGE is read at module scope by every microAuth* module (via getAuthCookieName),
// so it has to be in place before the requires below.
process.env.APP_STAGE = 'test';
process.env.ROOT_DOMAIN = 'skilled.dev';

/* eslint-disable @typescript-eslint/no-var-requires */
const fetchJsonModule = require('utils/server/fetchJson');
const fetchJson = fetchJsonModule.default as jest.Mock;
const { HttpError } = fetchJsonModule;
const { OAuth2Client } = require('google-auth-library');
const microAuthGoogle = require('../microAuthGoogle').default;
const microAuthFacebook = require('../microAuthFacebook').default;
const microAuthGithub = require('../microAuthGithub').default;
/* eslint-enable @typescript-eslint/no-var-requires */

const CLIENT_SECRET = 'SUPER_SECRET';
const ROOT_URL = 'https://skilled.dev';

type Handler = (fn: any) => (req: any, res: any, ...args: any[]) => Promise<any>;

const createRes = () => {
  const headers: Record<string, any> = {};

  return {
    statusCode: 200,
    headers,
    setHeader: jest.fn((name: string, value: any) => {
      headers[name.toLowerCase()] = value;
    }),
    getHeader: jest.fn((name: string) => headers[name.toLowerCase()]),
    end: jest.fn(),
  } as unknown as NextApiResponse & { headers: Record<string, any> };
};

const createReq = (url: string, cookies?: Record<string, string>, headers: any = {}) => {
  const req: any = { url, headers };

  if (cookies !== undefined) {
    req.cookies = cookies;
  }

  return req;
};

const setCookieHeaders = (res: any): string[] => {
  const raw = res.headers['set-cookie'];

  if (!raw) {
    return [];
  }

  return Array.isArray(raw) ? raw : [raw];
};

const findCookie = (res: any, name: string) =>
  setCookieHeaders(res).find((header) => header.startsWith(`${name}=`));

const readStateCookie = (res: any, name: string) => {
  const header = findCookie(res, name);

  if (!header) {
    throw new Error(`no ${name} cookie was set`);
  }

  return JSON.parse(decodeURIComponent(header.split(';')[0].slice(name.length + 1)));
};

const isExpired = (header: string | undefined) =>
  Boolean(header && /Max-Age=-1/.test(header) && /^[^=]+=;/.test(header));

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

interface ProviderCase {
  name: string;
  cookieName: string;
  path: string;
  callbackPath: string;
  authorizeOrigin: string;
  build: () => Handler;
  expectNoExchange: () => void;
  /**
   * The authorize redirect is the one place the provider learns which callback to
   * come back to; a wrong `redirect_uri` or a dropped scope is a real outage, and for
   * google `generateAuthUrl` is left unmocked so this exercises real code.
   */
  expectAuthorizeUrl: (location: string) => void;
}

const googleCase: ProviderCase = {
  name: 'google',
  cookieName: 't-oauthgoogle',
  path: '/api/auth/google',
  callbackPath: '/api/auth/google/callback',
  authorizeOrigin: 'https://accounts.google.com/o/oauth2/v2/auth',
  build: () =>
    microAuthGoogle({
      clientId: 'google-client-id',
      clientSecret: CLIENT_SECRET,
      callbackUrl: `${ROOT_URL}/api/auth/google/callback`,
      path: '/api/auth/google',
    }),
  expectNoExchange: () => {
    expect(OAuth2Client.prototype.getToken).not.toHaveBeenCalled();
    expect(OAuth2Client.prototype.request).not.toHaveBeenCalled();
  },
  expectAuthorizeUrl: (location) => {
    const params = new URL(location).searchParams;

    expect(params.get('client_id')).toBe('google-client-id');
    expect(params.get('redirect_uri')).toBe(`${ROOT_URL}/api/auth/google/callback`);
    expect(params.get('response_type')).toBe('code');
    expect(params.get('access_type')).toBe('offline');
    // `openid` is what makes this an OIDC request; dropping `email` silently breaks
    // account matching in handlers/google.
    expect(params.get('scope')).toBe('openid email profile');
  },
};

const facebookCase: ProviderCase = {
  name: 'facebook',
  cookieName: 't-oauthfacebook',
  path: '/api/auth/facebook',
  callbackPath: '/api/auth/facebook/callback',
  authorizeOrigin: 'https://www.facebook.com/dialog/oauth',
  build: () =>
    microAuthFacebook({
      appId: 'facebook-app-id',
      appSecret: CLIENT_SECRET,
      callbackUrl: `${ROOT_URL}/api/auth/facebook/callback`,
      path: '/api/auth/facebook',
      scope: 'email',
      apiVersion: '6.0',
    }),
  expectNoExchange: () => expect(fetchJson).not.toHaveBeenCalled(),
  expectAuthorizeUrl: (location) => {
    const params = new URL(location).searchParams;

    expect(params.get('client_id')).toBe('facebook-app-id');
    expect(params.get('redirect_uri')).toBe(`${ROOT_URL}/api/auth/facebook/callback`);
    expect(params.get('response_type')).toBe('code');
    expect(params.get('scope')).toBe('email');
  },
};

const githubCase: ProviderCase = {
  name: 'github',
  cookieName: 't-oauthgithub',
  path: '/api/auth/github',
  callbackPath: '/api/auth/github/callback',
  authorizeOrigin: 'https://github.com/login/oauth/authorize',
  build: () =>
    microAuthGithub({
      clientId: 'github-client-id',
      clientSecret: CLIENT_SECRET,
      callbackUrl: `${ROOT_URL}/api/auth/github/callback`,
      path: '/api/auth/github',
      scope: 'user:email',
    }),
  expectNoExchange: () => expect(fetchJson).not.toHaveBeenCalled(),
  expectAuthorizeUrl: (location) => {
    const params = new URL(location).searchParams;

    expect(params.get('client_id')).toBe('github-client-id');
    expect(params.get('redirect_uri')).toBe(`${ROOT_URL}/api/auth/github/callback`);
    expect(params.get('scope')).toBe('user:email');
  },
};

const PROVIDERS = [googleCase, facebookCase, githubCase];

beforeEach(() => {
  fetchJson.mockReset();
  // Any unexpected outbound call must fail loudly rather than resolve to undefined.
  fetchJson.mockRejectedValue(new Error('network access is disabled in tests'));
  jest
    .spyOn(OAuth2Client.prototype, 'getToken')
    .mockRejectedValue(new Error('network access is disabled in tests'));
  jest
    .spyOn(OAuth2Client.prototype, 'request')
    .mockRejectedValue(new Error('network access is disabled in tests'));
});

afterEach(() => {
  jest.restoreAllMocks();
});

afterAll(() => {
  if (ORIGINAL_APP_STAGE === undefined) {
    delete process.env.APP_STAGE;
  } else {
    process.env.APP_STAGE = ORIGINAL_APP_STAGE;
  }

  if (ORIGINAL_ROOT_DOMAIN === undefined) {
    delete process.env.ROOT_DOMAIN;
  } else {
    process.env.ROOT_DOMAIN = ORIGINAL_ROOT_DOMAIN;
  }
});

describe.each(PROVIDERS)('microAuth $name', (provider) => {
  describe('authorize request', () => {
    it('stores an unpredictable state and sends the same value to the provider', async () => {
      const fn = jest.fn();
      const res = createRes();
      const req = createReq(`${provider.path}?redirect=%2Fcourse`, {});

      await provider.build()(fn)(req, res);

      const stored = readStateCookie(res, provider.cookieName);

      expect(stored.state).toMatch(UUID_V4);
      // The original query is carried through the round trip so the post-login
      // redirect target survives.
      expect(stored.query).toBe('redirect=%2Fcourse');

      const location = res.headers.location as string;

      expect(res.statusCode).toBe(302);
      expect(location.startsWith(provider.authorizeOrigin)).toBe(true);
      expect(location).toContain(`state=${stored.state}`);
      // A redirect is a terminal response: the wrapped handler must not also run.
      expect(fn).not.toHaveBeenCalled();
    });

    it('never puts the client secret in the browser-visible redirect', async () => {
      const res = createRes();

      await provider.build()(jest.fn())(createReq(provider.path, {}), res);

      expect(res.headers.location).not.toContain(CLIENT_SECRET);
      expect(findCookie(res, provider.cookieName)).not.toContain(CLIENT_SECRET);
    });

    it('cannot be made to inject cookie attributes via the authorize query', async () => {
      // `setOauthStateCookie` stores the caller's *raw* query string alongside the
      // state, and that query string is fully attacker-controlled: a sign-in link can
      // carry anything. If it reached the Set-Cookie header unescaped it could append
      // `Domain=`/`HttpOnly` attributes or split off a second cookie. Real
      // `cookie.serialize` runs here, so this is a genuine escaping check.
      const hostile = 'next=/;Domain=evil.com;HttpOnly;Path=/,injected=1&q="x"';
      const res = createRes();

      await provider.build()(jest.fn())(createReq(`${provider.path}?${hostile}`, {}), res);

      const header = findCookie(res, provider.cookieName) as string;
      const attributes = header
        .split(';')
        .slice(1)
        .map((part) => part.trim().split('=')[0].toLowerCase());

      expect(setCookieHeaders(res)).toHaveLength(1);
      expect(attributes).toEqual(['max-age', 'domain', 'path']);
      expect(header).toContain('Domain=skilled.dev');
      expect(header).not.toContain('Domain=evil.com');
      // The delimiters are what matter: `;` and `,` must come back percent-encoded so
      // they stay inside the value instead of starting a new attribute or cookie.
      expect(header.split(';')[0]).not.toMatch(/[,;]/);
      // ...and the value still round-trips unharmed, so escaping did not corrupt the
      // post-login redirect target.
      expect(readStateCookie(res, provider.cookieName).query).toBe(hostile);
    });

    it('issues a fresh state on every authorize request', async () => {
      const handler = provider.build()(jest.fn());
      const first = createRes();
      const second = createRes();

      await handler(createReq(provider.path, {}), first);
      await handler(createReq(provider.path, {}), second);

      expect(readStateCookie(first, provider.cookieName).state).not.toBe(
        readStateCookie(second, provider.cookieName).state,
      );
    });

    it('scopes the state cookie to the root domain and expires it in 6 hours', async () => {
      const res = createRes();

      await provider.build()(jest.fn())(createReq(provider.path, {}), res);

      const header = findCookie(res, provider.cookieName) as string;

      expect(header).toContain('Domain=skilled.dev');
      expect(header).toContain('Max-Age=21600');
      expect(header).toContain('Path=/');
    });

    it('sends the provider the configured client id, callback and scopes', async () => {
      const res = createRes();

      await provider.build()(jest.fn())(createReq(provider.path, {}), res);

      provider.expectAuthorizeUrl(res.headers.location as string);
    });

    /**
     * KNOWN GAP. `setOauthStateCookie` writes the state cookie with no `httpOnly`,
     * `secure` or `sameSite`. It holds the CSRF state and the caller's original query
     * string, so any script on the page can read or overwrite it and it rides over
     * plain HTTP. It should be `httpOnly: true, secure: true, sameSite: 'lax'` — lax
     * still survives the top-level GET redirect back from the provider.
     *
     * Deliberately `it.failing` with the *secure* expectation: the previous version of
     * this test asserted `not.toMatch(/HttpOnly/)`, which would have turned the suite
     * red the moment someone hardened the cookie. Hardening `setOauthStateCookie` now
     * turns this red and the fix is to delete `.failing`.
     */
    it.failing('marks the state cookie HttpOnly, Secure and SameSite', async () => {
      const res = createRes();

      await provider.build()(jest.fn())(createReq(provider.path, {}), res);

      const header = findCookie(res, provider.cookieName) as string;

      expect(header).toMatch(/HttpOnly/i);
      expect(header).toMatch(/Secure/i);
      expect(header).toMatch(/SameSite=Lax/i);
    });
  });

  describe('callback state validation', () => {
    const CODE = 'provider-auth-code';

    it('rejects a callback with no state cookie and attempts no token exchange', async () => {
      const fn = jest.fn();
      const res = createRes();
      const req = createReq(`${provider.callbackPath}?state=attacker-state&code=${CODE}`, {});

      await provider.build()(fn)(req, res);

      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn.mock.calls[0][2]).toEqual({ err: expect.any(Error), provider: provider.name });
      expect(fn.mock.calls[0][2].err.message).toBe('Invalid state');
      expect(fn.mock.calls[0][2].result).toBeUndefined();
      provider.expectNoExchange();
      expect(isExpired(findCookie(res, provider.cookieName))).toBe(true);
    });

    it('rejects a callback whose state does not match the cookie', async () => {
      const fn = jest.fn();
      const res = createRes();
      const req = createReq(`${provider.callbackPath}?state=attacker-state&code=${CODE}`, {
        [provider.cookieName]: JSON.stringify({ state: 'victim-state', query: null }),
      });

      await provider.build()(fn)(req, res);

      expect(fn.mock.calls[0][2].err.message).toBe('Invalid state');
      provider.expectNoExchange();
    });

    it('rejects a callback with no state parameter at all', async () => {
      const fn = jest.fn();
      const res = createRes();
      const req = createReq(`${provider.callbackPath}?code=${CODE}`, {
        [provider.cookieName]: JSON.stringify({ state: 'victim-state', query: null }),
      });

      await provider.build()(fn)(req, res);

      expect(fn.mock.calls[0][2].err.message).toBe('Invalid state');
      provider.expectNoExchange();
    });

    it('rejects a repeated state parameter rather than matching on the first copy', async () => {
      const fn = jest.fn();
      const res = createRes();
      // `querystring.parse` turns a repeated key into an array; comparing an array to
      // the stored string must fail closed instead of coercing.
      const req = createReq(
        `${provider.callbackPath}?state=victim-state&state=victim-state&code=${CODE}`,
        { [provider.cookieName]: JSON.stringify({ state: 'victim-state', query: null }) },
      );

      await provider.build()(fn)(req, res);

      expect(fn.mock.calls[0][2].err.message).toBe('Invalid state');
      provider.expectNoExchange();
    });

    it('rejects a cookie that deserialises to null', async () => {
      const fn = jest.fn();
      const res = createRes();
      const req = createReq(`${provider.callbackPath}?state=null&code=${CODE}`, {
        [provider.cookieName]: 'null',
      });

      await provider.build()(fn)(req, res);

      expect(fn.mock.calls[0][2].err.message).toBe('Invalid state');
      provider.expectNoExchange();
    });

    it('rejects a cookie that is not valid JSON without leaking provider internals', async () => {
      const fn = jest.fn();
      const res = createRes();
      const req = createReq(`${provider.callbackPath}?state=anything&code=${CODE}`, {
        [provider.cookieName]: 'not-json',
      });

      await provider.build()(fn)(req, res);

      // JSON.parse throws, so this lands in the catch and is sanitised rather than
      // surfacing as the raw SyntaxError.
      expect(fn.mock.calls[0][2].err.name).toBe('OauthError');
      expect(fn.mock.calls[0][2].err.message).toContain(`OAuth failed for ${provider.name}`);
      provider.expectNoExchange();
    });

    // `microCookie` is applied to the *options* object, not to the request
    // (`microCookie(microAuthX)` is invoked as `handler(options)`), so `req.cookies` is
    // never populated by it — the code only works because Next.js parses cookies for
    // API routes. Whether or not that middleware is ever fixed, a request whose raw
    // Cookie header carries a state that does *not* match must be rejected, so this
    // asserts fail-closed rather than pinning the current TypeError path.
    it('fails closed when req.cookies was never populated', async () => {
      const fn = jest.fn();
      const res = createRes();
      const req = createReq(
        `${provider.callbackPath}?state=attacker-state&code=${CODE}`,
        undefined,
        {
          cookie: `${provider.cookieName}=${encodeURIComponent(
            JSON.stringify({ state: 'victim-state' }),
          )}`,
        },
      );

      await provider.build()(fn)(req, res);

      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn.mock.calls[0][2].err).toBeInstanceOf(Error);
      expect(fn.mock.calls[0][2].result).toBeUndefined();
      // Whatever the error is, it must not be a raw provider/runtime object that a
      // logger could serialise; the wrapper sanitises everything on this path.
      expect(fn.mock.calls[0][2].err.name).toBe('OauthError');
      provider.expectNoExchange();
    });

    it('rejects a cookie that parses to a bare string equal to the state', async () => {
      const fn = jest.fn();
      const res = createRes();
      // `JSON.parse('"victim-state"')` is a truthy string, not an object. A check
      // loosened to `storedState != state` or `String(storedState) !== state` would
      // wave this through; reading `.state` off it must not.
      const req = createReq(`${provider.callbackPath}?state=victim-state&code=${CODE}`, {
        [provider.cookieName]: '"victim-state"',
      });

      await provider.build()(fn)(req, res);

      expect(fn.mock.calls[0][2].err.message).toBe('Invalid state');
      expect(fn.mock.calls[0][2].result).toBeUndefined();
      provider.expectNoExchange();
    });
  });

  it('passes unrelated paths straight through with no extra arguments', async () => {
    const fn = jest.fn();
    const res = createRes();
    const req = createReq(`${provider.path}/unrelated?state=x`, {});

    await provider.build()(fn)(req, res);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn.mock.calls[0]).toHaveLength(2);
    expect(setCookieHeaders(res)).toHaveLength(0);
    provider.expectNoExchange();
  });
});

describe('microAuth google callback', () => {
  const build = () => googleCase.build();
  const validCookies = { [googleCase.cookieName]: JSON.stringify({ state: 's-1', query: 'redirect=%2Fcourse' }) };

  it('exchanges the code and hands the profile plus the stored query to the handler', async () => {
    const tokens = { access_token: 'google-access-token', id_token: 'google-id-token' };
    const info = { id: '42', email: 'user@example.com', verified_email: true };
    (OAuth2Client.prototype.getToken as jest.Mock).mockResolvedValue({ tokens });
    (OAuth2Client.prototype.request as jest.Mock).mockResolvedValue({ data: info });
    const fn = jest.fn();
    const res = createRes();

    await build()(fn)(
      createReq(`${googleCase.callbackPath}?state=s-1&code=auth-code`, validCookies),
      res,
    );

    expect(OAuth2Client.prototype.getToken).toHaveBeenCalledWith('auth-code');
    expect(OAuth2Client.prototype.request).toHaveBeenCalledWith({
      url: 'https://www.googleapis.com/oauth2/v2/userinfo',
    });
    expect(fn.mock.calls[0][2]).toEqual({
      result: { provider: 'google', info, tokens },
      storedState: { state: 's-1', query: 'redirect=%2Fcourse' },
    });
    // The payload handed to the route handler is logged and, on the error paths,
    // reported to Sentry; nothing derived from the exchange may carry the secret.
    expect(JSON.stringify(fn.mock.calls[0][2])).not.toContain(CLIENT_SECRET);
    expect(isExpired(findCookie(res, googleCase.cookieName))).toBe(true);
  });

  it('sanitises a failed token exchange and clears the state cookie', async () => {
    const err: any = new Error('invalid_grant');
    err.code = '400';
    err.config = { data: `client_secret=${CLIENT_SECRET}&code=auth-code` };
    (OAuth2Client.prototype.getToken as jest.Mock).mockRejectedValue(err);
    const fn = jest.fn();
    const res = createRes();

    await build()(fn)(
      createReq(`${googleCase.callbackPath}?state=s-1&code=auth-code`, validCookies),
      res,
    );

    const handed = fn.mock.calls[0][2].err;

    expect(handed).not.toBe(err);
    expect(handed.name).toBe('OauthError');
    expect(JSON.stringify(handed)).not.toContain(CLIENT_SECRET);
    expect(isExpired(findCookie(res, googleCase.cookieName))).toBe(true);
  });
});

describe('microAuth facebook callback', () => {
  const validCookies = { [facebookCase.cookieName]: JSON.stringify({ state: 's-1', query: null }) };

  it('exchanges the code and then requests the profile with the returned token', async () => {
    fetchJson.mockReset();
    fetchJson.mockResolvedValueOnce({ access_token: 'fb-access-token' }).mockResolvedValueOnce({
      id: '42',
      email: 'user@example.com',
    });
    const fn = jest.fn();
    const res = createRes();

    await facebookCase.build()(fn)(
      createReq(`${facebookCase.callbackPath}?state=s-1&code=auth-code`, validCookies),
      res,
    );

    expect(fetchJson).toHaveBeenCalledTimes(2);
    expect(fetchJson.mock.calls[0][0].url).toContain('code=auth-code');
    // Documents why sanitizeOauthError exists: the secret rides in the request URL,
    // and a transport error's message can name that URL.
    expect(fetchJson.mock.calls[0][0].url).toContain(`client_secret=${CLIENT_SECRET}`);
    expect(fetchJson.mock.calls[1][0].url).toContain('access_token=fb-access-token');
    expect(fn.mock.calls[0][2]).toEqual({
      result: {
        provider: 'facebook',
        accessToken: 'fb-access-token',
        info: { id: '42', email: 'user@example.com' },
      },
      storedState: { state: 's-1', query: null },
    });
    expect(JSON.stringify(fn.mock.calls[0][2])).not.toContain(CLIENT_SECRET);
    expect(isExpired(findCookie(res, facebookCase.cookieName))).toBe(true);
  });

  it('sanitises an HTTP error from the token exchange', async () => {
    fetchJson.mockReset();
    fetchJson.mockRejectedValue(new HttpError(400, { error: { message: 'bad code' } }));
    const fn = jest.fn();
    const res = createRes();

    await facebookCase.build()(fn)(
      createReq(`${facebookCase.callbackPath}?state=s-1&code=auth-code`, validCookies),
      res,
    );

    const handed = fn.mock.calls[0][2].err;

    expect(handed.name).toBe('OauthError');
    expect(JSON.stringify(handed)).not.toContain(CLIENT_SECRET);
    expect(handed.message).toBe(
      'OAuth failed for facebook (status 400): 400 - {"error":{"message":"bad code"}}',
    );
  });

  it('scrubs the app secret from a transport failure, whose message names the URL', async () => {
    // As node-fetch's FetchError words it, where Node has no fetch of its own
    fetchJson.mockReset();
    fetchJson.mockRejectedValue(
      new Error(
        `request to https://graph.facebook.com/v6.0/oauth/access_token?client_id=facebook-app-id&client_secret=${CLIENT_SECRET}&code=auth-code failed, reason: getaddrinfo ENOTFOUND graph.facebook.com`,
      ),
    );
    const fn = jest.fn();

    await facebookCase.build()(fn)(
      createReq(`${facebookCase.callbackPath}?state=s-1&code=auth-code`, validCookies),
      createRes(),
    );

    const handed = fn.mock.calls[0][2].err;

    expect(handed.name).toBe('OauthError');
    expect(handed.message).toContain('client_secret=[redacted]');
    expect(JSON.stringify(handed)).not.toContain(CLIENT_SECRET);
    expect(handed.message).not.toContain(CLIENT_SECRET);
  });

  /**
   * KNOWN GAP. Unlike microAuthGoogle, the facebook callback's catch block does not
   * call `expireCookie`, so a state cookie survives a failed exchange for its full
   * 6 hour lifetime and the same state can be presented again.
   *
   * `it.failing` with the expectation we want, rather than the previous
   * `expect(findCookie(...)).toBeUndefined()` which would have gone red as soon as
   * someone added the missing `expireCookie` call.
   */
  it.failing('expires the state cookie when the token exchange fails', async () => {
    fetchJson.mockReset();
    fetchJson.mockRejectedValue(new Error('boom'));
    const res = createRes();

    await facebookCase.build()(jest.fn())(
      createReq(`${facebookCase.callbackPath}?state=s-1&code=auth-code`, validCookies),
      res,
    );

    expect(isExpired(findCookie(res, facebookCase.cookieName))).toBe(true);
  });
});

describe('microAuth github callback', () => {
  const validCookies = { [githubCase.cookieName]: JSON.stringify({ state: 's-1', query: null }) };

  it('exchanges the code and fetches the user with the bearer token', async () => {
    fetchJson.mockReset();
    fetchJson.mockResolvedValueOnce({ access_token: 'gh-access-token' }).mockResolvedValueOnce({
      id: 42,
      login: 'octocat',
    });
    const fn = jest.fn();
    const res = createRes();

    await githubCase.build()(fn)(
      createReq(`${githubCase.callbackPath}?state=s-1&code=auth-code`, validCookies),
      res,
    );

    expect(fetchJson).toHaveBeenCalledTimes(2);
    expect(fetchJson.mock.calls[0][0]).toMatchObject({
      method: 'POST',
      url: 'https://github.com/login/oauth/access_token',
      body: { client_id: 'github-client-id', client_secret: CLIENT_SECRET, code: 'auth-code' },
    });
    expect(fetchJson.mock.calls[1][0].headers.Authorization).toBe('token gh-access-token');
    expect(fn.mock.calls[0][2]).toEqual({
      result: { provider: 'github', accessToken: 'gh-access-token', info: { id: 42, login: 'octocat' } },
      storedState: { state: 's-1', query: null },
    });
    // github is the one provider that posts the secret in a body rather than a URL;
    // the result handed on must still be secret-free.
    expect(JSON.stringify(fn.mock.calls[0][2])).not.toContain(CLIENT_SECRET);
    expect(isExpired(findCookie(res, githubCase.cookieName))).toBe(true);
  }, 15000);

  it('stops on an error payload returned with a 200 and never calls the user API', async () => {
    fetchJson.mockReset();
    fetchJson.mockResolvedValueOnce({ error: 'bad_verification_code' });
    const fn = jest.fn();
    const res = createRes();

    await githubCase.build()(fn)(
      createReq(`${githubCase.callbackPath}?state=s-1&code=auth-code`, validCookies),
      res,
    );

    // GitHub answers 200 with `{ error }` for a bad code; treating that as success
    // would send `Authorization: token undefined` to the user API.
    expect(fetchJson).toHaveBeenCalledTimes(1);
    expect(fn.mock.calls[0][2]).toEqual({
      err: expect.any(Error),
      provider: 'github',
    });
    expect(fn.mock.calls[0][2].err.message).toBe(
      'OAuth failed for github: bad_verification_code',
    );
  }, 15000);

  /**
   * KNOWN GAP, same shape as the facebook one: the `response.error` branch returns
   * without expiring the state cookie, so the failed state stays replayable until it
   * ages out. Asserted the right way round under `it.failing`.
   */
  it.failing('expires the state cookie after a 200-with-error token response', async () => {
    fetchJson.mockReset();
    fetchJson.mockResolvedValueOnce({ error: 'bad_verification_code' });
    const res = createRes();

    await githubCase.build()(jest.fn())(
      createReq(`${githubCase.callbackPath}?state=s-1&code=auth-code`, validCookies),
      res,
    );

    expect(isExpired(findCookie(res, githubCase.cookieName))).toBe(true);
  }, 15000);
});
