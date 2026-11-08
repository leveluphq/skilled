import { getViewerFromToken } from 'utils/shared/auth';
import { HASURA_CLAIMS_KEY, HasuraClaimKey } from 'utils/constants/auth';

const USER_ID = '0d0f6f8e-4a4f-4f9e-9f2b-1b2c3d4e5f60';

const encodeSegment = (value: object, encoding: 'base64' | 'base64url' = 'base64url') =>
  Buffer.from(JSON.stringify(value)).toString(encoding);

const NO_USER_ID = Symbol('no user id');

const buildPayload = (userId: string | typeof NO_USER_ID = USER_ID) => ({
  [HASURA_CLAIMS_KEY]: {
    [HasuraClaimKey.AllowedRoles]: ['user'],
    [HasuraClaimKey.DefaultRole]: 'user',
    ...(userId === NO_USER_ID ? {} : { [HasuraClaimKey.UserID]: userId }),
  },
  iat: 1650000000,
});

const buildToken = (payload: object, signature = 'c2lnbmF0dXJl') =>
  `${encodeSegment({ alg: 'HS256', typ: 'JWT' })}.${encodeSegment(payload)}.${signature}`;

/**
 * Real JWT payloads are base64url encoded, which swaps `+`/`/` for `-`/`_`.
 * Whether a given payload produces those characters depends on byte alignment,
 * so pad the payload until the encoding actually contains one.
 */
const buildBase64UrlPayload = (userId: string) => {
  for (let pad = 0; pad < 16; pad += 1) {
    const payload = {
      [HASURA_CLAIMS_KEY]: { [HasuraClaimKey.UserID]: userId },
      iat: 1650000000,
      pad: '?'.repeat(pad),
    };
    const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');

    if (/[-_]/.test(encoded)) {
      return encoded;
    }
  }

  throw new Error('Could not build a base64url payload fixture');
};

describe('getViewerFromToken', () => {
  it('extracts the Hasura user id from the token payload', () => {
    expect(getViewerFromToken(buildToken(buildPayload()))).toEqual({ id: USER_ID });
  });

  it('does not leak one caller’s id into the next call', () => {
    // This module is a long-lived singleton in the Next.js server process and is
    // called once per request (utils/server/jwt.ts -> getValidViewerId). If the
    // `viewer` object were ever hoisted out of the function body it would be
    // shared across requests, and a request with a bad/absent token would come
    // back holding the previous request's user id.
    expect(getViewerFromToken(buildToken(buildPayload('user-a'))).id).toBe('user-a');

    expect(getViewerFromToken('garbage').id).toBe('');
    expect(getViewerFromToken('').id).toBe('');
    expect(getViewerFromToken(buildToken({ sub: 'user-a' })).id).toBe('');
    expect(getViewerFromToken(buildToken(buildPayload('user-b'))).id).toBe('user-b');
  });

  it('returns a distinct viewer object per call', () => {
    const first = getViewerFromToken(buildToken(buildPayload('user-a')));
    const second = getViewerFromToken(buildToken(buildPayload('user-b')));

    expect(first).not.toBe(second);
    expect(first.id).toBe('user-a');
  });

  it('reads the id from the Hasura claims namespace, not the top level', () => {
    const token = buildToken({ 'x-hasura-user-id': 'top-level-id', sub: 'sub-id' });

    expect(getViewerFromToken(token).id).toBe('');
  });

  it('returns an empty viewer for an empty or missing token', () => {
    expect(getViewerFromToken('')).toEqual({ id: '' });
    expect(getViewerFromToken()).toEqual({ id: '' });
    expect(getViewerFromToken(undefined)).toEqual({ id: '' });
  });

  it('returns an empty viewer instead of throwing on malformed tokens', () => {
    expect(getViewerFromToken('garbage').id).toBe('');
    expect(getViewerFromToken('only.two').id).toBe('');
    expect(getViewerFromToken('a.!!!not-base64!!!.c').id).toBe('');
    expect(getViewerFromToken('...').id).toBe('');
  });

  it('returns an empty viewer when the payload decodes to something that is not JSON', () => {
    const token = `${encodeSegment({ alg: 'none' })}.${Buffer.from('plain text').toString(
      'base64url',
    )}.sig`;

    expect(getViewerFromToken(token).id).toBe('');
  });

  it.each([
    ['null', 'null'],
    ['a bare number', '1234'],
    ['a string', '"user-a"'],
    ['an array', '[{"x-hasura-user-id":"user-a"}]'],
  ])('returns an empty viewer when the payload is valid JSON but %s', (_label, json) => {
    // JSON.parse succeeds here, so the claims lookup is what has to survive:
    // `null[CLAIMS]` throws and the primitives index to undefined.
    const token = `header.${Buffer.from(json).toString('base64url')}.sig`;

    expect(getViewerFromToken(token)).toEqual({ id: '' });
  });

  it('returns an empty viewer when the claims namespace is null', () => {
    expect(getViewerFromToken(buildToken({ [HASURA_CLAIMS_KEY]: null }))).toEqual({ id: '' });
  });

  it('returns an empty viewer when the Hasura claims namespace is absent', () => {
    expect(getViewerFromToken(buildToken({ sub: USER_ID, iat: 1650000000 })).id).toBe('');
  });

  // BUG: when the claims object exists but has no user-id, `viewer.id` is set to
  // `undefined`, which violates the `Viewer { id: string }` contract. Callers
  // that do a truthiness check are fine, but anything doing `viewer.id.length`
  // or passing it to a GraphQL String! variable gets undefined instead of ''.
  it('yields an undefined id (not "") when the claims lack a user id', () => {
    const viewer = getViewerFromToken(buildToken(buildPayload(NO_USER_ID)));

    expect(viewer.id).toBeUndefined();
    expect(viewer).toHaveProperty('id');
  });

  it('does NOT verify the signature — callers must validate the token first', () => {
    // Documents the trust boundary: utils/server/jwt.ts gates this behind
    // isValidToken(). Using getViewerFromToken alone would accept a forged id.
    const forged = buildToken(buildPayload('attacker-controlled-id'), 'not-a-real-signature');

    expect(getViewerFromToken(forged).id).toBe('attacker-controlled-id');
    expect(getViewerFromToken(`${forged}.extra.segments`).id).toBe('attacker-controlled-id');
  });

  it('decodes base64url payloads (the JWT standard encoding) on the server', () => {
    const encoded = buildBase64UrlPayload(USER_ID);

    expect(getViewerFromToken(`header.${encoded}.sig`).id).toBe(USER_ID);
  });

  it('decodes non-ASCII payloads as UTF-8 on the server', () => {
    const payload = { [HASURA_CLAIMS_KEY]: { [HasuraClaimKey.UserID]: 'ünïcøde-id' } };

    expect(getViewerFromToken(`header.${encodeSegment(payload)}.sig`).id).toBe('ünïcøde-id');
  });

  describe('browser branch (atob)', () => {
    beforeEach(() => {
      (global as any).window = {};
    });

    afterEach(() => {
      delete (global as any).window;
    });

    it('decodes a standard base64 payload', () => {
      const token = `header.${encodeSegment(buildPayload(), 'base64')}.sig`;

      expect(getViewerFromToken(token).id).toBe(USER_ID);
    });

    // BUG: in the browser, `atob` rejects the `-` and `_` characters that
    // base64url (what JWTs actually use) produces, so the decode throws, the
    // catch swallows it, and the viewer comes back empty — i.e. a signed-in
    // user would look signed out for that subset of tokens. The server branch
    // (Buffer) decodes the same token fine. Should use a base64url -> base64
    // conversion before calling atob.
    it('fails to decode a base64url payload and returns an empty viewer', () => {
      const encoded = buildBase64UrlPayload(USER_ID);

      expect(getViewerFromToken(`header.${encoded}.sig`).id).toBe('');
    });
  });
});
