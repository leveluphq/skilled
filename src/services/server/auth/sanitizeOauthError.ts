/**
 * Reduce an OAuth provider error to a plain Error safe to log, report, or return.
 *
 * Provider SDKs attach the full outbound request to the errors they throw, and that
 * request carries our client secret: `google-auth-library` posts `client_secret` in
 * the token-exchange body (retained on `GaxiosError.config`). Those properties are
 * enumerable, so `JSON.stringify` on the raw error — which is what `res.json()` and
 * Sentry both do — leaks the secret verbatim. The Facebook and GitHub handlers use
 * fetchJson, whose HttpError holds only the status and the response body.
 *
 * Only the message and a status code are carried across; the original error object
 * is never retained.
 */
/**
 * Credential-bearing parameters as they appear inside an error *message*.
 *
 * Scrubbing the structured fields is not sufficient on its own: a transport error's
 * message can name the request URL (node-fetch's FetchError is
 * `request to <url> failed, reason: <cause>`; Node's own fetch says only
 * `fetch failed`). Because the Facebook token URL carries `client_secret` in its
 * query string, such a message would otherwise put the secret into the one we keep.
 */
const SENSITIVE_PARAM_PATTERN = /\b([a-z0-9_-]*(?:secret|token|password|passwd|signature|apikey|api_key|proof|credential)[a-z0-9_-]*)=([^&\s"'\\]*)/gi;

const scrubMessage = (message: string): string =>
  message.replace(SENSITIVE_PARAM_PATTERN, '$1=[redacted]');

const STATUS_KEYS = ['statusCode', 'status', 'code'];

const getStatus = (err: any): string | undefined => {
  for (const key of STATUS_KEYS) {
    const value = err?.[key] ?? err?.response?.[key];

    if (value !== undefined && value !== null && value !== '') {
      return String(value);
    }
  }

  return undefined;
};

const sanitizeOauthError = (err: unknown, provider: string): Error => {
  if (!err) {
    return new Error(`OAuth failed for ${provider}`);
  }

  const status = getStatus(err);
  const message = scrubMessage(err instanceof Error ? err.message : String(err));

  const safeError = new Error(
    `OAuth failed for ${provider}${status ? ` (status ${status})` : ''}: ${message}`,
  );
  safeError.name = 'OauthError';

  return safeError;
};

export default sanitizeOauthError;
