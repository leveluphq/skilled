// Named imports, so the browser bundle keeps only these: @sentry/browser
// (aliased for @sentry/node in next.config.js) also exports session replay and
// tracing, which a namespace import would pull into every page.
import { init, configureScope, withScope, captureException, captureMessage } from '@sentry/node';
import { NextApiRequest } from 'next';
import get from 'lodash.get';
import { IncomingMessageWithCookies } from 'utils/constants/auth';

/**
 * Initialize Sentry and export it.
 *
 * Helper to avoid duplicating the init() call in every /pages/api file.
 * Also used in pages/index for the client side.
 */
try {
  init({
    dsn: process.env.SENTRY_DSN,
    enabled: process.env.NODE_ENV !== 'test',
    // environment: process.env.APP_STAGE,
    // release: process.env.APP_VERSION_RELEASE,
  });
} catch (error) {
  // This module loads with every page and API route, so a failure here would
  // take the whole site down. Run without Sentry instead. (A malformed DSN no
  // longer throws: Sentry logs "Invalid Sentry Dsn" itself and stays off.)
  // eslint-disable-next-line no-console
  console.error(`Sentry is off: it didn't start (${(error as Error).message})`);
}

// NOTE: Leaving out for now
// if (!process.env.SENTRY_DSN && process.env.NODE_ENV !== 'test') {
//   // eslint-disable-next-line no-console
//   console.error('Sentry DSN not defined');
// }

// Scope configured by default, subsequent calls to "configureScope" will add additional data
configureScope((scope) => {
  // See https://www.npmjs.com/package/@sentry/node
  scope.setTag('nodejs', process.version);
  scope.setTag('nodejsAWS', process.env.AWS_EXECUTION_ENV || ''); // Optional - Available on production environment only
  scope.setTag('memory', process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE || ''); // Optional - Available on production environment only
  scope.setTag('buildTime', process.env.BUILD_TIME || '');
});

/**
 * Keys whose values are credentials rather than diagnostics. Matched loosely
 * because request shapes vary: `HASURA_GRAPHQL_ADMIN_SECRET`, `x-auth-token`,
 * and `callbackSecret` should all be caught.
 */
const SENSITIVE_KEY_PATTERN = /(secret|token|password|passwd|authorization|auth|cookie|session|signature|credential|apikey|api[-_]?key|jwt|state)/i;

const REDACTED = '[redacted]';

const redact = (value: unknown, depth = 0): unknown => {
  if (depth > 3 || value === null || typeof value !== 'object') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((entry) => redact(entry, depth + 1));
  }

  return Object.entries(value as Record<string, unknown>).reduce(
    (acc, [key, entry]) => {
      acc[key] = SENSITIVE_KEY_PATTERN.test(key) ? REDACTED : redact(entry, depth + 1);
      return acc;
    },
    {} as Record<string, unknown>,
  );
};

// Headers worth keeping for debugging. An allowlist rather than a denylist, because
// `cookie` and `authorization` are not the only headers that can carry a credential.
const SAFE_HEADERS = [
  'host',
  'user-agent',
  'referer',
  'accept',
  'accept-language',
  'content-type',
  'content-length',
  'x-forwarded-for',
  'x-forwarded-proto',
];

const pickSafeHeaders = (headers: unknown) => {
  if (!headers || typeof headers !== 'object') {
    return {};
  }

  const source = headers as Record<string, unknown>;

  return SAFE_HEADERS.reduce((acc, name) => {
    if (source[name] !== undefined) {
      acc[name] = source[name];
    }
    return acc;
  }, {} as Record<string, unknown>);
};

/**
 * Configure the Sentry scope by extracting useful tags and context from the given request.
 *
 * Everything attached here is uploaded with every captured event, so no raw request
 * material is passed through: cookies carry the session JWT, the Judge0 callback
 * URL carries its shared secret in the query string, and request bodies carry
 * whatever the caller sent. Cookies are reported by name only, headers are
 * allowlisted, and query/body values are redacted by key.
 *
 * NOTE: this writes to the global scope, so under concurrency one request's context
 * can attach to another request's event. Values are scrubbed, so the consequence is
 * misattributed diagnostics rather than credential disclosure.
 *
 * @param req
 */
export const configureReq = (req: NextApiRequest | IncomingMessageWithCookies) => {
  configureScope((scope) => {
    const url = String(get(req, 'url') || '');

    scope.setTag('host', get(req, 'headers.host'));
    // Strip the query string: it is where callback secrets and OAuth codes live.
    scope.setTag('url', url.split('?')[0]);
    scope.setTag('method', get(req, 'method') || '');
    scope.setContext('query', redact(get(req, 'query')) as Record<string, unknown>);
    scope.setContext('cookieNames', {
      names: Object.keys(get(req, 'cookies') || {}),
    });
    scope.setContext('body', redact(get(req, 'body')) as Record<string, unknown>);
    scope.setContext('headers', pickSafeHeaders(get(req, 'headers')));
  });
};

const Sentry = { withScope, captureException, captureMessage };

export default Sentry;
