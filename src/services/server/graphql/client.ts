/**
 * The server's Hasura client, with the admin secret: every query and mutation in
 * services/server goes through it. It does what graphql-request 1.8 did, which it
 * replaced: POST the document and variables as JSON, resolve to `data`, and reject
 * with a ClientError when Hasura answers with errors or a status outside 2xx.
 */
const ENDPOINT = process.env.GRAPHQL_URL || '/v1/graphql';
const ADMIN_SECRET = process.env.HASURA_GRAPHQL_ADMIN_SECRET || '';

type Variables = { [key: string]: any };

interface ClientErrorResponse {
  data?: any;
  errors?: { message: string }[];
  error?: string;
  status: number;
  [key: string]: unknown;
}

/** As graphql-request's: the response (errors, data, status) and the request. */
export class ClientError extends Error {
  response: ClientErrorResponse;

  request: { query: string; variables?: Variables };

  constructor(response: ClientErrorResponse, request: { query: string; variables?: Variables }) {
    const summary = response.errors?.[0]?.message ?? `GraphQL Error (Code: ${response.status})`;

    super(`${summary}: ${JSON.stringify({ response, request })}`);
    this.response = response;
    this.request = request;
  }
}

const request = async <T = any>(query: string, variables?: Variables): Promise<T> => {
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-hasura-admin-secret': ADMIN_SECRET },
    body: JSON.stringify({ query, variables: variables || undefined }),
  });
  const contentType = response.headers.get('Content-Type');
  const result =
    contentType && contentType.startsWith('application/json')
      ? await response.json()
      : await response.text();

  if (response.ok && !result.errors && result.data) {
    return result.data;
  }

  const errorResult = typeof result === 'string' ? { error: result } : result;

  throw new ClientError({ ...errorResult, status: response.status }, { query, variables });
};

const client = { request };

export default client;
