import fetch from 'isomorphic-unfetch';

/**
 * A response outside 2xx. Like request-promise's StatusCodeError, which the OAuth
 * handlers used to get, it has `statusCode` and the message `<status> - <body>`;
 * sanitizeOauthError reads both. It never holds the request, since a request can
 * carry a secret: Facebook's token URL has the app secret in its query string.
 */
export class HttpError extends Error {
  statusCode: number;

  body: unknown;

  constructor(statusCode: number, body: unknown) {
    super(`${statusCode} - ${JSON.stringify(body)}`);
    this.name = 'HttpError';
    this.statusCode = statusCode;
    this.body = body;
  }
}

export interface FetchJsonOptions {
  method?: 'GET' | 'POST';
  url: string;
  headers?: Record<string, string>;
  body?: unknown;
}

/**
 * A request that sends and accepts JSON, as request-promise's `json: true` did.
 * It resolves to the parsed response body (or its text, if the body isn't JSON)
 * and rejects with an HttpError for any status outside 2xx.
 */
const fetchJson = async <T = any>({
  method = 'GET',
  url,
  headers = {},
  body,
}: FetchJsonOptions): Promise<T> => {
  const response = await fetch(url, {
    method,
    headers: {
      accept: 'application/json',
      ...(body === undefined ? {} : { 'content-type': 'application/json' }),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  let data: unknown;

  try {
    data = text ? JSON.parse(text) : undefined;
  } catch {
    data = text;
  }

  if (!response.ok) {
    throw new HttpError(response.status, data);
  }

  return data as T;
};

export default fetchJson;
