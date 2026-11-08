/**
 * The lookups the OAuth handlers use to decide "is this an existing account?".
 * A wrong answer here is an account takeover, so the tests focus on the guard
 * clauses (never query with a missing provider id) and on what a no-match
 * actually resolves to.
 */
jest.mock('services/server/graphql/client', () => ({
  __esModule: true,
  default: { request: jest.fn() },
}));

// utils/server/jwt throws at import time without a valid JWT_SECRET and does
// real cookie/JWT work; getViewerById only cares about the id it hands back.
jest.mock('utils/server/jwt', () => ({
  __esModule: true,
  getValidViewerId: jest.fn(),
}));

import { NextApiRequest } from 'next';
import client from 'services/server/graphql/client';
import { getValidViewerId } from 'utils/server/jwt';
import getUserByEmail from 'services/server/graphql/queries/getUserByEmail';
import getUserByGithubNodeId from 'services/server/graphql/queries/getUserByGithubNodeId';
import getUserByGoogleId from 'services/server/graphql/queries/getUserByGoogleId';
import getUserByFacebookId from 'services/server/graphql/queries/getUserByFacebookId';
import getViewerById from 'services/server/graphql/queries/getViewerById';

const request = (client as unknown as { request: jest.Mock }).request;
const mockGetValidViewerId = getValidViewerId as unknown as jest.Mock;

const USER = { id: 'user-1', email: 'someone@example.com', role: 'user' };

beforeEach(() => {
  request.mockReset();
  mockGetValidViewerId.mockReset();
});

describe.each([
  ['getUserByGithubNodeId', getUserByGithubNodeId, 'githubNodeId'],
  ['getUserByGoogleId', getUserByGoogleId, 'googleId'],
  ['getUserByFacebookId', getUserByFacebookId, 'facebookId'],
])('%s', (_name, lookup, variableName) => {
  it('never issues a query for a missing provider id', async () => {
    request.mockResolvedValue({ users: [USER] });

    // Hasura treats `where: { col: { _eq: null } }` as "no condition", so
    // querying with a blank provider id would hand back an arbitrary account.
    await expect(lookup('')).resolves.toBeNull();
    await expect(lookup(undefined as any)).resolves.toBeNull();
    await expect(lookup(null as any)).resolves.toBeNull();

    expect(request).not.toHaveBeenCalled();
  });

  it('passes the provider id as a variable and returns the first matching user', async () => {
    request.mockResolvedValue({ users: [USER] });

    await expect(lookup('provider-id-123')).resolves.toBe(USER);

    const [document, variables] = request.mock.calls[0];

    expect(typeof document).toBe('string');
    expect(variables).toEqual({ [variableName]: 'provider-id-123' });
    expect(document).not.toContain('provider-id-123');
    expect(document).toMatch(new RegExp(`${variableName}:\\s*\\{\\s*_eq:\\s*\\$${variableName}\\s*\\}`));
  });

  it('resolves undefined when the provider id matches no account', async () => {
    request.mockResolvedValue({ users: [] });

    await expect(lookup('unknown-provider-id')).resolves.toBeUndefined();
  });
});

describe('getUserByEmail', () => {
  it('returns the first user matching the email', async () => {
    request.mockResolvedValue({ users: [USER] });

    await expect(getUserByEmail('someone@example.com')).resolves.toBe(USER);

    const [document, variables] = request.mock.calls[0];

    expect(variables).toEqual({ email: 'someone@example.com' });
    expect(document).not.toContain('someone@example.com');
  });

  it('resolves undefined when no account uses that address', async () => {
    request.mockResolvedValue({ users: [] });

    await expect(getUserByEmail('nobody@example.com')).resolves.toBeUndefined();
  });

  /**
   * BUG: unlike its getUserBy<Provider>Id siblings this has no falsy guard, so a
   * blank/undefined email still hits Hasura as `where: { email: { _eq: null } }`,
   * which Hasura evaluates as "no filter" and answers with the first user in the
   * table — the same "match any user" primitive the sibling guards above exist
   * to prevent. Today every caller (the three OAuth handlers) validates the
   * address first, so it is latent rather than exploitable.
   *
   * Asserted in the safe direction and marked `.failing`: it documents the gap
   * without cementing it, and it will go red the moment the guard is added, at
   * which point `.failing` should be dropped.
   */
  it.failing('returns null without querying for a blank email, like its provider-id siblings', async () => {
    request.mockResolvedValue({ users: [USER] });

    await expect(getUserByEmail('')).resolves.toBeNull();
    await expect(getUserByEmail(undefined as any)).resolves.toBeNull();

    expect(request).not.toHaveBeenCalled();
  });

  it('propagates a transport failure rather than resolving "no such user"', async () => {
    request.mockRejectedValue(new Error('hasura unreachable'));

    // Resolving undefined here would make the OAuth handlers treat an outage as
    // "new user" and create a duplicate account for an existing address.
    await expect(getUserByEmail('someone@example.com')).rejects.toThrow('hasura unreachable');
  });
});

describe('getViewerById', () => {
  const buildReq = (query: Record<string, any> = {}) => ({ query }) as unknown as NextApiRequest;

  it('keys the lookup off the verified JWT viewer id, not anything in the request', async () => {
    mockGetValidViewerId.mockReturnValue('viewer-from-jwt');
    request.mockResolvedValue({ users_by_pk: USER });

    await expect(getViewerById(buildReq({ id: 'attacker-supplied-id' }))).resolves.toBe(USER);

    const [document, variables] = request.mock.calls[0];

    expect(variables).toEqual({ id: 'viewer-from-jwt' });
    expect(document).toContain('users_by_pk');
    expect(document).not.toContain('attacker-supplied-id');
  });

  it('returns null without querying when the request has no valid session', async () => {
    mockGetValidViewerId.mockReturnValue(null);

    await expect(getViewerById(buildReq())).resolves.toBeNull();

    expect(request).not.toHaveBeenCalled();
  });

  it('returns null when the verified id no longer exists as a user', async () => {
    mockGetValidViewerId.mockReturnValue('deleted-user');
    request.mockResolvedValue({ users_by_pk: null });

    await expect(getViewerById(buildReq())).resolves.toBeNull();
  });
});
