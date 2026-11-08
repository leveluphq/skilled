/**
 * Tests for `src/pages/friend/[affiliateId].ts` - the affiliate landing page
 * that records a click, drops the attribution cookie, and 302s the visitor on.
 *
 * The redirect target comes straight from the `?dest=` query string, so the
 * bulk of these tests are the open-redirect cases: nothing a visitor supplies
 * may end up as a cross-origin `Location`.
 */

import { createMocks } from 'node-mocks-http';
import type { NextPageContext } from 'next';

jest.mock('utils/client/withApollo', () => ({
  __esModule: true,
  default: (Component: unknown) => Component,
}));
jest.mock('next/router', () => ({
  __esModule: true,
  default: { push: jest.fn() },
}));
jest.mock('services/server/graphql/queries/getUserByAffiliateId', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('services/server/graphql/mutations/insertAffiliateLinkClick', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const originalEnv = { ...process.env };

Object.assign(process.env, {
  JWT_SECRET: Buffer.alloc(64, 'a').toString('base64'),
  JWT_TOKEN_NAME: 'skilled-friend-token',
  ROOT_DOMAIN: 'skilled.test',
  ROOT_URL: 'https://skilled.test',
  GRAPHQL_URL: 'https://hasura.internal.test/v1/graphql',
  HASURA_GRAPHQL_ADMIN_SECRET: 'admin-secret',
});

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Router = require('next/router').default as { push: jest.Mock };
// eslint-disable-next-line @typescript-eslint/no-var-requires
const getUserByAffiliateId = require('services/server/graphql/queries/getUserByAffiliateId')
  .default as jest.Mock;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const insertAffiliateLinkClick = require('services/server/graphql/mutations/insertAffiliateLinkClick')
  .default as jest.Mock;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const AffiliateRedirect = require('pages/friend/[affiliateId]').default as {
  getInitialProps: (ctx: NextPageContext) => Promise<unknown>;
};

const run = async (query: Record<string, string | string[]>, referer = 'https://twitter.com/x') => {
  const { req, res } = createMocks({
    method: 'GET',
    url: '/friend/ada-lovelace',
    headers: { 'x-forwarded-for': '198.51.100.4', referer },
  });

  const result = await AffiliateRedirect.getInitialProps({
    req,
    res,
    query,
  } as unknown as NextPageContext);

  return { req, res, result };
};

const locationOf = (res: { getHeader: (name: string) => unknown }) =>
  String(res.getHeader('Location') ?? '');

const setCookies = (res: { getHeader: (name: string) => unknown }): string[] => {
  const header = res.getHeader('Set-Cookie');

  if (!header) {
    return [];
  }

  return Array.isArray(header) ? (header as string[]) : [String(header)];
};

describe('pages/friend/[affiliateId]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    getUserByAffiliateId.mockResolvedValue({ id: 'affiliate-user-1' });
    insertAffiliateLinkClick.mockResolvedValue({
      insert_affiliate_link_clicks_one: { id: 'click-1' },
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(() => {
    process.env = { ...originalEnv };
  });

  describe('open redirect protection', () => {
    it.each([
      ['protocol-relative', '//evil.com'],
      ['protocol-relative with path', '//evil.com/phish'],
      ['absolute https url', 'https://evil.com/phish'],
      ['absolute http url', 'http://evil.com'],
      ['javascript scheme', 'javascript:alert(document.cookie)'],
      ['data scheme', 'data:text/html;base64,PHNjcmlwdD4='],
      ['backslash protocol-relative', '/\\evil.com'],
      ['double backslash', '\\\\evil.com'],
      ['scheme-relative with credentials', 'https://evil.com@skilled.dev'],
    ])('sends %s to the site root instead of another origin', async (_label, dest) => {
      const { res } = await run({ affiliateId: 'ada-lovelace', dest });

      expect(res.statusCode).toBe(302);
      expect(locationOf(res)).toBe('/');
      expect(locationOf(res)).not.toContain('evil.com');
    });

    it('rejects a protocol-relative destination supplied as a repeated query param', async () => {
      const { res } = await run({ affiliateId: 'ada-lovelace', dest: ['//evil.com'] });

      expect(locationOf(res)).toBe('/');
    });

    it('strips CR/LF so the destination cannot inject a response header', async () => {
      const { res } = await run({
        affiliateId: 'ada-lovelace',
        dest: '/course\r\nSet-Cookie: admin=true',
      });

      const location = locationOf(res);

      expect(location).not.toContain('\r');
      expect(location).not.toContain('\n');
      expect(location.startsWith('/course')).toBe(true);
      expect(setCookies(res).join('|')).not.toContain('admin=true');
    });

    it.each([
      ['an absolute in-site path', '/course/arrays', '/course/arrays'],
      ['a query string', '/course?tab=2', '/course?tab=2'],
      ['a relative path promoted to absolute', 'course/arrays', '/course/arrays'],
      ['a missing dest', undefined, '/'],
      ['an empty dest', '', '/'],
    ])('keeps %s as a same-origin path', async (_label, dest, expected) => {
      const query: Record<string, string | string[]> = { affiliateId: 'ada-lovelace' };

      if (dest !== undefined) {
        query.dest = dest;
      }

      const { res } = await run(query);

      expect(locationOf(res)).toBe(expected);
    });
  });

  describe('click tracking', () => {
    it('sets the affiliate cookie and records the sanitized destination', async () => {
      const { res } = await run({ affiliateId: 'ada-lovelace', dest: '/course/arrays' });

      expect(setCookies(res)).toEqual([
        expect.stringContaining('skilled-friend=ada-lovelace'),
      ]);
      expect(setCookies(res)[0]).toContain('Max-Age=2419200');

      expect(getUserByAffiliateId).toHaveBeenCalledWith('ada-lovelace');
      expect(insertAffiliateLinkClick).toHaveBeenCalledWith({
        affiliateIdUsed: 'ada-lovelace',
        ip: '198.51.100.4',
        referralUrl: 'https://twitter.com/x',
        affiliateUserId: 'affiliate-user-1',
        // The stored destination is the sanitized one, not the raw query value.
        destinationPagePath: '/course/arrays',
      });
      expect(res._isEndCalled()).toBe(true);
    });

    it('uses the first value when the affiliate id arrives as an array', async () => {
      const { res } = await run({ affiliateId: ['first-id', 'second-id'] });

      expect(getUserByAffiliateId).toHaveBeenCalledWith('first-id');
      expect(setCookies(res)[0]).toContain('skilled-friend=first-id');
    });

    it('records the click with a null affiliate user when the id is unknown', async () => {
      getUserByAffiliateId.mockResolvedValue(undefined);

      const { res } = await run({ affiliateId: 'not-a-real-affiliate' });

      expect(insertAffiliateLinkClick).toHaveBeenCalledWith(
        expect.objectContaining({ affiliateUserId: null }),
      );
      expect(res.statusCode).toBe(302);
      // BUG (low): the cookie is written before the affiliate id is verified, so
      // any string in the URL is stored for four weeks.
      expect(setCookies(res)[0]).toContain('skilled-friend=not-a-real-affiliate');
    });

    it('redirects to a safe path without tracking when no affiliate id is present', async () => {
      const { res } = await run({ dest: '//evil.com' });

      expect(res.statusCode).toBe(302);
      expect(locationOf(res)).toBe('/');
      expect(getUserByAffiliateId).not.toHaveBeenCalled();
      expect(insertAffiliateLinkClick).not.toHaveBeenCalled();
      expect(setCookies(res)).toHaveLength(0);
    });

    it('still redirects when the click cannot be recorded', async () => {
      insertAffiliateLinkClick.mockRejectedValue(new Error('hasura down'));

      const { res } = await run({ affiliateId: 'ada-lovelace', dest: '/course' });

      expect(res.statusCode).toBe(302);
      expect(locationOf(res)).toBe('/course');
      expect(res._isEndCalled()).toBe(true);
    });

    it('still redirects when the affiliate lookup throws', async () => {
      getUserByAffiliateId.mockRejectedValue(new Error('hasura down'));

      const { res } = await run({ affiliateId: 'ada-lovelace', dest: '/course' });

      expect(res.statusCode).toBe(302);
      expect(locationOf(res)).toBe('/course');
      expect(insertAffiliateLinkClick).not.toHaveBeenCalled();
    });

    it('percent-encodes a CRLF/attribute-laden affiliate id instead of splitting the response', async () => {
      // The cookie is written straight from the URL path segment, before the id
      // is looked up, so the serializer is the only thing standing between a
      // crafted link and an injected `Set-Cookie` attribute or header break.
      const malicious = 'evil\r\nSet-Cookie: admin=true; Domain=evil.com';

      const { res } = await run({ affiliateId: malicious, dest: '/course' });

      const cookies = setCookies(res);

      expect(cookies).toHaveLength(1);
      expect(cookies[0]).not.toContain('\r');
      expect(cookies[0]).not.toContain('\n');
      expect(cookies[0]).toContain('admin%3Dtrue');
      expect(cookies[0]).not.toContain('Domain=evil.com');
      expect(cookies[0]).toContain('Domain=skilled.test');
      expect(locationOf(res)).toBe('/course');
      // The raw value still reaches Hasura - the cookie layer is what makes it
      // safe here, not this page.
      expect(getUserByAffiliateId).toHaveBeenCalledWith(malicious);
    });

    it('sends an empty referral url when the request carries no referer', async () => {
      const { req, res } = createMocks({ method: 'GET', headers: { 'x-forwarded-for': '1.2.3.4' } });

      await AffiliateRedirect.getInitialProps({
        req,
        res,
        query: { affiliateId: 'ada-lovelace' },
      } as unknown as NextPageContext);

      expect(insertAffiliateLinkClick).toHaveBeenCalledWith(
        expect.objectContaining({ referralUrl: '', ip: '1.2.3.4' }),
      );
    });
  });

  describe('client-side navigation', () => {
    it('pushes to the home page when there is no server request', async () => {
      const result = await AffiliateRedirect.getInitialProps({
        query: { affiliateId: 'ada-lovelace' },
      } as unknown as NextPageContext);

      expect(Router.push).toHaveBeenCalledWith('/');
      expect(result).toEqual({});
      // BUG (low): a client-side navigation to /friend/<id> drops the referral
      // entirely - no cookie is set and no click is recorded.
      expect(insertAffiliateLinkClick).not.toHaveBeenCalled();
    });

  });
});
