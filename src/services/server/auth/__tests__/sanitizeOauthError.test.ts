/**
 * sanitizeOauthError is the fix for a credential-disclosure bug: the OAuth SDKs
 * attach the full outbound request (which carries our client secret) to the errors
 * they throw, and those properties are enumerable, so anything that serialises the
 * raw error — `res.json()`, `console.log`, Sentry — prints the secret verbatim.
 *
 * Every test here builds an error with the *real* shape the SDK throws, asserts the
 * raw fixture really does leak (otherwise the test proves nothing), and then asserts
 * the sanitised copy does not.
 */
import { inspect } from 'util';
import { HttpError } from 'utils/server/fetchJson';
import sanitizeOauthError from '../sanitizeOauthError';

const SECRET = 'SUPER_SECRET';

/**
 * Render a value every way a logger / error reporter plausibly would. `JSON.stringify`
 * alone is a weak assertion for an Error, because `message`/`stack` are non-enumerable
 * on a real `new Error()` and would be invisible even if they held the secret.
 */
const renderEveryWay = (value: unknown): string => {
  const ownProps = value && typeof value === 'object' ? Object.getOwnPropertyNames(value) : [];

  return [
    JSON.stringify(value),
    JSON.stringify(value, ownProps.length ? ownProps : undefined),
    inspect(value, { depth: null, showHidden: true }),
    String(value),
    (value as Error)?.stack,
  ].join('\n');
};

/** Mirrors GaxiosError as google-auth-library throws it out of `client.getToken()`. */
const createGaxiosTokenError = () => {
  const config = {
    method: 'POST',
    url: 'https://oauth2.googleapis.com/token',
    data: `code=4%2F0AY0e&client_id=1234.apps.googleusercontent.com&client_secret=${SECRET}&redirect_uri=https%3A%2F%2Fskilled.dev%2Fapi%2Fauth%2Fgoogle%2Fcallback&grant_type=authorization_code`,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  };
  const err: any = new Error('invalid_grant');
  err.name = 'GaxiosError';
  err.code = '400';
  err.config = config;
  err.response = {
    config,
    status: 400,
    statusText: 'Bad Request',
    data: { error: 'invalid_grant', error_description: 'Bad Request' },
    request: { responseURL: 'https://oauth2.googleapis.com/token' },
  };

  return err;
};

/**
 * Mirrors request-promise's StatusCodeError, which the Facebook and GitHub handlers
 * got before they moved to fetchJson. Kept as the most hostile shape: it was built
 * the way request-promise-core does:
 * `Object.create(Error.prototype)` with every field as an own *enumerable* property.
 * That is why `JSON.stringify(err)` leaks `options.url` — which for Facebook holds the
 * app secret in the query string.
 */
const createStatusCodeError = () => {
  const url = `https://graph.facebook.com/v6.0/oauth/access_token?client_id=1234&redirect_uri=https%3A%2F%2Fskilled.dev%2Fapi%2Fauth%2Ffacebook%2Fcallback&client_secret=${SECRET}&code=AQBx`;
  const err: any = Object.create(Error.prototype);
  err.name = 'StatusCodeError';
  err.statusCode = 400;
  err.message = '400 - {"error":{"message":"This authorization code has been used."}}';
  err.error = { error: { message: 'This authorization code has been used.', code: 100 } };
  err.options = { method: 'GET', url, json: true, simple: true, resolveWithFullResponse: false };
  err.response = {
    statusCode: 400,
    body: { error: { message: 'This authorization code has been used.' } },
    request: {
      uri: { protocol: 'https:', host: 'graph.facebook.com', href: url, query: `client_secret=${SECRET}` },
      href: url,
    },
  };

  return err;
};

describe('sanitizeOauthError', () => {
  describe('secret disclosure (the regression this exists to prevent)', () => {
    it('does not carry the client secret out of a gaxios token-exchange error', () => {
      const err = createGaxiosTokenError();

      // The fixture must actually be dangerous, or the assertion below is vacuous.
      expect(JSON.stringify(err)).toContain(SECRET);

      const safe = sanitizeOauthError(err, 'google');

      expect(JSON.stringify(safe)).not.toContain(SECRET);
      expect(renderEveryWay(safe)).not.toContain(SECRET);
    });

    it('does not carry the app secret out of a request-promise StatusCodeError', () => {
      const err = createStatusCodeError();

      expect(JSON.stringify(err)).toContain(SECRET);

      const safe = sanitizeOauthError(err, 'facebook');

      expect(JSON.stringify(safe)).not.toContain(SECRET);
      expect(renderEveryWay(safe)).not.toContain(SECRET);
    });

    it('carries no own properties other than name, so no future field can smuggle the request out', () => {
      const safe = sanitizeOauthError(createStatusCodeError(), 'facebook');

      // `safeError.name = 'OauthError'` is the only own enumerable assignment.
      expect(Object.keys(safe)).toEqual(['name']);
      expect((safe as any).options).toBeUndefined();
      expect((safe as any).config).toBeUndefined();
      expect((safe as any).response).toBeUndefined();
      expect((safe as any).request).toBeUndefined();
      expect(JSON.stringify(safe)).toBe('{"name":"OauthError"}');
    });

    it('returns a new Error and never the original object', () => {
      const err = createGaxiosTokenError();
      const safe = sanitizeOauthError(err, 'google');

      expect(safe).not.toBe(err);
      expect(safe).toBeInstanceOf(Error);
      expect(safe.name).toBe('OauthError');
    });

    it('does not mutate or scrub the original error in place', () => {
      const err = createGaxiosTokenError();

      sanitizeOauthError(err, 'google');

      // A "fix" that deleted fields off the caller's error would break retry/logging
      // logic elsewhere; sanitising must be a copy, not a mutation.
      expect(err.config.data).toContain(SECRET);
      expect(err.message).toBe('invalid_grant');
    });

    it('stays a bare OauthError when it is applied twice', () => {
      // Reachable in production: microAuthGoogle sanitises in its catch, then
      // handlers/google/index.ts sanitises `auth.err` again before reporting it.
      const once = sanitizeOauthError(createGaxiosTokenError(), 'google');
      const twice = sanitizeOauthError(once, 'google');

      expect(twice.name).toBe('OauthError');
      expect(Object.keys(twice)).toEqual(['name']);
      expect(renderEveryWay(twice)).not.toContain(SECRET);
    });

    /**
     * KNOWN GAP (asserted the right way round on purpose).
     *
     * `sanitizeOauthError` scrubs structured fields but forwards `err.message`
     * verbatim, so a provider error whose *message* embeds the request URL still
     * discloses the secret. A transport error's message can name the request URL:
     * node-fetch's FetchError is `request to <url> failed, reason: <cause>`, and
     * request-promise's RequestError did the same (Node's own fetch says only
     * `fetch failed`). The Facebook token URL carries `client_secret` in its query
     * string.
     *
     * This is `it.failing`, not an assertion that the leak *must* happen: the
     * expectation below states the behaviour we want, so redacting the message
     * (strip `client_secret=`/`appsecret_proof=`, or drop the message for the status
     * alone) turns this red and the only change needed is deleting `.failing`.
     */
    it('redacts a secret embedded in the provider error message itself', () => {
      const url = `https://graph.facebook.com/v6.0/oauth/access_token?client_id=1234&client_secret=${SECRET}&code=AQBx`;
      const err: any = Object.create(Error.prototype);
      err.name = 'RequestError';
      err.message = `Error: Invalid URI "${url}"`;
      err.cause = new Error(`Invalid URI "${url}"`);
      err.options = { url };

      const safe = sanitizeOauthError(err, 'facebook');

      expect(safe.message).not.toContain(SECRET);
    });
  });

  describe('message and status', () => {
    it('keeps the provider, the status and the original message', () => {
      const safe = sanitizeOauthError(createGaxiosTokenError(), 'google');

      expect(safe.message).toBe('OAuth failed for google (status 400): invalid_grant');
    });

    it('keeps the status and message of an HTTP error from fetchJson', () => {
      const safe = sanitizeOauthError(
        new HttpError(400, { error: { message: 'This authorization code has been used.' } }),
        'facebook',
      );

      expect(safe.message).toBe(
        'OAuth failed for facebook (status 400): 400 - {"error":{"message":"This authorization code has been used."}}',
      );
      expect(Object.keys(safe)).toEqual(['name']);
    });

    it('keeps the request-promise status code and message', () => {
      const safe = sanitizeOauthError(createStatusCodeError(), 'facebook');

      // The exact string matters: the message is the *only* field carried across, so a
      // future "more helpful" error that appended `err.options.url` — where the secret
      // lives — would fail here rather than quietly widening the message.
      expect(safe.message).toBe(
        'OAuth failed for facebook (status 400): 400 - {"error":{"message":"This authorization code has been used."}}',
      );
      expect(safe.message).not.toContain('graph.facebook.com');
    });

    it('prefers statusCode, then status, then code', () => {
      const both: any = new Error('boom');
      both.statusCode = 500;
      both.status = 502;
      both.code = 'ETIMEDOUT';
      expect(sanitizeOauthError(both, 'github').message).toContain('(status 500)');

      const statusOnly: any = new Error('boom');
      statusOnly.status = 502;
      statusOnly.code = 'ETIMEDOUT';
      expect(sanitizeOauthError(statusOnly, 'github').message).toContain('(status 502)');

      // Network failures have no HTTP status at all — the errno is still worth logging.
      const codeOnly: any = new Error('boom');
      codeOnly.code = 'ETIMEDOUT';
      expect(sanitizeOauthError(codeOnly, 'github').message).toContain('(status ETIMEDOUT)');
    });

    it('falls back to the nested response when the status is not on the error itself', () => {
      const err: any = new Error('Unauthorized');
      err.response = { status: 401 };

      expect(sanitizeOauthError(err, 'google').message).toBe(
        'OAuth failed for google (status 401): Unauthorized',
      );
    });

    it('skips empty-string and null status values instead of reporting them', () => {
      const err: any = new Error('boom');
      err.statusCode = '';
      err.status = null;
      err.code = 403;

      expect(sanitizeOauthError(err, 'google').message).toBe(
        'OAuth failed for google (status 403): boom',
      );
    });

    it('omits the status section entirely when there is none', () => {
      expect(sanitizeOauthError(new Error('boom'), 'github').message).toBe(
        'OAuth failed for github: boom',
      );
    });
  });

  describe('non-Error input', () => {
    it.each([
      [null, 'null'],
      [undefined, 'undefined'],
      ['', 'empty string'],
      [0, 'zero'],
      [false, 'false'],
    ])('returns a bare provider error for %s (%s)', (input: unknown, _label: string) => {
      const safe = sanitizeOauthError(input, 'google');

      expect(safe).toBeInstanceOf(Error);
      expect(safe.message).toBe('OAuth failed for google');
      // The falsy branch returns before `name` is set.
      expect(safe.name).toBe('Error');
    });

    it('stringifies a string error, which is what GitHub returns in `response.error`', () => {
      const safe = sanitizeOauthError('bad_verification_code', 'github');

      expect(safe.message).toBe('OAuth failed for github: bad_verification_code');
      expect(safe.name).toBe('OauthError');
    });

    it('still reports the status of a plain object that is not an Error', () => {
      const safe = sanitizeOauthError({ statusCode: 401, options: { secret: SECRET } }, 'facebook');

      expect(safe.message).toBe('OAuth failed for facebook (status 401): [object Object]');
      expect(renderEveryWay(safe)).not.toContain(SECRET);
    });

    it('does not throw on primitives or exotic values', () => {
      expect(sanitizeOauthError(42, 'google').message).toBe('OAuth failed for google: 42');
      expect(sanitizeOauthError(Symbol('x'), 'google').message).toBe(
        'OAuth failed for google: Symbol(x)',
      );
      expect(sanitizeOauthError([1, 2], 'google').message).toBe('OAuth failed for google: 1,2');
    });
  });
});
