/**
 * Queries on the payment / entitlement path. The unwrapping is where the real
 * bugs live: each of these wrappers reaches into a differently-shaped response
 * and they disagree about what "nothing found" resolves to (null vs undefined
 * vs a thrown TypeError), which is exactly what callers branch on.
 */
jest.mock('services/server/graphql/client', () => ({
  __esModule: true,
  default: { request: jest.fn() },
}));

import { NextApiRequest } from 'next';
import client from 'services/server/graphql/client';
import getActiveProducts from 'services/server/graphql/queries/getActiveProducts';
import getGiftCardByCode from 'services/server/graphql/queries/getGiftCardByCode';
import getSaleByStripeSessionId from 'services/server/graphql/queries/getSaleByStripeSessionId';
import getUserByStripeCustomerId from 'services/server/graphql/queries/getUserByStripeCustomerId';
import getLessonVideoIdById from 'services/server/graphql/queries/getLessonVideoIdById';

const request = (client as unknown as { request: jest.Mock }).request;

beforeEach(() => {
  request.mockReset();
});

describe('getActiveProducts', () => {
  it('asks only for ACTIVE products', async () => {
    request.mockResolvedValue({ products: [] });

    await getActiveProducts();

    const [document, variables] = request.mock.calls[0];

    expect(document).toMatch(/status:\s*\{\s*_eq:\s*"ACTIVE"\s*\}/);
    // The list query takes no variables at all.
    expect(variables).toBeUndefined();
  });

  it('unwraps the products array', async () => {
    const products = [{ id: 'p1' }, { id: 'p2' }];
    request.mockResolvedValue({ products });

    await expect(getActiveProducts()).resolves.toBe(products);
  });

  it('resolves undefined — not an empty array — when the response has no products', async () => {
    request.mockResolvedValue(null);

    // Callers that `.map()` this must null-check first.
    await expect(getActiveProducts()).resolves.toBeUndefined();
  });
});

describe('getGiftCardByCode', () => {
  const GIFT_CARD = {
    id: 'gc-1',
    code: 'ABC-123',
    status: 'ISSUED',
    productAccessDays: 365,
  };

  it('looks the card up by exact code, passed as a variable', async () => {
    request.mockResolvedValue({ gift_cards: [GIFT_CARD] });

    await expect(getGiftCardByCode('ABC-123')).resolves.toBe(GIFT_CARD);

    const [document, variables] = request.mock.calls[0];

    expect(variables).toEqual({ code: 'ABC-123' });
    expect(document).not.toContain('ABC-123');
    expect(document).toMatch(/code:\s*\{\s*_eq:\s*\$code\s*\}/);
    expect(document).toMatch(/limit:\s*1/);
  });

  it('selects the fields redemption depends on', async () => {
    request.mockResolvedValue({ gift_cards: [] });

    await getGiftCardByCode('ABC-123');

    const [document] = request.mock.calls[0];
    // Only the gift card's own fields, not the nested product selection.
    const giftCardFields = document.slice(0, document.indexOf('product {'));

    // /api/v1/giftcard/redeem branches on `status` and grants access for
    // `productAccessDays`; dropping either from the selection set breaks
    // redemption or grants the wrong amount of access.
    expect(giftCardFields).toContain('status');
    expect(giftCardFields).toContain('productAccessDays');
  });

  it('resolves undefined when the code matches no card', async () => {
    request.mockResolvedValue({ gift_cards: [] });

    await expect(getGiftCardByCode('NOPE')).resolves.toBeUndefined();
  });

  /**
   * BUG: this wrapper indexes `data.gift_cards[0]` with no optional chaining, so
   * a response without the expected field throws `Cannot read properties of
   * undefined` instead of resolving undefined the way the caller's
   * `if (!giftCard)` branch expects. Sibling wrappers such as
   * getActiveProductById use `data?.products?.[0] || null`.
   *
   * Asserted in the safe direction and marked `.failing`; drop `.failing` once
   * the optional chaining is added.
   */
  it.failing('resolves undefined rather than throwing on a response with no gift_cards field', async () => {
    request.mockResolvedValue({});

    await expect(getGiftCardByCode('ABC-123')).resolves.toBeUndefined();
  });
});

describe('getSaleByStripeSessionId', () => {
  const SALE = { id: 'sale-1', stripeSessionId: 'cs_test_1', status: 'UNPAID' };

  it('unwraps the first sale for the session id', async () => {
    request.mockResolvedValue({ sales: [SALE] });

    await expect(getSaleByStripeSessionId('cs_test_1')).resolves.toBe(SALE);

    const [document, variables] = request.mock.calls[0];

    expect(variables).toEqual({ stripeSessionId: 'cs_test_1' });
    expect(document).not.toContain('cs_test_1');
  });

  it('selects the buyer and product the webhook needs to grant access', async () => {
    request.mockResolvedValue({ sales: [SALE] });

    await getSaleByStripeSessionId('cs_test_1');

    const [document] = request.mock.calls[0];

    // handleCompletedCheckout reads sale.payingUser.* and sale.product.* to work
    // out the new access window; losing them from the selection set would make
    // a paid checkout grant nothing.
    expect(document).toContain('payingUser');
    expect(document).toContain('product');
    expect(document).toContain('affiliateAmountEarned');
  });

  it('resolves undefined when the session has no sale row', async () => {
    request.mockResolvedValue({ sales: [] });

    await expect(getSaleByStripeSessionId('cs_unknown')).resolves.toBeUndefined();
  });

  it('resolves null when the response itself is null', async () => {
    request.mockResolvedValue(null);

    await expect(getSaleByStripeSessionId('cs_test_1')).resolves.toBeNull();
  });
});

describe('getUserByStripeCustomerId', () => {
  const USER = { id: 'user-1', stripeCustomerId: 'cus_123' };

  it('unwraps the first user for the Stripe customer id', async () => {
    request.mockResolvedValue({ users: [USER] });

    await expect(getUserByStripeCustomerId('cus_123')).resolves.toBe(USER);

    const [document, variables] = request.mock.calls[0];

    expect(variables).toEqual({ stripeCustomerId: 'cus_123' });
    expect(document).toMatch(/stripeCustomerId:\s*\{\s*_eq:\s*\$stripeCustomerId\s*\}/);
    expect(document).toContain('fullCourseAccessEndsAt');
  });

  it('resolves undefined for an unknown Stripe customer', async () => {
    request.mockResolvedValue({ users: [] });

    await expect(getUserByStripeCustomerId('cus_unknown')).resolves.toBeUndefined();
  });
});

describe('getLessonVideoIdById', () => {
  const buildReq = (query: Record<string, any>) => ({ query }) as unknown as NextApiRequest;

  it('returns null without querying when the request has no lesson id', async () => {
    await expect(getLessonVideoIdById(buildReq({}))).resolves.toBeNull();
    await expect(getLessonVideoIdById(buildReq({ id: '' }))).resolves.toBeNull();

    expect(request).not.toHaveBeenCalled();
  });

  it('unwraps lessons_by_pk and keeps the access level next to the solution url', async () => {
    const lesson = { id: 'lesson-1', accessLevel: 'PAID', solutionVideoUrl: 'https://video' };
    request.mockResolvedValue({ lessons_by_pk: lesson });

    await expect(getLessonVideoIdById(buildReq({ id: 'lesson-1' }))).resolves.toBe(lesson);

    const [document, variables] = request.mock.calls[0];

    expect(variables).toEqual({ id: 'lesson-1' });
    // The API route gates on lesson.accessLevel, so it has to come back with
    // the url it is guarding.
    expect(document).toContain('accessLevel');
    expect(document).toContain('solutionVideoUrl');
  });

  it('resolves null when the lesson id does not exist', async () => {
    request.mockResolvedValue({ lessons_by_pk: null });

    await expect(getLessonVideoIdById(buildReq({ id: 'missing' }))).resolves.toBeNull();
  });

  /**
   * BUG: Next.js gives `req.query.id` as an array for `?id=a&id=b`, and the raw
   * value is forwarded into a `uuid!` variable. Hasura rejects it, the route's
   * catch turns it into a 500, and Sentry collects noise for what is really a
   * 400. The value should be normalised/validated the way
   * pages/api/v1/lessons/[id]/submissions/code.ts does with getQueryStringValue.
   *
   * Passes once the wrapper either normalises the value to a single string or
   * bails out without querying; drop `.failing` then.
   */
  it.failing('never forwards a repeated ?id= query param to Hasura as an array', async () => {
    request.mockResolvedValue({ lessons_by_pk: null });

    await getLessonVideoIdById(buildReq({ id: ['lesson-1', 'lesson-2'] }));

    const sentId = request.mock.calls[0]?.[1]?.id;

    expect(Array.isArray(sentId)).toBe(false);
  });
});
