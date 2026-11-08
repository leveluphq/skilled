/**
 * Tests for `src/pages/api/v1/affiliate/friend.ts` - the XHR endpoint that
 * records an affiliate link click and drops the attribution cookies.
 */

import { createMocks, RequestOptions } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';

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
  JWT_TOKEN_NAME: 'skilled-affiliate-token',
  ROOT_DOMAIN: 'skilled.test',
  ROOT_URL: 'https://skilled.test',
  GRAPHQL_URL: 'https://hasura.internal.test/v1/graphql',
  HASURA_GRAPHQL_ADMIN_SECRET: 'admin-secret',
});

// eslint-disable-next-line @typescript-eslint/no-var-requires
const getUserByAffiliateId = require('services/server/graphql/queries/getUserByAffiliateId')
  .default as jest.Mock;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const insertAffiliateLinkClick = require('services/server/graphql/mutations/insertAffiliateLinkClick')
  .default as jest.Mock;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const handler = require('pages/api/v1/affiliate/friend').default as (
  req: NextApiRequest,
  res: NextApiResponse,
) => Promise<void>;

type CallOptions = Omit<RequestOptions, 'body'> & { body?: unknown };

const call = async (options: CallOptions = {}) => {
  const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
    method: 'POST',
    headers: { 'x-forwarded-for': '198.51.100.4' },
    body: {
      affiliateId: 'ada-lovelace',
      destinationPagePath: '/course',
      referralUrl: 'https://twitter.com/someone/status/1',
    },
    ...options,
  } as RequestOptions);

  await handler(req, res);

  return res;
};

const setCookies = (res: { getHeader: (name: string) => unknown }): string[] => {
  const header = res.getHeader('Set-Cookie');

  if (!header) {
    return [];
  }

  return Array.isArray(header) ? (header as string[]) : [String(header)];
};

describe('api/v1/affiliate/friend', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    getUserByAffiliateId.mockResolvedValue({ id: 'affiliate-user-1', affiliateId: 'ada-lovelace' });
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

  it('rejects non-POST requests with 405 and an Allow header', async () => {
    const res = await call({ method: 'GET' });

    expect(res._getStatusCode()).toBe(405);
    expect(res.getHeader('Allow')).toEqual(['POST']);
    expect(insertAffiliateLinkClick).not.toHaveBeenCalled();
  });

  it.each([
    ['an empty body', {}],
    ['an empty affiliate id', { affiliateId: '' }],
  ])('rejects %s with 400 and sets no cookie', async (_label, body) => {
    const res = await call({ body });

    expect(res._getStatusCode()).toBe(400);
    expect(res._getData()).toBe('Did not receive an affiliate ID');
    expect(getUserByAffiliateId).not.toHaveBeenCalled();
    expect(insertAffiliateLinkClick).not.toHaveBeenCalled();
    expect(setCookies(res)).toHaveLength(0);
  });

  it('records the click and sets both attribution cookies', async () => {
    const res = await call();

    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toEqual({ success: true });

    expect(insertAffiliateLinkClick).toHaveBeenCalledWith({
      affiliateIdUsed: 'ada-lovelace',
      ip: '198.51.100.4',
      referralUrl: 'https://twitter.com/someone/status/1',
      affiliateUserId: 'affiliate-user-1',
      destinationPagePath: '/course',
    });

    const cookies = setCookies(res);

    expect(cookies).toHaveLength(2);
    expect(cookies).toEqual(
      expect.arrayContaining([
        expect.stringContaining('skilled-friend=ada-lovelace'),
        expect.stringContaining('skilled-ref-id=click-1'),
      ]),
    );
    // Four weeks, scoped to the configured root domain.
    cookies.forEach((cookie) => {
      expect(cookie).toContain('Max-Age=2419200');
      expect(cookie).toContain('Domain=skilled.test');
      expect(cookie).toContain('Path=/');
    });
  });

  it('still attributes and cookies a click for an unknown affiliate id', async () => {
    getUserByAffiliateId.mockResolvedValue(undefined);

    const res = await call({ body: { affiliateId: 'does-not-exist' } });

    expect(res._getStatusCode()).toBe(200);
    expect(insertAffiliateLinkClick).toHaveBeenCalledWith(
      expect.objectContaining({ affiliateIdUsed: 'does-not-exist', affiliateUserId: null }),
    );
    // BUG (low): an arbitrary, unverified string is stored in a four-week cookie
    // and later used for revenue attribution. Unknown ids should not be cookied.
    expect(setCookies(res)).toEqual(
      expect.arrayContaining([expect.stringContaining('skilled-friend=does-not-exist')]),
    );
  });

  it('defaults the destination path and referral url to empty strings', async () => {
    await call({ body: { affiliateId: 'ada-lovelace' } });

    expect(insertAffiliateLinkClick).toHaveBeenCalledWith(
      expect.objectContaining({ destinationPagePath: '', referralUrl: '' }),
    );
  });

  it('percent-encodes a CRLF-laden affiliate id instead of splitting the response header', async () => {
    const malicious = 'evil\r\nSet-Cookie: admin=true';

    const res = await call({ body: { affiliateId: malicious } });

    const cookies = setCookies(res);

    expect(res._getStatusCode()).toBe(200);
    cookies.forEach((cookie) => {
      expect(cookie).not.toContain('\n');
      expect(cookie).not.toContain('\r');
    });
    expect(cookies.join('|')).toContain('admin%3Dtrue');
    // The raw value is still forwarded to the Hasura lookup unvalidated - the
    // cookie layer is what makes it safe, not this handler.
    expect(getUserByAffiliateId).toHaveBeenCalledWith(malicious);
  });

  it('writes the literal string "undefined" when the click insert returns no id', async () => {
    insertAffiliateLinkClick.mockResolvedValue({ insert_affiliate_link_clicks_one: null });

    const res = await call();

    // BUG (low): `clickId` is undefined here, and `setAffiliateReferralIdCookie`
    // stringifies it, so the browser carries `skilled-ref-id=undefined` for four
    // weeks and later lookups by that id silently miss.
    expect(res._getStatusCode()).toBe(200);
    expect(setCookies(res)).toEqual(
      expect.arrayContaining([expect.stringContaining('skilled-ref-id=undefined')]),
    );
  });

  it('returns a generic 500 and sets no cookie when the click insert fails', async () => {
    insertAffiliateLinkClick.mockRejectedValue(new Error('hasura: relation does not exist'));

    const res = await call();

    expect(res._getStatusCode()).toBe(500);
    expect(res._getData()).toEqual({
      message: 'There was an internal error',
      statusCode: 500,
    });
    expect(JSON.stringify(res._getData())).not.toContain('relation does not exist');
    // The cookies are written only after the insert resolves, so a failed write
    // leaves no attribution behind.
    expect(setCookies(res)).toHaveLength(0);
  });

  it('returns 500 when the affiliate lookup fails', async () => {
    getUserByAffiliateId.mockRejectedValue(new Error('network'));

    const res = await call();

    expect(res._getStatusCode()).toBe(500);
    expect(insertAffiliateLinkClick).not.toHaveBeenCalled();
  });

  it('applies security headers', async () => {
    const res = await call();

    expect(res.getHeader('X-Frame-Options')).toBe('DENY');
  });
});
