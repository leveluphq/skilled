/**
 * Tests for the GitHub email lookup used during OAuth sign-in.
 *
 * The module is a thin wrapper around a single `fetchJson` call, so the
 * only things worth asserting are (a) the exact request it builds -- the URL,
 * scheme and where the access token is placed are security-relevant -- and
 * (b) that it hands the response back completely untransformed, because the
 * GitHub OAuth handler picks the PRIMARY address out of this list and gates
 * account linking on that address's `verified` flag
 * (`services/server/auth/handlers/github/index.ts`). Any filtering, re-ordering
 * or defaulting introduced here would change who can claim an existing account.
 *
 * `fetchJson` is mocked at the module boundary: no network access. Its own
 * tests (utils/server/__tests__/fetchJson.test.ts) cover the wire.
 *
 * NOTE: tests asserting that a mocked-in payload comes back out are near
 * worthless one per scenario, so the pass-through property is asserted once,
 * by identity, instead of once per response shape.
 */

import fetchJson, { HttpError } from 'utils/server/fetchJson';
import { GithubEmail } from 'utils/constants/github';
import getGithubEmails from '../getGithubEmails';

jest.mock('utils/server/fetchJson', () => ({
  ...jest.requireActual('utils/server/fetchJson'),
  __esModule: true,
  default: jest.fn(),
}));

const mockFetchJson = (fetchJson as unknown) as jest.Mock;

const email = (overrides: Partial<GithubEmail> = {}): GithubEmail => ({
  email: 'user@example.com',
  primary: false,
  verified: true,
  visibility: null,
  ...overrides,
});

describe('getGithubEmails', () => {
  beforeEach(() => {
    mockFetchJson.mockReset();
  });

  describe('request', () => {
    it('GETs the authenticated /user/emails endpoint with the token in the header', async () => {
      mockFetchJson.mockResolvedValue([]);

      await getGithubEmails('gho_secret-token');

      expect(mockFetchJson).toHaveBeenCalledTimes(1);
      expect(mockFetchJson).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.github.com/user/emails',
        headers: {
          Authorization: 'token gho_secret-token',
          'User-Agent': 'Skilled-dev',
        },
      });
      // A downgrade to http:// or a different host would leak the OAuth token.
      expect(mockFetchJson.mock.calls[0][0].url).toMatch(/^https:\/\/api\.github\.com\//);
    });

    it('never places the access token in the URL or query string', async () => {
      mockFetchJson.mockResolvedValue([]);

      await getGithubEmails('gho_secret-token');

      const options = mockFetchJson.mock.calls[0][0];
      // GitHub still accepts `?access_token=`, and a refactor to it would write
      // the token into access logs, proxy logs and Referer headers. The token
      // must appear exactly once, in the Authorization header.
      expect(options.url).not.toContain('gho_secret-token');
      expect(options.url).not.toContain('access_token');
      expect(options.qs).toBeUndefined();
      expect(options.body).toBeUndefined();
      expect(JSON.stringify(options).match(/gho_secret-token/g)).toHaveLength(1);
    });

    it('sends the token verbatim with no validation, even when falsy', async () => {
      mockFetchJson.mockResolvedValue([]);

      await getGithubEmails('');

      // Documents current behaviour: there is no guard for a missing token, so
      // a lost access token becomes a GitHub 401 rather than a fast local
      // failure. The handler only checks `auth.result.accessToken` beforehand.
      expect(mockFetchJson.mock.calls[0][0].headers.Authorization).toBe('token ');
    });
  });

  describe('response', () => {
    it('resolves the GitHub response untouched -- no filtering, mapping or re-ordering', async () => {
      const emails: GithubEmail[] = [
        email({ email: 'secondary@example.com', primary: false, verified: true }),
        // An address can be made primary BEFORE it is confirmed, which is
        // exactly the case the handler's `!primaryEmail.verified` check exists
        // to reject. Dropping or defaulting `verified` on the way through here
        // would silently re-open that account-takeover path.
        email({ email: 'attacker@victim.com', primary: true, verified: false }),
        email({ email: 'noreply@users.noreply.github.com', primary: false, verified: false }),
      ];
      mockFetchJson.mockResolvedValue(emails);

      const result = await getGithubEmails('token');

      // Identity, not deep equality: the strongest possible statement that the
      // list the caller's `.find(primary)` walks is byte-for-byte GitHub's.
      expect(result).toBe(emails);
      expect(result).toEqual([
        { email: 'secondary@example.com', primary: false, verified: true, visibility: null },
        { email: 'attacker@victim.com', primary: true, verified: false, visibility: null },
        {
          email: 'noreply@users.noreply.github.com',
          primary: false,
          verified: false,
          visibility: null,
        },
      ]);
    });

    it('propagates GitHub API failures instead of resolving an empty list', async () => {
      const apiError = new HttpError(401, { message: 'Bad credentials' });
      mockFetchJson.mockRejectedValue(apiError);

      // A swallowed error resolving to `[]` would be indistinguishable from
      // "account has no addresses", turning a revoked token into a confusing
      // 403 with no Sentry signal. Same for transport errors.
      await expect(getGithubEmails('expired-token')).rejects.toBe(apiError);
    });
  });
});
