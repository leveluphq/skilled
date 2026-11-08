/**
 * getAuthCookieName derives the OAuth *state* cookie name from the first character of
 * APP_STAGE. The state cookie is the CSRF defence for the whole OAuth callback, so the
 * name it resolves to is security-relevant: two environments that resolve to the same
 * name share (and can overwrite) each other's state cookie on a shared parent domain.
 */
import * as cookie from 'cookie';
import getAuthCookieName from '../getAuthCookieName';

describe('getAuthCookieName', () => {
  const ORIGINAL_APP_STAGE = process.env.APP_STAGE;

  afterEach(() => {
    if (ORIGINAL_APP_STAGE === undefined) {
      delete process.env.APP_STAGE;
    } else {
      process.env.APP_STAGE = ORIGINAL_APP_STAGE;
    }
  });

  it('prefixes the provider with the first letter of APP_STAGE', () => {
    process.env.APP_STAGE = 'development';

    expect(getAuthCookieName('google')).toBe('d-oauthgoogle');
    expect(getAuthCookieName('github')).toBe('d-oauthgithub');
    expect(getAuthCookieName('facebook')).toBe('d-oauthfacebook');
  });

  it('produces a different cookie per stage so environments do not clobber each other', () => {
    process.env.APP_STAGE = 'production';
    const production = getAuthCookieName('google');

    process.env.APP_STAGE = 'staging';
    const staging = getAuthCookieName('google');

    expect(production).toBe('p-oauthgoogle');
    expect(staging).toBe('s-oauthgoogle');
    expect(production).not.toBe(staging);
  });

  it('reads APP_STAGE on every call rather than caching it at import time', () => {
    process.env.APP_STAGE = 'development';
    expect(getAuthCookieName('google')).toBe('d-oauthgoogle');

    process.env.APP_STAGE = 'test';
    expect(getAuthCookieName('google')).toBe('t-oauthgoogle');
  });

  it('survives a real Set-Cookie serialise/parse round trip', () => {
    // A regex over a known-good constant proves little. `cookie.serialize` throws a
    // TypeError on an invalid name — which would 500 every OAuth redirect — so drive
    // the real library and read the name back out.
    process.env.APP_STAGE = 'development';
    const name = getAuthCookieName('google');
    const header = cookie.serialize(name, JSON.stringify({ state: 'abc' }), {
      domain: 'skilled.dev',
      path: '/',
      maxAge: 21600,
    });

    expect(header.startsWith(`${name}=`)).toBe(true);
    expect(Object.keys(cookie.parse(header.split(';')[0]))).toEqual([name]);
  });

  // APP_STAGE is asserted non-null with `!` but never checked, and microAuthGoogle /
  // microAuthFacebook / microAuthGithub call this at *module scope* — so an unset
  // APP_STAGE takes down every auth route at import time. Failing loudly is the
  // acceptable outcome here; silently producing a name is not (see the two
  // `it.failing` cases below).
  it('throws rather than inventing a name when APP_STAGE is unset', () => {
    delete process.env.APP_STAGE;

    expect(() => getAuthCookieName('google')).toThrow(TypeError);
  });

  /**
   * KNOWN GAP. Only the first character of APP_STAGE is used, so any two stages
   * sharing an initial letter share a cookie name. `production` and `preview`
   * (Vercel's stage name for branch deploys) both resolve to `p-oauthgoogle`; on a
   * shared parent domain a preview deploy's state cookie overwrites production's,
   * breaking sign-in and letting a preview-scoped state be presented to production.
   *
   * Asserted as the behaviour we want under `it.failing`, so using the whole stage
   * name (or an explicit per-stage map) turns this red and the fix is to delete
   * `.failing` — rather than a test that goes red *because* someone fixed it.
   */
  it.failing('gives stages that share a first letter distinct cookie names', () => {
    process.env.APP_STAGE = 'production';
    const production = getAuthCookieName('google');

    process.env.APP_STAGE = 'preview';
    const preview = getAuthCookieName('google');

    expect(preview).not.toBe(production);
  });

  /**
   * KNOWN GAP. An empty APP_STAGE yields the literal name `undefined-oauthgoogle`
   * instead of failing, silently merging every environment onto one cookie. Same
   * `it.failing` treatment: the expectation states the desired behaviour.
   */
  it.failing('does not produce an "undefined" prefix for an empty APP_STAGE', () => {
    process.env.APP_STAGE = '';

    expect(getAuthCookieName('google')).not.toContain('undefined');
  });
});
