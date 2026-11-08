/**
 * Tests for `src/utils/server/jwt.ts` — the session token / auth cookie layer.
 *
 * These use the real `jsonwebtoken` library against a throwaway secret rather
 * than mocking it. Mocking `jwt.verify` would make every "forged token is
 * rejected" assertion meaningless, and rejecting forged tokens is the entire
 * job of this module.
 *
 * Hasura claim keys are written here as literal strings on purpose: Hasura
 * requires those exact names on the wire, so pinning them to the `HasuraClaimKey`
 * enum would let a rename pass silently through both the source and the test.
 *
 * Note on module loading: `jwt.ts` reads JWT_SECRET / JWT_TOKEN_NAME / ROOT_DOMAIN /
 * NODE_ENV at import time and throws when the secret is missing, so the module is
 * pulled in with `require` *after* the environment is prepared instead of via a
 * hoisted `import`.
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import type { Users } from 'types/generated/server';

type JwtModule = typeof import('utils/server/jwt');
type JsonWebToken = typeof import('jsonwebtoken');

const HASURA_CLAIMS = 'https://hasura.io/jwt/claims';
const TOKEN_NAME = 'stoken-jest';
const VIEWER_COOKIE_NAME = `${TOKEN_NAME}-viewer`;
const TEST_DOMAIN = 'skilled.test';
const MONTH_IN_SECONDS = 60 * 60 * 24 * 30;

// `openssl rand -base64 64` shaped: 64 decoded bytes, clean base64 round trip.
const VALID_SECRET = Buffer.from('k'.repeat(64)).toString('base64');
const ATTACKER_SECRET = Buffer.from('z'.repeat(64)).toString('base64');

const ORIGINAL_ENV = { ...process.env };

process.env.JWT_SECRET = VALID_SECRET;
process.env.JWT_TOKEN_NAME = TOKEN_NAME;
process.env.ROOT_DOMAIN = TEST_DOMAIN;

// eslint-disable-next-line @typescript-eslint/no-var-requires
const jsonwebtoken: JsonWebToken = require('jsonwebtoken');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const jwtUtils: JwtModule = require('utils/server/jwt');

const {
  setAuthToken,
  logout,
  getAuthToken,
  isValidToken,
  tokenContainsViewer,
  getValidViewerId,
  cookieOptions,
} = jwtUtils;

/** Minimal ServerResponse stand-in: only the Set-Cookie header plumbing matters. */
const createRes = () => {
  const headers: { [key: string]: string | string[] | number } = {};

  return {
    getHeader: (name: string) => headers[name],
    setHeader: (name: string, value: string | string[] | number) => {
      headers[name] = value;
    },
  } as unknown as NextApiResponse;
};

const getSetCookies = (res: NextApiResponse): string[] => {
  const header = (res as unknown as { getHeader: (n: string) => unknown }).getHeader('Set-Cookie');

  if (!header) {
    return [];
  }

  return Array.isArray(header) ? (header as string[]) : [header as string];
};

const findCookie = (res: NextApiResponse, name: string): string => {
  const match = getSetCookies(res).find((c) => c.split('=')[0] === name);

  if (!match) {
    throw new Error(
      `No Set-Cookie named "${name}". Got: ${JSON.stringify(getSetCookies(res))}`,
    );
  }

  return match;
};

const cookieValue = (serialized: string) =>
  decodeURIComponent(serialized.split(';')[0].split('=').slice(1).join('='));

const cookieAttributes = (serialized: string) =>
  serialized
    .split(';')
    .slice(1)
    .map((part) => part.trim());

const base64url = (value: object) =>
  Buffer.from(JSON.stringify(value)).toString('base64url');

const decodePayload = (token: string) =>
  JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()) as Record<string, any>;

/** Re-encode a token's payload while keeping the original signature. */
const tamperPayload = (token: string, mutate: (payload: Record<string, any>) => void) => {
  const [header, , signature] = token.split('.');
  const payload = decodePayload(token);
  mutate(payload);

  return `${header}.${base64url(payload)}.${signature}`;
};

const makeUser = (overrides: Record<string, unknown> = {}): Users =>
  ({
    id: '0a4f1c66-1111-4c3a-9b1a-000000000001',
    role: 'user',
    name: 'Ada Lovelace',
    image: 'https://cdn.skilled.test/ada.png',
    ...overrides,
  } as unknown as Users);

const issueTokenFor = (user: Users = makeUser()) => {
  const res = createRes();
  setAuthToken(user, res);

  return cookieValue(findCookie(res, TOKEN_NAME));
};

const signWith = (
  payload: Record<string, unknown>,
  secret: string,
  options?: Parameters<JsonWebToken['sign']>[2],
) => jsonwebtoken.sign(payload, secret, options);

const validPayload = (overrides: Record<string, unknown> = {}) => {
  const iat = Math.floor(Date.now() / 1000);

  return {
    tokenId: 'a4b0e4d0-2222-4c3a-9b1a-000000000002',
    sub: 'viewer-1',
    iat,
    exp: iat + MONTH_IN_SECONDS,
    [HASURA_CLAIMS]: {
      'x-hasura-allowed-roles': ['user', 'anonymous'],
      'x-hasura-default-role': 'user',
      'x-hasura-user-id': 'viewer-1',
    },
    ...overrides,
  };
};

afterAll(() => {
  Object.keys(process.env).forEach((key) => {
    if (!(key in ORIGINAL_ENV)) {
      delete process.env[key];
    }
  });
  Object.entries(ORIGINAL_ENV).forEach(([key, value]) => {
    process.env[key] = value as string;
  });
});

describe('setAuthToken', () => {
  it('sets the session cookie HttpOnly + Secure + SameSite=Lax, scoped to ROOT_DOMAIN', () => {
    const res = createRes();
    setAuthToken(makeUser(), res);

    const attributes = cookieAttributes(findCookie(res, TOKEN_NAME));

    // HttpOnly is the control that keeps XSS from reading the session token.
    expect(attributes).toContain('HttpOnly');
    expect(attributes).toContain('Secure');
    expect(attributes).toContain('SameSite=Lax');
    expect(attributes).toContain('Path=/');
    expect(attributes).toContain(`Domain=${TEST_DOMAIN}`);
    expect(attributes).toContain(`Max-Age=${MONTH_IN_SECONDS}`);
  });

  it('sets the viewer cookie readable by JS but with the same lifetime and scope', () => {
    const res = createRes();
    setAuthToken(makeUser(), res);

    const attributes = cookieAttributes(findCookie(res, VIEWER_COOKIE_NAME));

    // The viewer cookie is deliberately readable by client code: it carries no
    // credential, only display data. It must still be Lax + Secure + Max-Age-bound.
    expect(attributes).not.toContain('HttpOnly');
    expect(attributes).toContain('Secure');
    expect(attributes).toContain('SameSite=Lax');
    expect(attributes).toContain('Path=/');
    expect(attributes).toContain(`Domain=${TEST_DOMAIN}`);
    expect(attributes).toContain(`Max-Age=${MONTH_IN_SECONDS}`);
  });

  it('issues a token that verifies under HS256 with the configured secret', () => {
    const token = issueTokenFor();

    const verified = jsonwebtoken.verify(token, VALID_SECRET, {
      algorithms: ['HS256'],
    }) as Record<string, any>;

    expect(verified.sub).toBe('0a4f1c66-1111-4c3a-9b1a-000000000001');
    expect(typeof verified.tokenId).toBe('string');
    expect(verified.tokenId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
    expect(verified.exp - verified.iat).toBe(MONTH_IN_SECONDS);
  });

  it('signs with HS256 and advertises nothing else in the header', () => {
    const header = JSON.parse(Buffer.from(issueTokenFor().split('.')[0], 'base64').toString());

    // `isValidToken` only accepts HS256. An issuer that drifted to another
    // algorithm would lock every user out, and an issuer emitting `alg: none`
    // would hand out unsigned sessions, so pin the header exactly.
    expect(header).toEqual({ alg: 'HS256', typ: 'JWT' });
  });

  it('mints a distinct tokenId and signature for every session', () => {
    const user = makeUser();
    const first = issueTokenFor(user);
    const second = issueTokenFor(user);

    // tokenId is the per-session handle. A constant (or a uuid captured once at
    // module load) still matches the v4 shape assertion above, but would make
    // two sessions of the same user indistinguishable for revocation.
    expect(decodePayload(first).tokenId).not.toBe(decodePayload(second).tokenId);
    expect(first).not.toBe(second);
  });

  it('builds Hasura claims for a standard user without any admin role', () => {
    const claims = decodePayload(issueTokenFor())[HASURA_CLAIMS];

    expect(claims).toEqual({
      'x-hasura-allowed-roles': ['user', 'anonymous'],
      'x-hasura-default-role': 'user',
      'x-hasura-user-id': '0a4f1c66-1111-4c3a-9b1a-000000000001',
    });
  });

  it('escalates to the admin role only when the persisted user.role is "admin"', () => {
    const payload = decodePayload(issueTokenFor(makeUser({ role: 'admin' })));

    expect(payload.admin).toBe(true);
    expect(payload[HASURA_CLAIMS]['x-hasura-default-role']).toBe('admin');
    expect(payload[HASURA_CLAIMS]['x-hasura-allowed-roles']).toEqual([
      'user',
      'anonymous',
      'admin',
    ]);
  });

  it.each(['editor', 'author', 'reviewer', 'anonymous', 'Admin', 'ADMIN', ''])(
    'does not grant admin for role %p',
    (role) => {
      const payload = decodePayload(issueTokenFor(makeUser({ role })));

      expect(payload.admin).toBeUndefined();
      expect(payload[HASURA_CLAIMS]['x-hasura-default-role']).toBe('user');
      expect(payload[HASURA_CLAIMS]['x-hasura-allowed-roles']).toEqual(['user', 'anonymous']);
    },
  );

  it('ignores attacker-controlled claim fields hanging off the user record', () => {
    // Anything extra on the user object (e.g. a poisoned OAuth profile merge)
    // must not reach the signed payload: claims are rebuilt from id + role only.
    const poisoned = makeUser({
      id: 'real-user',
      role: 'user',
      admin: true,
      sub: 'someone-else',
      tokenId: 'attacker-chosen',
      exp: 99999999999,
      iat: 0,
      'x-hasura-default-role': 'admin',
      [HASURA_CLAIMS]: {
        'x-hasura-allowed-roles': ['admin'],
        'x-hasura-default-role': 'admin',
        'x-hasura-user-id': 'victim-user',
      },
    });

    const payload = decodePayload(issueTokenFor(poisoned));

    expect(payload.admin).toBeUndefined();
    expect(payload.sub).toBe('real-user');
    expect(payload.tokenId).not.toBe('attacker-chosen');
    expect(payload.exp - payload.iat).toBe(MONTH_IN_SECONDS);
    expect(payload[HASURA_CLAIMS]).toEqual({
      'x-hasura-allowed-roles': ['user', 'anonymous'],
      'x-hasura-default-role': 'user',
      'x-hasura-user-id': 'real-user',
    });
    expect(Object.keys(payload).sort()).toEqual(
      [HASURA_CLAIMS, 'exp', 'iat', 'sub', 'tokenId'].sort(),
    );
  });

  it('does not leak the admin role from one session into the next', () => {
    // buildHasuraClaims must return a fresh array; a module-level constant would
    // keep the pushed 'admin' role and hand it to the next signed-in user.
    issueTokenFor(makeUser({ id: 'admin-user', role: 'admin' }));
    const payload = decodePayload(issueTokenFor(makeUser({ id: 'plain-user', role: 'user' })));

    expect(payload[HASURA_CLAIMS]['x-hasura-allowed-roles']).toEqual(['user', 'anonymous']);
    expect(payload.admin).toBeUndefined();
  });

  it('writes a viewer cookie whose exp matches the signed token exp', () => {
    const res = createRes();
    setAuthToken(makeUser(), res);

    const token = cookieValue(findCookie(res, TOKEN_NAME));
    const viewer = JSON.parse(cookieValue(findCookie(res, VIEWER_COOKIE_NAME)));

    expect(viewer).toEqual({
      id: '0a4f1c66-1111-4c3a-9b1a-000000000001',
      role: 'user',
      name: 'Ada Lovelace',
      image: 'https://cdn.skilled.test/ada.png',
      exp: decodePayload(token).exp,
    });
  });

  it('normalises missing name/image to null in the viewer cookie', () => {
    const res = createRes();
    setAuthToken(makeUser({ name: undefined, image: null }), res);

    const viewer = JSON.parse(cookieValue(findCookie(res, VIEWER_COOKIE_NAME)));

    expect(viewer.name).toBeNull();
    expect(viewer.image).toBeNull();
  });

  it('never puts the session token inside the JS-readable viewer cookie', () => {
    const res = createRes();
    setAuthToken(makeUser(), res);

    const token = cookieValue(findCookie(res, TOKEN_NAME));
    const rawViewerCookie = findCookie(res, VIEWER_COOKIE_NAME);

    expect(rawViewerCookie).not.toContain(token.split('.')[2]);
    expect(JSON.parse(cookieValue(rawViewerCookie))).not.toHaveProperty('token');
  });

  it('appends to an existing Set-Cookie header instead of dropping it', () => {
    // Auth is frequently set alongside affiliate/oauth cookies in the same handler.
    const res = createRes();
    (res as unknown as { setHeader: (n: string, v: string) => void }).setHeader(
      'Set-Cookie',
      'skilled-friend=abc; Path=/',
    );

    setAuthToken(makeUser(), res);

    const cookies = getSetCookies(res);
    expect(cookies).toHaveLength(3);
    expect(cookies.some((c) => c.startsWith('skilled-friend=abc'))).toBe(true);
  });

  it.each([
    ['undefined', undefined],
    ['null', null],
  ])('writes nothing when the user is %s', (_label, user) => {
    const res = createRes();

    expect(setAuthToken(user as unknown as Users, res)).toBe(user);
    expect(getSetCookies(res)).toEqual([]);
  });

  it('cannot mint a usable session from a user record with no id', () => {
    // A failed lookup that returns a partial row must not yield a token that
    // authenticates as "somebody". The payload still signs, so the fail-closed
    // behaviour has to come from the consumers refusing an empty viewer id.
    const token = issueTokenFor(makeUser({ id: undefined }));

    expect(isValidToken(token)).toBe(true);
    expect(decodePayload(token)[HASURA_CLAIMS]['x-hasura-user-id']).toBeUndefined();
    expect(tokenContainsViewer(token)).toBe(false);
    expect(
      getValidViewerId({ cookies: { [TOKEN_NAME]: token } } as unknown as NextApiRequest),
    ).toBe('');
  });

  it('exports cookieOptions that keep the session cookie locked down', () => {
    expect(cookieOptions).toMatchObject({
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/',
      maxAge: MONTH_IN_SECONDS,
    });
  });
});

describe('logout', () => {
  it('expires both the session and viewer cookies on the same path/domain', () => {
    const res = createRes();
    setAuthToken(makeUser(), res);
    logout(res);

    const expired = getSetCookies(res).slice(0, 2);
    const names = expired.map((c) => c.split('=')[0]).sort();

    expect(names).toEqual([VIEWER_COOKIE_NAME, TOKEN_NAME].sort());
    expired.forEach((serialized) => {
      expect(cookieValue(serialized)).toBe('');
      // Negative Max-Age is the delete instruction; anything >= 0 would keep the
      // cookie alive in the browser.
      expect(cookieAttributes(serialized)).toContain('Max-Age=-1');
      expect(cookieAttributes(serialized)).toContain('Path=/');
      expect(cookieAttributes(serialized)).toContain(`Domain=${TEST_DOMAIN}`);
    });
  });

  it('works on a bare ServerResponse with no cookies previously set', () => {
    const res = createRes();
    logout(res);

    const cookies = getSetCookies(res);

    // Counting headers alone would pass if logout re-issued two *live* cookies,
    // so assert every emitted cookie is actually a deletion instruction.
    expect(cookies.map((c) => c.split('=')[0]).sort()).toEqual(
      [VIEWER_COOKIE_NAME, TOKEN_NAME].sort(),
    );
    cookies.forEach((serialized) => {
      expect(cookieValue(serialized)).toBe('');
      expect(cookieAttributes(serialized)).toContain('Max-Age=-1');
    });
  });
});

describe('getAuthToken', () => {
  it('reads only the configured JWT cookie name', () => {
    expect(
      getAuthToken({
        [TOKEN_NAME]: 'the-token',
        [VIEWER_COOKIE_NAME]: '{"id":"someone"}',
        other: 'nope',
      }),
    ).toBe('the-token');
  });

  it('returns undefined when the cookie jar has no session cookie', () => {
    expect(getAuthToken({ [VIEWER_COOKIE_NAME]: '{"id":"x"}' })).toBeUndefined();
    expect(getAuthToken({})).toBeUndefined();
    expect(getAuthToken()).toBeUndefined();
    expect(getAuthToken(undefined)).toBeUndefined();
  });

  it('throws on a null cookie jar (the default only covers undefined)', () => {
    // Documents current behaviour. Next.js always supplies `req.cookies`, so this
    // is defensive rather than a reachable path.
    expect(() => getAuthToken(null as unknown as undefined)).toThrow(TypeError);
  });
});

describe('isValidToken', () => {
  it('accepts a token this module just issued', () => {
    expect(isValidToken(issueTokenFor())).toBe(true);
  });

  it('rejects a token signed with a different secret', () => {
    expect(isValidToken(signWith(validPayload(), ATTACKER_SECRET))).toBe(false);
  });

  it('rejects an unsigned alg:"none" token', () => {
    const forged = `${base64url({ alg: 'none', typ: 'JWT' })}.${base64url(validPayload())}.`;

    expect(isValidToken(forged)).toBe(false);
  });

  it('rejects an alg:"none" token carrying a signature from a real token', () => {
    const real = issueTokenFor();
    const forged = `${base64url({ alg: 'none', typ: 'JWT' })}.${real.split('.')[1]}.${
      real.split('.')[2]
    }`;

    expect(isValidToken(forged)).toBe(false);
  });

  it('rejects an HS512 token signed with the correct secret (algorithm swap)', () => {
    // Guards the `algorithms: ['HS256']` allow-list: without it jsonwebtoken
    // infers every HMAC variant from the string secret and this would verify.
    const swapped = signWith(validPayload(), VALID_SECRET, { algorithm: 'HS512' });

    expect(jsonwebtoken.verify(swapped, VALID_SECRET)).toBeTruthy();
    expect(isValidToken(swapped)).toBe(false);
  });

  it('rejects an HS384 token signed with the correct secret', () => {
    expect(isValidToken(signWith(validPayload(), VALID_SECRET, { algorithm: 'HS384' }))).toBe(
      false,
    );
  });

  it('rejects a token whose header claims RS256 over an HMAC signature', () => {
    const header = base64url({ alg: 'RS256', typ: 'JWT' });
    const payload = base64url(validPayload());
    const signature = require('crypto')
      .createHmac('sha256', VALID_SECRET)
      .update(`${header}.${payload}`)
      .digest('base64url');

    expect(isValidToken(`${header}.${payload}.${signature}`)).toBe(false);
  });

  it('rejects an expired token', () => {
    const iat = Math.floor(Date.now() / 1000) - MONTH_IN_SECONDS - 60;
    const expired = signWith(validPayload({ iat, exp: iat + 30 }), VALID_SECRET);

    expect(isValidToken(expired)).toBe(false);
  });

  it('accepts a token one second before it expires and rejects it at and after exp', () => {
    // The clock is pinned because computing `now`, signing and verifying are
    // three separate reads of Date.now(): crossing a second boundary between
    // them flips a one-second-wide assertion, which made this flaky.
    const now = 1700000000;
    const clock = jest.spyOn(Date, 'now').mockReturnValue(now * 1000);

    try {
      expect(isValidToken(signWith(validPayload({ exp: now + 1 }), VALID_SECRET))).toBe(true);
      // exp === now is already expired: jsonwebtoken rejects on `now >= exp`.
      expect(isValidToken(signWith(validPayload({ exp: now }), VALID_SECRET))).toBe(false);
      expect(isValidToken(signWith(validPayload({ exp: now - 1 }), VALID_SECRET))).toBe(false);
    } finally {
      clock.mockRestore();
    }
  });

  it('rejects a not-yet-valid token', () => {
    const now = Math.floor(Date.now() / 1000);
    const notYet = signWith(validPayload({ nbf: now + 3600 }), VALID_SECRET);

    expect(isValidToken(notYet)).toBe(false);
  });

  it('rejects a token whose payload was edited after signing', () => {
    const token = issueTokenFor();
    const escalated = tamperPayload(token, (payload) => {
      payload.admin = true;
      payload[HASURA_CLAIMS]['x-hasura-default-role'] = 'admin';
      payload[HASURA_CLAIMS]['x-hasura-allowed-roles'] = ['admin'];
    });
    const impersonated = tamperPayload(token, (payload) => {
      payload.sub = 'victim';
      payload[HASURA_CLAIMS]['x-hasura-user-id'] = 'victim';
    });
    const extended = tamperPayload(token, (payload) => {
      payload.exp = payload.exp + MONTH_IN_SECONDS * 12;
    });

    expect(isValidToken(escalated)).toBe(false);
    expect(isValidToken(impersonated)).toBe(false);
    expect(isValidToken(extended)).toBe(false);
  });

  it('rejects a token whose signature was truncated or swapped', () => {
    const token = issueTokenFor();
    const [header, payload, signature] = token.split('.');

    expect(isValidToken(`${header}.${payload}.`)).toBe(false);
    expect(isValidToken(`${header}.${payload}.${signature.slice(0, -2)}`)).toBe(false);
    expect(
      isValidToken(`${header}.${payload}.${signWith(validPayload(), VALID_SECRET).split('.')[2]}`),
    ).toBe(false);
  });

  it.each([
    ['empty string', ''],
    ['whitespace', '   '],
    ['garbage', 'not-a-token'],
    ['two segments', 'aaa.bbb'],
    ['four segments', 'aaa.bbb.ccc.ddd'],
    ['raw JSON', JSON.stringify({ sub: 'viewer-1', admin: true })],
    ['base64 JSON but not a JWT', Buffer.from('{"sub":"viewer-1"}').toString('base64')],
    ['non-base64 segments', '!!!.@@@.###'],
    ['null', null],
    ['undefined', undefined],
    ['number', 12345],
    ['object', { sub: 'viewer-1' }],
  ])('rejects malformed input: %s', (_label, token) => {
    expect(isValidToken(token as unknown as string)).toBe(false);
  });
});

describe('tokenContainsViewer', () => {
  it('accepts a freshly issued token and reads the signed user id', () => {
    expect(tokenContainsViewer(issueTokenFor())).toBe(true);
  });

  it('rejects a forged token even when it carries a well-formed viewer id', () => {
    // The decode helper it delegates to does no signature check of its own, so
    // the `isValidToken` guard in front of it is the only thing stopping this.
    const forged = signWith(validPayload(), ATTACKER_SECRET);
    const none = `${base64url({ alg: 'none', typ: 'JWT' })}.${base64url(validPayload())}.`;

    expect(tokenContainsViewer(forged)).toBe(false);
    expect(tokenContainsViewer(none)).toBe(false);
  });

  it('rejects a correctly signed token that carries no Hasura claims', () => {
    const iat = Math.floor(Date.now() / 1000);
    const noClaims = signWith({ sub: 'viewer-1', iat, exp: iat + 60 }, VALID_SECRET);

    expect(tokenContainsViewer(noClaims)).toBe(false);
  });

  it('rejects a correctly signed token whose user id is empty', () => {
    const emptyId = signWith(
      validPayload({
        [HASURA_CLAIMS]: {
          'x-hasura-allowed-roles': ['user'],
          'x-hasura-default-role': 'user',
          'x-hasura-user-id': '',
        },
      }),
      VALID_SECRET,
    );

    expect(tokenContainsViewer(emptyId)).toBe(false);
  });

  it('rejects an expired token that otherwise contains a viewer', () => {
    const iat = Math.floor(Date.now() / 1000) - 7200;

    expect(tokenContainsViewer(signWith(validPayload({ iat, exp: iat + 60 }), VALID_SECRET))).toBe(
      false,
    );
  });

  it.each([['empty string', ''], ['garbage', 'nope'], ['null', null], ['undefined', undefined]])(
    'rejects malformed input: %s',
    (_label, token) => {
      expect(tokenContainsViewer(token as unknown as string)).toBe(false);
    },
  );
});

describe('getValidViewerId', () => {
  const reqWith = (cookies: { [key: string]: string } | undefined) =>
    ({ cookies } as unknown as NextApiRequest);

  it('returns the id from the signed payload', () => {
    const token = issueTokenFor(makeUser({ id: 'signed-user' }));

    expect(getValidViewerId(reqWith({ [TOKEN_NAME]: token }))).toBe('signed-user');
  });

  it('trusts the signed token over a conflicting viewer cookie', () => {
    // The viewer cookie is client-writable; it must never influence identity.
    const token = issueTokenFor(makeUser({ id: 'signed-user' }));

    expect(
      getValidViewerId(
        reqWith({
          [TOKEN_NAME]: token,
          [VIEWER_COOKIE_NAME]: JSON.stringify({ id: 'attacker', role: 'admin' }),
        }),
      ),
    ).toBe('signed-user');
  });

  it('ignores a genuine token planted in the client-writable viewer cookie', () => {
    // The viewer cookie is not HttpOnly, so anything in it is attacker-writable.
    // Identity may only ever be read out of the JWT_TOKEN_NAME cookie.
    const token = issueTokenFor(makeUser({ id: 'signed-user' }));

    expect(getValidViewerId(reqWith({ [VIEWER_COOKIE_NAME]: token }))).toBe('');
  });

  it('returns an empty string for a token signed with another secret', () => {
    const forged = signWith(validPayload({ sub: 'victim' }), ATTACKER_SECRET);

    expect(getValidViewerId(reqWith({ [TOKEN_NAME]: forged }))).toBe('');
  });

  it('returns an empty string for a tampered token', () => {
    const tampered = tamperPayload(issueTokenFor(), (payload) => {
      payload[HASURA_CLAIMS]['x-hasura-user-id'] = 'victim';
    });

    expect(getValidViewerId(reqWith({ [TOKEN_NAME]: tampered }))).toBe('');
  });

  it('returns an empty string for an expired token', () => {
    const iat = Math.floor(Date.now() / 1000) - 7200;
    const expired = signWith(validPayload({ iat, exp: iat + 60 }), VALID_SECRET);

    expect(getValidViewerId(reqWith({ [TOKEN_NAME]: expired }))).toBe('');
  });

  it.each([
    ['no cookies at all', undefined],
    ['empty cookie jar', {}],
    ['empty token', { [TOKEN_NAME]: '' }],
    ['garbage token', { [TOKEN_NAME]: 'garbage' }],
  ])('returns an empty string when there is %s', (_label, cookies) => {
    expect(getValidViewerId(reqWith(cookies))).toBe('');
  });

  it('round-trips through the cookie header that setAuthToken actually wrote', () => {
    const res = createRes();
    setAuthToken(makeUser({ id: 'round-trip-user' }), res);

    const jar = getSetCookies(res).reduce<{ [key: string]: string }>((acc, serialized) => {
      const [name] = serialized.split('=');
      acc[name] = cookieValue(serialized);
      return acc;
    }, {});

    expect(getValidViewerId(reqWith(jar))).toBe('round-trip-user');
  });
});

describe('module initialisation', () => {
  const loadWith = (env: { [key: string]: string | undefined }) => {
    const saved = { ...process.env };

    Object.entries(env).forEach(([key, value]) => {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    });

    let mod: JwtModule | undefined;
    let error: Error | undefined;

    jest.isolateModules(() => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        mod = require('utils/server/jwt');
      } catch (e) {
        error = e as Error;
      }
    });

    Object.keys(process.env).forEach((key) => {
      if (!(key in saved)) {
        delete process.env[key];
      }
    });
    Object.entries(saved).forEach(([key, value]) => {
      process.env[key] = value as string;
    });

    return { mod, error };
  };

  it('refuses to load without JWT_SECRET', () => {
    const { error } = loadWith({ JWT_SECRET: undefined });

    expect(error).toBeInstanceOf(Error);
    expect(error!.message).toMatch(/JWT_SECRET environment variable is required/);
  });

  it('refuses to load with an empty JWT_SECRET', () => {
    const { error } = loadWith({ JWT_SECRET: '' });

    expect(error).toBeInstanceOf(Error);
    expect(error!.message).toMatch(/JWT_SECRET environment variable is required/);
  });

  it('refuses to load in production when JWT_SECRET is not 64 base64 bytes', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    try {
      const tooShort = loadWith({ NODE_ENV: 'production', JWT_SECRET: 'hunter2' });
      const wrongLength = loadWith({
        NODE_ENV: 'production',
        JWT_SECRET: Buffer.from('a'.repeat(32)).toString('base64'),
      });
      const notBase64 = loadWith({
        NODE_ENV: 'production',
        JWT_SECRET: `${'a'.repeat(63)}!`,
      });

      [tooShort, wrongLength, notBase64].forEach(({ error }) => {
        expect(error).toBeInstanceOf(Error);
        expect(error!.message).toMatch(/must be a valid 64-byte base64-encoded string/);
      });
    } finally {
      spy.mockRestore();
    }
  });

  it('only warns for a weak JWT_SECRET outside production', () => {
    // BUG: a deploy where NODE_ENV is anything but "production" (staging, a
    // custom build script) boots happily and signs real sessions with a weak
    // secret -- the check logs and continues instead of failing closed.
    const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    try {
      const { mod, error } = loadWith({ NODE_ENV: 'staging', JWT_SECRET: 'hunter2' });

      expect(error).toBeUndefined();
      expect(mod).toBeDefined();
      expect(spy).toHaveBeenCalledWith(expect.stringMatching(/WARNING: JWT_SECRET is not a valid/));
    } finally {
      spy.mockRestore();
    }
  });

  it('accepts a 64-byte base64 secret without warning', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    try {
      const { error } = loadWith({ NODE_ENV: 'production', JWT_SECRET: VALID_SECRET });

      expect(error).toBeUndefined();
      expect(spy).not.toHaveBeenCalled();
    } finally {
      spy.mockRestore();
    }
  });

  it('drops the Secure flag only in development', () => {
    const { mod } = loadWith({ NODE_ENV: 'development' });
    const res = createRes();
    mod!.setAuthToken(makeUser(), res);

    getSetCookies(res).forEach((serialized) => {
      expect(cookieAttributes(serialized)).not.toContain('Secure');
      expect(cookieAttributes(serialized)).toContain('SameSite=Lax');
    });
  });

  it('keeps the Secure flag in production', () => {
    const { mod } = loadWith({ NODE_ENV: 'production' });
    const res = createRes();
    mod!.setAuthToken(makeUser(), res);

    getSetCookies(res).forEach((serialized) => {
      expect(cookieAttributes(serialized)).toContain('Secure');
    });
  });

  it('omits the Domain attribute when ROOT_DOMAIN is unset', () => {
    const { mod } = loadWith({ ROOT_DOMAIN: undefined });
    const res = createRes();
    mod!.setAuthToken(makeUser(), res);

    getSetCookies(res).forEach((serialized) => {
      expect(cookieAttributes(serialized).some((a) => a.startsWith('Domain='))).toBe(false);
    });
  });
});
