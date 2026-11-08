/**
 * fetchJson replaced request-promise with `json: true` in the OAuth handlers, so
 * these pin what that did on the wire: JSON in and out, the caller's headers,
 * the parsed body back, and an error with the status for anything outside 2xx.
 * `isomorphic-unfetch` is mocked, so nothing dials out.
 */
import fetch from 'isomorphic-unfetch';
import fetchJson, { HttpError } from '../fetchJson';

jest.mock('isomorphic-unfetch', () => jest.fn());

const mockFetch = fetch as unknown as jest.Mock;

const respond = (status: number, text: string) =>
  mockFetch.mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    text: async () => text,
  });

describe('fetchJson', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('GETs with the caller headers, asks for JSON and sends no body', async () => {
    respond(200, '[{"email":"a@b.c"}]');

    const result = await fetchJson({
      url: 'https://api.github.com/user/emails',
      headers: { Authorization: 'token t', 'User-Agent': 'Skilled-dev' },
    });

    expect(result).toEqual([{ email: 'a@b.c' }]);
    expect(mockFetch).toHaveBeenCalledWith('https://api.github.com/user/emails', {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: 'token t',
        'User-Agent': 'Skilled-dev',
      },
      body: undefined,
    });
  });

  it('POSTs a body as JSON', async () => {
    respond(200, '{"access_token":"gh"}');

    const result = await fetchJson({
      method: 'POST',
      url: 'https://github.com/login/oauth/access_token',
      body: { client_id: 'id', code: 'c' },
    });

    expect(result).toEqual({ access_token: 'gh' });
    expect(mockFetch.mock.calls[0][1]).toEqual({
      method: 'POST',
      headers: { accept: 'application/json', 'content-type': 'application/json' },
      body: '{"client_id":"id","code":"c"}',
    });
  });

  it('resolves the text of a body that is not JSON, and undefined for an empty one', async () => {
    respond(200, 'access_token=gh&scope=user');
    await expect(fetchJson({ url: 'https://example.test' })).resolves.toBe(
      'access_token=gh&scope=user',
    );

    respond(204, '');
    await expect(fetchJson({ url: 'https://example.test' })).resolves.toBeUndefined();
  });

  it('rejects a status outside 2xx with the status and body, and without the request', async () => {
    respond(400, '{"error":{"message":"bad code"}}');

    const error = await fetchJson({
      url: 'https://graph.facebook.com/v6.0/oauth/access_token?client_secret=SUPER_SECRET',
    }).catch((e) => e);

    expect(error).toBeInstanceOf(HttpError);
    expect(error).toMatchObject({
      name: 'HttpError',
      statusCode: 400,
      body: { error: { message: 'bad code' } },
      message: '400 - {"error":{"message":"bad code"}}',
    });
    expect(JSON.stringify(error)).not.toContain('SUPER_SECRET');
    expect(error.stack).not.toContain('SUPER_SECRET');
  });

  it('passes a transport failure through unchanged', async () => {
    const failure = new Error('request to https://example.test failed, reason: ECONNRESET');

    mockFetch.mockRejectedValue(failure);
    await expect(fetchJson({ url: 'https://example.test' })).rejects.toBe(failure);
  });
});
