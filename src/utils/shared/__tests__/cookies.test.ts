/**
 * Tests for `filterClientReadableCookies`.
 *
 * This helper is the fix for a session-JWT leak: `withApollo`'s `getInitialProps`
 * used to forward the whole `req.headers.cookie` into page props, which Next
 * serializes into `__NEXT_DATA__` where any script on the page can read it. The
 * highest-value assertions here are the negative ones — the httpOnly session JWT
 * must never appear in the output.
 */

// This file defers its imports with require() so env vars can be set first,
// which leaves it without a top-level import/export. Mark it as a module so it
// satisfies the project's isolatedModules setting.
export {};

const JWT_TOKEN_NAME = 'skilledToken';
const VIEWER_COOKIE_NAME = `${JWT_TOKEN_NAME}-viewer`;

const ORIGINAL_JWT_TOKEN_NAME = process.env.JWT_TOKEN_NAME;

// Both modules read JWT_TOKEN_NAME through `process.env` at call time, but set it
// before requiring anyway so the test does not depend on that staying true.
process.env.JWT_TOKEN_NAME = JWT_TOKEN_NAME;

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { filterClientReadableCookies } = require('utils/shared/cookies') as typeof import('utils/shared/cookies');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { getViewerFromCookie } = require('utils/client/auth') as typeof import('utils/client/auth');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cookie = require('cookie') as typeof import('cookie');

const SESSION_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsInRva2VuSWQiOiJhYmMifQ.s3cr3t-s1gnatur3';

const futureExp = () => Math.floor(Date.now() / 1000) + 60 * 60;

const viewerValue = (overrides: Record<string, unknown> = {}) =>
  JSON.stringify({
    id: 'user-123',
    role: 'user',
    name: 'Ada',
    image: null,
    exp: futureExp(),
    ...overrides,
  });

afterAll(() => {
  if (ORIGINAL_JWT_TOKEN_NAME === undefined) {
    delete process.env.JWT_TOKEN_NAME;
  } else {
    process.env.JWT_TOKEN_NAME = ORIGINAL_JWT_TOKEN_NAME;
  }
});

describe('filterClientReadableCookies', () => {
  it('drops the session JWT and every unrelated cookie, keeping only viewer + videoWidth', () => {
    const header = [
      `${JWT_TOKEN_NAME}=${SESSION_JWT}`,
      `${VIEWER_COOKIE_NAME}=${encodeURIComponent(viewerValue())}`,
      'videoWidth=62',
      '_ga=GA1.2.1234567890.1600000000',
      'stripe_checkout_session=cs_test_a1b2c3',
      'affiliateRef=someone',
    ].join('; ');

    const filtered = filterClientReadableCookies(header);
    const parsed = cookie.parse(filtered);

    // The regression that would reintroduce the __NEXT_DATA__ leak.
    expect(filtered).not.toContain(SESSION_JWT);
    expect(filtered).not.toContain('s3cr3t-s1gnatur3');
    expect(parsed[JWT_TOKEN_NAME]).toBeUndefined();

    expect(Object.keys(parsed).sort()).toEqual([VIEWER_COOKIE_NAME, 'videoWidth'].sort());
    expect(parsed.videoWidth).toBe('62');
    expect(JSON.parse(parsed[VIEWER_COOKIE_NAME]).id).toBe('user-123');
  });

  it('matches cookie names exactly — no prefix/substring passthrough', () => {
    // `skilledToken` is the httpOnly session cookie; only `skilledToken-viewer`
    // may pass. A look-alike cookie must not smuggle a value through either.
    const header = [
      `${JWT_TOKEN_NAME}=${SESSION_JWT}`,
      `${JWT_TOKEN_NAME}-viewerX=nope`,
      `x${VIEWER_COOKIE_NAME}=nope`,
      'videoWidthTwo=nope',
      'myvideoWidth=nope',
    ].join('; ');

    expect(filterClientReadableCookies(header)).toBe('');
  });

  it.each([
    ['empty string', ''],
    ['undefined (default parameter)', undefined],
    ['malformed pairs', '====;;;'],
    ['semicolons only', ';;;'],
    ['no allowed cookies present', '_ga=GA1.2.3; intercom-session=abc; theme=dark'],
    ['only the session JWT', `${JWT_TOKEN_NAME}=${SESSION_JWT}`],
  ])('returns an empty string for %s', (_label, input) => {
    expect(filterClientReadableCookies(input as string | undefined)).toBe('');
  });

  it('forwards videoWidth on its own for a logged-out visitor', () => {
    expect(filterClientReadableCookies('videoWidth=45; _ga=GA1.2.3')).toBe('videoWidth=45');
  });

  it('re-encodes values so a hostile cookie value cannot inject extra cookies', () => {
    // A value crafted to break out of its pair if it were concatenated verbatim.
    const hostile = '45; ' + JWT_TOKEN_NAME + '=' + SESSION_JWT;
    const header = `videoWidth=${encodeURIComponent(hostile)}; _ga=GA1.2.3`;

    const filtered = filterClientReadableCookies(header);
    const parsed = cookie.parse(filtered);

    // Separators are escaped, so the payload stays one cookie value rather than
    // becoming a second `skilledToken=` pair in the string handed to the client.
    expect(filtered).not.toContain('; ' + JWT_TOKEN_NAME + '=');
    expect(filtered).toContain('%3B%20');
    expect(Object.keys(parsed)).toEqual(['videoWidth']);
    expect(parsed.videoWidth).toBe(hostile);
  });

  it('keeps a present-but-empty viewer cookie instead of throwing', () => {
    const filtered = filterClientReadableCookies(
      `${JWT_TOKEN_NAME}=${SESSION_JWT}; ${VIEWER_COOKIE_NAME}=; videoWidth=30`,
    );

    expect(cookie.parse(filtered)[VIEWER_COOKIE_NAME]).toBe('');
    expect(cookie.parse(filtered)[JWT_TOKEN_NAME]).toBeUndefined();
    expect(getViewerFromCookie(filtered).id).toBe('');
  });

  it('derives the viewer cookie name from JWT_TOKEN_NAME at call time', () => {
    // A hardcoded `skilledToken-viewer` would silently forward nothing in any
    // environment configured with a different token name.
    process.env.JWT_TOKEN_NAME = 'otherToken';

    try {
      const header = `skilledToken-viewer=stale; otherToken-viewer=fresh; otherToken=${SESSION_JWT}`;

      expect(filterClientReadableCookies(header)).toBe('otherToken-viewer=fresh');
    } finally {
      process.env.JWT_TOKEN_NAME = JWT_TOKEN_NAME;
    }
  });
});

describe('filterClientReadableCookies -> getViewerFromCookie round trip', () => {
  it('preserves a url-encoded viewer cookie so the client still resolves the viewer id', () => {
    const header = [
      `${JWT_TOKEN_NAME}=${SESSION_JWT}`,
      `${VIEWER_COOKIE_NAME}=${encodeURIComponent(viewerValue({ id: 'user-abc' }))}`,
      'videoWidth=45',
    ].join('; ');

    const filtered = filterClientReadableCookies(header);

    expect(getViewerFromCookie(header).id).toBe('user-abc');
    // The filtered header must resolve to exactly the same viewer as the raw one.
    expect(getViewerFromCookie(filtered).id).toBe('user-abc');
    expect(filtered).not.toContain(SESSION_JWT);
    expect(cookie.parse(filtered)[JWT_TOKEN_NAME]).toBeUndefined();
  });

  it('preserves a viewer cookie that was stored without url-encoding', () => {
    const header = `${VIEWER_COOKIE_NAME}=${viewerValue({ id: 'user-raw' })}; videoWidth=45`;

    expect(getViewerFromCookie(filterClientReadableCookies(header)).id).toBe('user-raw');
  });

  it('survives a viewer value containing separators and unicode', () => {
    const value = viewerValue({ id: 'user-;=,' + '%', name: 'Ada; Lovelace = ✓' });
    const header = `${VIEWER_COOKIE_NAME}=${encodeURIComponent(value)}`;

    const filtered = filterClientReadableCookies(header);

    expect(getViewerFromCookie(filtered).id).toBe('user-;=,%');
    expect(cookie.parse(filtered)[VIEWER_COOKIE_NAME]).toBe(value);
  });

  it('still forwards an expired viewer cookie, which the client then rejects', () => {
    const header = `${VIEWER_COOKIE_NAME}=${encodeURIComponent(
      viewerValue({ id: 'user-expired', exp: Math.floor(Date.now() / 1000) - 10 }),
    )}`;

    const filtered = filterClientReadableCookies(header);

    // Expiry is enforced by getViewerFromCookie, not by the filter.
    expect(JSON.parse(cookie.parse(filtered)[VIEWER_COOKIE_NAME]).id).toBe('user-expired');
    expect(getViewerFromCookie(filtered).id).toBe('');
  });

  it('yields an empty viewer once the filter has stripped everything', () => {
    const filtered = filterClientReadableCookies(`${JWT_TOKEN_NAME}=${SESSION_JWT}`);

    expect(filtered).toBe('');
    expect(getViewerFromCookie(filtered)).toEqual({ id: '' });
  });
});
