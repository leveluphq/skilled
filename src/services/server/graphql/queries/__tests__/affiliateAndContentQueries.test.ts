/**
 * The remaining query wrappers: affiliate attribution (which decides who gets
 * paid revenue share) and lesson lookup.
 */
jest.mock('services/server/graphql/client', () => ({
  __esModule: true,
  default: { request: jest.fn() },
}));

import client from 'services/server/graphql/client';
import getUserByAffiliateId from 'services/server/graphql/queries/getUserByAffiliateId';
import getAffiliateUserAndClick from 'services/server/graphql/queries/getAffiliateUserAndClick';
import getLessonBySlug from 'services/server/graphql/queries/getLessonBySlug';

const request = (client as unknown as { request: jest.Mock }).request;

beforeEach(() => {
  request.mockReset();
});

describe('getUserByAffiliateId', () => {
  const AFFILIATE = { id: 'affiliate-user-1', affiliateId: 'ada-lovelace' };

  it('unwraps the first matching affiliate user', async () => {
    request.mockResolvedValue({ users: [AFFILIATE] });

    await expect(getUserByAffiliateId('ada-lovelace')).resolves.toBe(AFFILIATE);

    const [document, variables] = request.mock.calls[0];

    expect(variables).toEqual({ affiliateId: 'ada-lovelace' });
    expect(document).not.toContain('ada-lovelace');
  });

  it('resolves undefined for an unknown affiliate id', async () => {
    request.mockResolvedValue({ users: [] });

    await expect(getUserByAffiliateId('not-an-affiliate')).resolves.toBeUndefined();
  });

  /**
   * BUG: the filter is `_ilike`, and the value arrives unescaped straight from
   * the POST body of /api/v1/affiliate/friend (and from the affiliate cookie on
   * the checkout path). `%` and `_` are SQL LIKE wildcards, so a request with
   * affiliateId `%` matches an arbitrary real affiliate and attributes the click
   * — and any resulting revenue share — to them. It should use `_eq`, or escape
   * wildcards before building the pattern.
   *
   * Asserted in the safe direction and marked `.failing` so a fix in either
   * shape turns it green; drop `.failing` then. Pinning the current behaviour as
   * "passing" would make fixing the flaw look like a regression.
   */
  it.failing('does not let a bare LIKE wildcard match an arbitrary affiliate', async () => {
    request.mockResolvedValue({ users: [AFFILIATE] });

    await getUserByAffiliateId('%');

    const [document, variables] = request.mock.calls[0];
    const matchesExactly = /affiliateId:\s*\{\s*_eq:\s*\$affiliateId\s*\}/.test(document);
    const wildcardEscaped = variables.affiliateId !== '%';

    expect(matchesExactly || wildcardEscaped).toBe(true);
  });
});

describe('getAffiliateUserAndClick', () => {
  // Unlike its siblings this one does no unwrapping at all: checkout.ts reads
  // `.users[0]` and `.affiliate_link_clicks_by_pk` off the result itself, and an
  // unmatched lookup must survive the round trip rather than throwing the way
  // getGiftCardByCode does.
  it.each([
    ['a matched lookup', { users: [{ id: 'affiliate-1', affiliateRevenueShare: 0.3 }], affiliate_link_clicks_by_pk: { id: 'click-1' } }],
    ['an unmatched lookup', { users: [], affiliate_link_clicks_by_pk: null }],
  ])('hands back both root fields untouched for %s', async (_name, response) => {
    request.mockResolvedValue(response);

    const result = await getAffiliateUserAndClick({
      affiliateId: 'ada',
      clickId: 'click-1',
    } as any);

    expect(result).toBe(response);
    expect(result).toHaveProperty('users');
    expect(result).toHaveProperty('affiliate_link_clicks_by_pk');
  });

  it('passes the variables object straight through and looks the click up by primary key', async () => {
    request.mockResolvedValue({ users: [], affiliate_link_clicks_by_pk: null });

    const variables = { affiliateId: 'ada', clickId: 'click-1' } as any;

    await getAffiliateUserAndClick(variables);

    const [document, sentVariables] = request.mock.calls[0];

    expect(sentVariables).toBe(variables);
    expect(document).toContain('affiliate_link_clicks_by_pk(id: $clickId)');
    expect(document).toContain('affiliateRevenueShare');
  });
});

describe('getLessonBySlug', () => {
  const LESSON = { id: 'lesson-1', slug: 'two-sum', status: 'ACTIVE' };

  it('only resolves ACTIVE lessons for a slug', async () => {
    request.mockResolvedValue({ lessons: [LESSON] });

    await expect(getLessonBySlug('two-sum')).resolves.toBe(LESSON);

    const [document, variables] = request.mock.calls[0];

    // A draft/retired lesson must not be reachable by guessing its slug.
    expect(document).toMatch(/slug:\s*\{\s*_eq:\s*\$slug\s*\}/);
    expect(document).toMatch(/status:\s*\{\s*_eq:\s*"ACTIVE"\s*\}/);
    expect(variables).toEqual({ slug: 'two-sum' });
  });

  it('resolves undefined for an unknown slug', async () => {
    request.mockResolvedValue({ lessons: [] });

    await expect(getLessonBySlug('nope')).resolves.toBeUndefined();
  });

  it('resolves undefined when the response itself is null', async () => {
    request.mockResolvedValue(null);

    await expect(getLessonBySlug('two-sum')).resolves.toBeUndefined();
  });

  /**
   * BUG: `data?.lessons[0]` guards the response object but not the field, so a
   * response missing `lessons` throws a TypeError instead of resolving
   * undefined. Same family as getGiftCardByCode; the safe form used by
   * getActiveProductById is `data?.lessons?.[0] || null`. Drop `.failing` once
   * the optional chaining is added.
   */
  it.failing('resolves undefined rather than throwing when the response has no lessons field', async () => {
    request.mockResolvedValue({});

    await expect(getLessonBySlug('two-sum')).resolves.toBeUndefined();
  });
});
