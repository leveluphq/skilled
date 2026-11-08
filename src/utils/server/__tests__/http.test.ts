/**
 * Tests for src/utils/server/http.ts — HTTP + cookie helpers.
 *
 * `getSafeRedirectPath` is the open-redirect fix, so it gets the adversarial
 * cases: protocol-relative values, backslash variants, explicit schemes, and
 * CR/LF header splitting. Those enumerated cases are backed by a generated
 * corpus checked against the WHATWG URL parser, which is the same resolution
 * algorithm the browser applies to a `Location` value.
 *
 * Cookie helpers run against a REAL `http.ServerResponse` (not a hand-rolled
 * header bag), so the assertions cover Node's own header storage and its
 * invalid-character validation as well as the `cookie` serialization.
 */
import { IncomingMessage, ServerResponse } from 'http';
import { Socket } from 'net';
import { NextApiRequest } from 'next';
import * as cookie from 'cookie';

const ORIGINAL_ROOT_DOMAIN = process.env.ROOT_DOMAIN;
process.env.ROOT_DOMAIN = 'skilled.dev';

import {
  createErrorObject,
  expireCookie,
  getAffiliateCookie,
  getAffiliateReferralIdCookie,
  getDestinationPagePath,
  getIpAddress,
  getReferralUrl,
  getSafeRedirectPath,
  setAffiliateCookie,
  setAffiliateReferralIdCookie,
  setCookie,
  setOauthStateCookie,
} from 'utils/server/http';

/**
 * A real `ServerResponse`. Node stores headers case-insensitively and rejects
 * values containing raw CR/LF (ERR_INVALID_CHAR), so anything these tests
 * accept is something the process would actually put on the wire.
 */
const createRes = () => new ServerResponse(new IncomingMessage(new Socket()));

const getSetCookieHeader = (res: ServerResponse): string[] => {
  const header = res.getHeader('Set-Cookie');

  if (header === undefined) {
    return [];
  }

  return Array.isArray(header) ? header.map(String) : [String(header)];
};

const asReq = (headers: Record<string, unknown>, extra: Record<string, unknown> = {}) =>
  ({ headers, ...extra } as unknown as IncomingMessage);

const asApiReq = (cookies: Record<string, string>) => ({ cookies } as unknown as NextApiRequest);

afterAll(() => {
  if (ORIGINAL_ROOT_DOMAIN === undefined) {
    delete process.env.ROOT_DOMAIN;
  } else {
    process.env.ROOT_DOMAIN = ORIGINAL_ROOT_DOMAIN;
  }
});

beforeEach(() => {
  process.env.ROOT_DOMAIN = 'skilled.dev';
});

describe('getSafeRedirectPath', () => {
  describe('rejects off-origin destinations', () => {
    // Every one of these begins with `/` (or normalizes to one) and would sail
    // through a naive `startsWith('/')` check straight into `Location:`.
    const protocolRelative = [
      '//evil.com',
      '///evil.com',
      '//evil.com/path?a=b',
      '/\\evil.com', // /\evil.com
      '/\\/evil.com', // /\/evil.com
      '\\\\evil.com', // \\evil.com
      '\\/evil.com', // \/evil.com
      '/\\\\evil.com', // /\\evil.com
    ];

    it.each(protocolRelative)('rejects protocol-relative %j', (input) => {
      expect(getSafeRedirectPath(input)).toBe('/');
    });

    const withScheme = [
      'https://evil.com',
      'http://evil.com',
      'HTTPS://EVIL.COM',
      'HtTpS://evil.com',
      'https:/evil.com', // single slash still names a scheme
      'javascript:alert(document.domain)',
      'JAVASCRIPT:alert(1)',
      'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==',
      'vbscript:msgbox(1)',
      'file:///etc/passwd',
      'mailto:someone@evil.com',
    ];

    it.each(withScheme)('rejects %j because it carries a scheme', (input) => {
      expect(getSafeRedirectPath(input)).toBe('/');
    });

    it('rejects a scheme obfuscated with stripped control characters', () => {
      // The tab/NUL are removed first, so `java<TAB>script:` must not survive
      // as a "relative" path.
      expect(getSafeRedirectPath('java\tscript:alert(1)')).toBe('/');
      expect(getSafeRedirectPath('java\0script:alert(1)')).toBe('/');
      expect(getSafeRedirectPath('http\r\ns://evil.com')).toBe('/');
    });

    it('rejects a protocol-relative value smuggled through CR/LF or TAB', () => {
      // Stripping happens before the `//` check; if the order ever flipped,
      // `/<CR><LF>/evil.com` would be emitted verbatim, and the URL parser
      // (which also drops CR/LF/TAB) would read it back as `//evil.com`.
      expect(getSafeRedirectPath('/\r\n/evil.com')).toBe('/');
      expect(getSafeRedirectPath('/\n/evil.com')).toBe('/');
      expect(getSafeRedirectPath('/\t/evil.com')).toBe('/');
      expect(getSafeRedirectPath('/\0/evil.com')).toBe('/');
    });
  });

  /**
   * The enumerated cases above only cover payloads someone thought of. This
   * generates every prefix/separator/target combination and checks the one
   * property that actually matters: resolving the result as a `Location` value
   * must keep the user on this origin. `new URL(value, base)` is the same
   * algorithm a browser uses, including its own CR/LF/TAB stripping — so a
   * regression that leaves a smuggled `//evil.com` intact is caught here even
   * if no hand-written case names it.
   */
  describe('origin invariant (generated corpus)', () => {
    const BASE = 'https://skilled.dev';
    const prefixes = ['', ' ', '\t', '\r\n', '\0', '/', '.'];
    const separators = ['/', '\\', '//', '\\\\', '/\\', '\\/', '///', '/\r\n/', '/\0/'];
    const targets = [
      'evil.com',
      'evil.com/path?a=b',
      'javascript:alert(1)',
      'https://evil.com',
      'user@evil.com',
    ];

    const corpus: string[] = [];
    prefixes.forEach((prefix) =>
      separators.forEach((separator) =>
        targets.forEach((target) => corpus.push(`${prefix}${separator}${target}`)),
      ),
    );

    it('generates a non-trivial corpus', () => {
      expect(corpus).toHaveLength(prefixes.length * separators.length * targets.length);
      expect(corpus.length).toBeGreaterThan(300);
    });

    it('never resolves to another origin, and never emits a header-splitting character', () => {
      const escapes = corpus.filter((input) => {
        const result = getSafeRedirectPath(input);

        return (
          !result.startsWith('/') ||
          result.startsWith('//') ||
          /[\r\n\t\0]/.test(result) ||
          new URL(result, BASE).origin !== BASE
        );
      });

      expect(escapes).toEqual([]);
    });

    it('keeps a legitimate path pointing at this origin', () => {
      // Guards the corpus above from passing because everything collapses to "/".
      expect(new URL(getSafeRedirectPath('/course/module-1?a=b#c'), BASE).href).toBe(
        'https://skilled.dev/course/module-1?a=b#c',
      );
      expect(new URL(getSafeRedirectPath('course'), BASE).pathname).toBe('/course');
    });
  });

  describe('neutralizes header injection', () => {
    it('strips CR/LF so a redirect cannot split the response', () => {
      const result = getSafeRedirectPath('/evil\r\nLocation: https://x');

      expect(result).toBe('/evilLocation: https://x');
      expect(result).not.toMatch(/[\r\n]/);
    });

    it('strips CR, LF, tab and NUL wherever they appear', () => {
      const result = getSafeRedirectPath('/co\ru\nr\tse\0');

      expect(result).toBe('/course');
      expect(result).not.toMatch(/[\r\n\t\0]/);
    });

    it('produces a value Node will accept as a Location header', () => {
      // A stray CR/LF/NUL would make setHeader throw ERR_INVALID_CHAR at
      // runtime, i.e. a 500 on the login redirect instead of a redirect.
      const res = createRes();

      [
        '/a\r\nSet-Cookie: session=hijacked',
        'a\r\nLocation: //evil.com',
        '/\r\n\r\n<script>alert(1)</script>',
        '/co\0urse',
      ].forEach((attack) => {
        const location = getSafeRedirectPath(attack);

        expect(location).not.toMatch(/[\r\n]/);
        expect(() => res.setHeader('Location', location)).not.toThrow();
        expect(res.getHeader('Location')).toBe(location);
      });
    });
  });

  describe('falls back to "/" for missing input', () => {
    it.each([
      ['undefined', undefined],
      ['null', null],
      ['empty string', ''],
      ['only CR/LF', '\r\n'],
      ['only NUL', '\0'],
      ['empty array', []],
      ['array of empty strings', ['', '']],
    ])('returns "/" for %s', (_label, input) => {
      expect(getSafeRedirectPath(input as string | string[] | null | undefined)).toBe('/');
    });
  });

  describe('preserves same-origin destinations', () => {
    it('keeps an absolute path untouched', () => {
      expect(getSafeRedirectPath('/course')).toBe('/course');
    });

    it('promotes a bare path to an absolute path', () => {
      expect(getSafeRedirectPath('course')).toBe('/course');
    });

    it('preserves the query string and fragment', () => {
      expect(getSafeRedirectPath('/course/module-1?lesson=2&from=email#intro')).toBe(
        '/course/module-1?lesson=2&from=email#intro',
      );
      expect(getSafeRedirectPath('/?next=%2Fdashboard')).toBe('/?next=%2Fdashboard');
      expect(getSafeRedirectPath('/course#top')).toBe('/course#top');
    });

    it('keeps a colon that appears after the first path segment', () => {
      // The scheme check is anchored, so an interior colon is not a scheme and
      // must not trigger the fallback.
      expect(getSafeRedirectPath('/course/step:1?next=https://skilled.dev')).toBe(
        '/course/step:1?next=https://skilled.dev',
      );
    });

    it('joins string arrays (repeated query params / catch-all routes) with "/"', () => {
      expect(getSafeRedirectPath(['/course', 'arrays'])).toBe('/course/arrays');
      expect(getSafeRedirectPath(['course', 'arrays'])).toBe('/course/arrays');
      expect(getSafeRedirectPath(['/course'])).toBe('/course');
    });

    it('rejects an array whose join produces a protocol-relative value', () => {
      // A duplicated `?next=` query param arrives as an array, so the join is
      // attacker-controlled: ['', '', 'evil.com'] joins to `//evil.com`.
      expect(getSafeRedirectPath(['', '', 'evil.com'])).toBe('/');
      expect(getSafeRedirectPath(['//evil.com', 'path'])).toBe('/');
      expect(getSafeRedirectPath(['https:', '', 'evil.com'])).toBe('/');
    });

    it('normalizes interior backslashes to forward slashes', () => {
      // Browsers treat `\` as a path separator, so it is folded rather than kept.
      expect(getSafeRedirectPath('/course\\lesson')).toBe('/course/lesson');
    });

    it('leaves a leading-space value anchored to this origin', () => {
      // A leading space is not stripped, but prefixing `/` keeps the browser
      // from reading the trimmed header value as `//evil.com`.
      const result = getSafeRedirectPath(' //evil.com');

      expect(result).toBe('/ //evil.com');
      expect(new URL(result, 'https://skilled.dev').origin).toBe('https://skilled.dev');
    });
  });
});

describe('getDestinationPagePath', () => {
  it('applies the same same-origin guard as getSafeRedirectPath', () => {
    expect(getDestinationPagePath('//evil.com')).toBe('/');
    expect(getDestinationPagePath('https://evil.com')).toBe('/');
    expect(getDestinationPagePath('/\\evil.com')).toBe('/');
    expect(getDestinationPagePath('pricing')).toBe('/pricing');
    expect(getDestinationPagePath(['/course', 'arrays'])).toBe('/course/arrays');
  });

  it('defaults to "/" when nothing is supplied', () => {
    expect(getDestinationPagePath()).toBe('/');
    expect(getDestinationPagePath(undefined)).toBe('/');
    expect(getDestinationPagePath('')).toBe('/');
  });
});

describe('setCookie', () => {
  it('serializes name, value, domain and path into a Set-Cookie header', () => {
    const res = createRes();

    setCookie({ res, name: 'skilled-test', value: 'abc123' });

    expect(getSetCookieHeader(res)).toEqual(['skilled-test=abc123; Domain=skilled.dev; Path=/']);
  });

  it('reads ROOT_DOMAIN at call time, not at import time', () => {
    process.env.ROOT_DOMAIN = 'staging.skilled.dev';
    const res = createRes();

    setCookie({ res, name: 'a', value: 'b' });

    expect(getSetCookieHeader(res)).toEqual(['a=b; Domain=staging.skilled.dev; Path=/']);
  });

  it('omits Domain when ROOT_DOMAIN is unset (host-only cookie)', () => {
    delete process.env.ROOT_DOMAIN;
    const res = createRes();

    setCookie({ res, name: 'a', value: 'b' });

    expect(getSetCookieHeader(res)).toEqual(['a=b; Path=/']);
  });

  it('lets an explicit domain override ROOT_DOMAIN', () => {
    const res = createRes();

    setCookie({ res, name: 'a', value: 'b', domain: 'other.example' });

    expect(getSetCookieHeader(res)).toEqual(['a=b; Domain=other.example; Path=/']);
  });

  it('treats an explicit empty domain as host-only rather than falling back to ROOT_DOMAIN', () => {
    // jwt.ts passes `domain: process.env.ROOT_DOMAIN || ''`, so the empty
    // string is a real caller value: the default parameter must not rescue it,
    // otherwise an auth cookie meant for one host would widen to the apex.
    const res = createRes();

    setCookie({ res, name: 'skilled-token', value: 'jwt', domain: '' });

    expect(getSetCookieHeader(res)).toEqual(['skilled-token=jwt; Path=/']);
  });

  it('passes maxAge, path, secure, httpOnly and sameSite through', () => {
    const res = createRes();

    setCookie({
      res,
      name: 'auth',
      value: 'token',
      maxAge: 3600,
      path: '/app',
      secure: true,
      httpOnly: true,
      sameSite: 'lax',
    });

    expect(getSetCookieHeader(res)).toEqual([
      'auth=token; Max-Age=3600; Domain=skilled.dev; Path=/app; HttpOnly; Secure; SameSite=Lax',
    ]);
  });

  it('percent-encodes the value so it cannot inject cookie attributes', () => {
    const res = createRes();

    setCookie({ res, name: 'affiliate', value: 'x; Domain=evil.com; HttpOnly' });
    const header = getSetCookieHeader(res)[0];

    expect(header).toBe(
      'affiliate=x%3B%20Domain%3Devil.com%3B%20HttpOnly; Domain=skilled.dev; Path=/',
    );
    expect(header).not.toContain('Domain=evil.com');
  });

  it('percent-encodes CR/LF in the value so it cannot split the response', () => {
    // The `res` here is a real ServerResponse: if the CR/LF survived
    // serialization, setHeader would throw ERR_INVALID_CHAR instead of
    // reaching the assertions.
    const res = createRes();

    setCookie({ res, name: 'state', value: 'a\r\nSet-Cookie: admin=1' });
    const header = getSetCookieHeader(res)[0];

    expect(header).not.toMatch(/[\r\n]/);
    expect(header).toContain('%0D%0A');
  });

  it('throws rather than emitting a header for an invalid cookie name', () => {
    const res = createRes();

    expect(() => setCookie({ res, name: 'bad\r\nX-Injected: 1', value: 'v' })).toThrow(TypeError);
    expect(getSetCookieHeader(res)).toEqual([]);
  });

  it('round-trips a JSON value through cookie.parse', () => {
    const res = createRes();
    const payload = JSON.stringify({ state: 'abc def', next: '/course?a=b' });

    setCookie({ res, name: 'oauth', value: payload });

    expect(cookie.parse(getSetCookieHeader(res)[0]).oauth).toBe(payload);
  });

  it('appends to an existing Set-Cookie array instead of overwriting it', () => {
    const res = createRes();

    setCookie({ res, name: 'first', value: '1' });
    setCookie({ res, name: 'second', value: '2' });
    setCookie({ res, name: 'third', value: '3' });

    const headers = getSetCookieHeader(res);

    expect(headers).toHaveLength(3);
    expect(headers.map((h) => h.split(';')[0]).sort()).toEqual(['first=1', 'second=2', 'third=3']);
  });

  it('preserves a Set-Cookie header that was already set as a plain string', () => {
    const res = createRes();
    res.setHeader('Set-Cookie', 'preexisting=yes; Path=/');

    setCookie({ res, name: 'new', value: 'v' });

    const headers = getSetCookieHeader(res);
    expect(headers).toHaveLength(2);
    expect(headers).toContain('preexisting=yes; Path=/');
  });

  // BUG (characterization): each new cookie is PREPENDED to the existing
  // Set-Cookie array, so the response emits them newest-first. A user agent
  // applies Set-Cookie headers in order, so for a repeated name the LAST header
  // wins — which here is the OLDEST write. Exercised through the real helper
  // pair that a handler would use: set a cookie, then expire it in the same
  // response, and the deletion is overridden by the earlier value.
  // If setCookie is ever fixed to append, this expectation must be flipped.
  it('emits a set-then-expire pair newest-first, so the deletion loses', () => {
    const res = createRes();

    setAffiliateCookie(res, 'affiliate-123');
    expireCookie(res, 'skilled-friend');

    const headers = getSetCookieHeader(res);

    expect(headers).toHaveLength(2);
    // The deletion was written second but is emitted first...
    expect(headers[0]).toContain('Max-Age=-1');
    // ...so the surviving (last) header for the name is the original value.
    expect(headers[headers.length - 1]).toContain('skilled-friend=affiliate-123');
  });
});

describe('affiliate cookies', () => {
  it('writes the friend cookie with a four week Max-Age', () => {
    const res = createRes();

    setAffiliateCookie(res, 'affiliate-123');

    expect(getSetCookieHeader(res)).toEqual([
      'skilled-friend=affiliate-123; Max-Age=2419200; Domain=skilled.dev; Path=/',
    ]);
  });

  it('writes the referral id cookie with a four week Max-Age', () => {
    const res = createRes();

    setAffiliateReferralIdCookie(res, 'ref-abc');

    expect(getSetCookieHeader(res)).toEqual([
      'skilled-ref-id=ref-abc; Max-Age=2419200; Domain=skilled.dev; Path=/',
    ]);
  });

  it('reads back exactly what the setters wrote (setter/getter name coupling)', () => {
    const res = createRes();

    setAffiliateCookie(res, 'affiliate-123');
    setAffiliateReferralIdCookie(res, 'ref-abc');

    // Simulate the browser echoing the cookies back on the next request.
    const jar = getSetCookieHeader(res).reduce<Record<string, string>>(
      (acc, header) => ({ ...acc, ...cookie.parse(header.split(';')[0]) }),
      {},
    );
    const req = asApiReq(jar);

    expect(getAffiliateCookie(req)).toBe('affiliate-123');
    expect(getAffiliateReferralIdCookie(req)).toBe('ref-abc');
  });

  it('survives an affiliate id that needs encoding', () => {
    const res = createRes();

    setAffiliateCookie(res, 'affiliate id/with=chars');

    const header = getSetCookieHeader(res)[0];
    const req = asApiReq(cookie.parse(header.split(';')[0]) as Record<string, string>);

    expect(header).toContain('Max-Age=2419200');
    expect(getAffiliateCookie(req)).toBe('affiliate id/with=chars');
  });

  it('returns undefined when the cookie is absent', () => {
    const req = asApiReq({ 'some-other-cookie': 'x' });

    expect(getAffiliateCookie(req)).toBeUndefined();
    expect(getAffiliateReferralIdCookie(req)).toBeUndefined();
  });

  it('keeps the two affiliate cookies distinct', () => {
    const req = asApiReq({ 'skilled-friend': 'friend-value', 'skilled-ref-id': 'ref-value' });

    expect(getAffiliateCookie(req)).toBe('friend-value');
    expect(getAffiliateReferralIdCookie(req)).toBe('ref-value');
  });
});

describe('setOauthStateCookie', () => {
  // NOTE: the emitted header carries no HttpOnly, Secure or SameSite, because
  // setCookie applies no defaults and this caller passes none. The exact-header
  // assertion below pins that; hardening the cookie means updating this string.
  it('writes the caller-supplied name with a six hour Max-Age', () => {
    const res = createRes();

    setOauthStateCookie(res, 'skilled-oauth-google', 'state-value');

    expect(getSetCookieHeader(res)).toEqual([
      'skilled-oauth-google=state-value; Max-Age=21600; Domain=skilled.dev; Path=/',
    ]);
  });

  it('survives a JSON state payload with a redirect target', () => {
    const res = createRes();
    const payload = JSON.stringify({ state: 'nonce', query: { next: '/course?a=b' } });

    setOauthStateCookie(res, 'skilled-oauth-github', payload);

    const header = getSetCookieHeader(res)[0];
    expect(header).not.toMatch(/[\r\n]/);
    expect(cookie.parse(header.split(';')[0])['skilled-oauth-github']).toBe(payload);
  });

  it('round-trips the state through the same parse the callback uses', () => {
    // microAuth* reads req.cookies[name] and JSON.parses it, then compares
    // storedState.state to the `state` query param, so the value must come
    // back byte-identical.
    const res = createRes();
    const state = 'a b+c/d=';
    setOauthStateCookie(res, 'skilled-oauth-google', JSON.stringify({ state, query: 'next=/x' }));

    const jar = cookie.parse(getSetCookieHeader(res)[0].split(';')[0]);

    expect(JSON.parse(jar['skilled-oauth-google']).state).toBe(state);
  });
});

describe('expireCookie', () => {
  it('emits a deletion cookie: empty value and Max-Age=-1', () => {
    const res = createRes();

    expireCookie(res, 'skilled-token');

    expect(getSetCookieHeader(res)).toEqual([
      'skilled-token=; Max-Age=-1; Domain=skilled.dev; Path=/',
    ]);
  });

  it('expires several cookies in one response (logout clears token and viewer)', () => {
    const res = createRes();

    expireCookie(res, 'skilled-token');
    expireCookie(res, 'skilled-token-viewer');

    const headers = getSetCookieHeader(res);

    expect(headers).toHaveLength(2);
    expect(headers.map((h) => h.split(';')[0]).sort()).toEqual([
      'skilled-token-viewer=',
      'skilled-token=',
    ]);
    headers.forEach((header) => expect(header).toContain('Max-Age=-1'));
  });
});

describe('getIpAddress', () => {
  it('takes the left-most (client) address from an x-forwarded-for chain', () => {
    const req = asReq({ 'x-forwarded-for': '203.0.113.7, 70.41.3.18, 150.172.238.178' });

    expect(getIpAddress(req)).toBe('203.0.113.7');
  });

  it('skips "unknown" entries in the forwarding chain', () => {
    const req = asReq({ 'x-forwarded-for': 'unknown, 203.0.113.9, 70.41.3.18' });

    expect(getIpAddress(req)).toBe('203.0.113.9');
  });

  it('prefers the forwarded header over the socket address (app runs behind a proxy)', () => {
    const req = asReq(
      { 'x-forwarded-for': '203.0.113.7' },
      { socket: { remoteAddress: '10.0.0.1' } },
    );

    expect(getIpAddress(req)).toBe('203.0.113.7');
  });

  it('falls back to the socket address when no proxy headers exist', () => {
    const req = asReq({}, { socket: { remoteAddress: '198.51.100.5' } });

    expect(getIpAddress(req)).toBe('198.51.100.5');
  });

  it('returns an empty string (never null) when the address is unknown', () => {
    // Callers persist this value, so the empty-string coercion matters.
    expect(getIpAddress(asReq({}))).toBe('');
    expect(getIpAddress(asReq({ 'x-forwarded-for': 'not-an-ip' }))).toBe('');
    expect(getIpAddress(asReq({}, { socket: { remoteAddress: undefined } }))).toBe('');
  });
});

describe('getReferralUrl', () => {
  it('returns the referer header when present', () => {
    expect(getReferralUrl(asReq({ referer: 'https://twitter.com/skilled' }))).toBe(
      'https://twitter.com/skilled',
    );
  });

  it('returns an empty string when the referer is missing', () => {
    expect(getReferralUrl(asReq({}))).toBe('');
    expect(getReferralUrl(asReq({ referer: '' }))).toBe('');
  });
});

describe('createErrorObject', () => {
  it('passes the same object reference through untouched', () => {
    const input = { statusCode: 401, message: 'Unauthorized' };

    expect(createErrorObject(input)).toBe(input);
  });
});
