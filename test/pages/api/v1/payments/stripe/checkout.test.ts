/**
 * Tests for the Stripe checkout endpoint.
 *
 * The security property under test is that the endpoint accepts ONLY a product
 * id and re-derives everything that determines what is charged, recorded and
 * granted from the database + Stripe. A client that posts a cheaper
 * `stripePriceId`, a longer `productAccessDays` or a smaller `price` must have
 * every one of those values discarded.
 *
 * Everything that performs I/O (the Stripe SDK instance, every GraphQL
 * query/mutation module, the transactional email service and Sentry) is mocked
 * at the module boundary, so this suite runs entirely offline.
 */
import { createMocks } from 'node-mocks-http';

jest.mock('services/server/stripe/instance', () => ({
  __esModule: true,
  default: {
    products: { retrieve: jest.fn() },
    prices: { retrieve: jest.fn() },
    checkout: { sessions: { create: jest.fn() } },
  },
}));

jest.mock('services/server/graphql/queries/getViewerById', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('services/server/graphql/queries/getActiveProductById', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('services/server/graphql/queries/getAffiliateUserAndClick', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('services/server/graphql/mutations/insertUnpaidSale', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('services/server/graphql/mutations/insertUnpaidSaleWithGiftCard', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('services/server/graphql/mutations/updateStripeCustomerId', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('services/server/email/transactional', () => ({
  __esModule: true,
  sendTransactionalEmailFromTemplate: jest.fn(),
  TemplateTag: {
    AccountCreate: 'ACCOUNT_CREATE',
    FeedbackReceived: 'FEEDBACK_RECEIVED',
    CheckoutSessionCreated: 'CHECKOUT_SESSION_CREATED',
    CheckoutComplete: 'CHECKOUT_COMPLETE',
  },
}));

jest.mock('utils/shared/sentry', () => ({
  __esModule: true,
  default: {
    withScope: jest.fn((callback: (scope: unknown) => void) => callback({})),
    captureException: jest.fn(),
  },
  configureReq: jest.fn(),
}));

const ROOT_URL = 'https://test.skilled.dev';

// Real values the server must use, and the values an attacker posts instead.
const REAL_PRODUCT_ID = '11111111-1111-1111-1111-111111111111';
const REAL_STRIPE_PRODUCT_ID = 'prod_REAL';
const REAL_STRIPE_PRICE_ID = 'price_REAL_29900';
const REAL_PRICE_DOLLARS = 299;
const REAL_ACCESS_DAYS = 90;

const BOGUS_PRICE_ID = 'price_ATTACKER_ONE_CENT';
const BOGUS_PRODUCT_ID = 'prod_ATTACKER';
const BOGUS_ROW_ID = '99999999-9999-9999-9999-999999999999';
const BOGUS_ACCESS_DAYS = 36500;
const BOGUS_USER_ID = 'victim-user-id';
const BOGUS_CUSTOMER_ID = 'cus_ATTACKER';

const buildDbProduct = (overrides: Record<string, unknown> = {}) => ({
  id: REAL_PRODUCT_ID,
  type: 'FULL_COURSE',
  productAccessDays: REAL_ACCESS_DAYS,
  stripeProductId: REAL_STRIPE_PRODUCT_ID,
  stripePriceId: REAL_STRIPE_PRICE_ID,
  displayTitle: 'Skilled.dev Full Course',
  displayDescription: 'Everything in the course',
  displayLengthDescription: '90 days of access',
  status: 'ACTIVE',
  isAdditionalSupportPrice: false,
  associatedProduct: null,
  createdAt: '2021-01-01T00:00:00.000Z',
  updatedAt: '2021-01-01T00:00:00.000Z',
  ...overrides,
});

const buildStripeProduct = (overrides: Record<string, unknown> = {}) => ({
  id: REAL_STRIPE_PRODUCT_ID,
  name: 'Stripe Product Name',
  description: 'Stripe product description',
  ...overrides,
});

const buildStripePrice = (overrides: Record<string, unknown> = {}) => ({
  id: REAL_STRIPE_PRICE_ID,
  unit_amount: REAL_PRICE_DOLLARS * 100,
  ...overrides,
});

const buildViewer = (overrides: Record<string, unknown> = {}) => ({
  id: 'user-1',
  email: 'buyer@example.com',
  role: 'user',
  stripeCustomerId: null,
  fullCourseAccessEndsAt: null,
  fullCourseAccessLatestUpgradedAt: null,
  fullCourseAccessFirstUpgradedAt: null,
  ...overrides,
});

const buildSession = (overrides: Record<string, unknown> = {}) => ({
  id: 'cs_test_session_1',
  payment_status: 'unpaid',
  customer: 'cus_NEW',
  url: 'https://checkout.stripe.com/pay/cs_test_session_1',
  ...overrides,
});

/**
 * A request body that carries every field an attacker would want the server to
 * trust, alongside the one field it is actually allowed to read.
 */
const tamperedBody = (productId: unknown = REAL_PRODUCT_ID) => ({
  productId,
  id: BOGUS_ROW_ID,
  stripePriceId: BOGUS_PRICE_ID,
  stripeProductId: BOGUS_PRODUCT_ID,
  price: 0.01,
  productAccessDays: BOGUS_ACCESS_DAYS,
  type: 'FULL_COURSE',
  // Identity fields: the sale must be attributed to the session's viewer, never
  // to whatever user or Stripe customer the body names.
  payingUserId: BOGUS_USER_ID,
  userId: BOGUS_USER_ID,
  stripeCustomerId: BOGUS_CUSTOMER_ID,
  affiliateUserId: BOGUS_USER_ID,
  affiliateAmountEarned: 999999,
  product: {
    id: BOGUS_ROW_ID,
    stripePriceId: BOGUS_PRICE_ID,
    stripeProductId: BOGUS_PRODUCT_ID,
    price: 0.01,
    productAccessDays: BOGUS_ACCESS_DAYS,
  },
});

let handler: (req: any, res: any) => Promise<void>;
let stripe: any;
let getViewerById: jest.Mock;
let getActiveProductById: jest.Mock;
let getAffiliateUserAndClick: jest.Mock;
let insertUnpaidSale: jest.Mock;
let insertUnpaidSaleWithGiftCard: jest.Mock;
let updateStripeCustomerId: jest.Mock;
let sendTransactionalEmailFromTemplate: jest.Mock;
let Sentry: any;

const CHECKOUT_ORIGINAL_ENV = { ...process.env };

beforeAll(() => {
  // `utils/constants/payments` reads ROOT_URL at module-eval time, so the env has
  // to be in place before the handler is required.
  process.env.ROOT_URL = ROOT_URL;
  process.env.INTERNAL_NOTIFICATION_EMAIL = 'ops@skilled.dev';
  process.env.STRIPE_SECRET_KEY = 'sk_test_not_real';
  process.env.GRAPHQL_URL = 'https://graphql.invalid/v1/graphql';

  handler = require('pages/api/v1/payments/stripe/checkout').default;
  stripe = require('services/server/stripe/instance').default;
  getViewerById = require('services/server/graphql/queries/getViewerById').default;
  getActiveProductById = require('services/server/graphql/queries/getActiveProductById').default;
  getAffiliateUserAndClick =
    require('services/server/graphql/queries/getAffiliateUserAndClick').default;
  insertUnpaidSale = require('services/server/graphql/mutations/insertUnpaidSale').default;
  insertUnpaidSaleWithGiftCard =
    require('services/server/graphql/mutations/insertUnpaidSaleWithGiftCard').default;
  updateStripeCustomerId =
    require('services/server/graphql/mutations/updateStripeCustomerId').default;
  sendTransactionalEmailFromTemplate =
    require('services/server/email/transactional').sendTransactionalEmailFromTemplate;
  Sentry = require('utils/shared/sentry').default;
});

afterAll(() => {
  process.env = CHECKOUT_ORIGINAL_ENV;
});

beforeEach(() => {
  jest.clearAllMocks();

  getViewerById.mockResolvedValue(buildViewer());
  getActiveProductById.mockResolvedValue(buildDbProduct());
  stripe.products.retrieve.mockResolvedValue(buildStripeProduct());
  stripe.prices.retrieve.mockResolvedValue(buildStripePrice());
  stripe.checkout.sessions.create.mockResolvedValue(buildSession());
  insertUnpaidSale.mockResolvedValue({});
  insertUnpaidSaleWithGiftCard.mockResolvedValue({});
  updateStripeCustomerId.mockResolvedValue({});
  getAffiliateUserAndClick.mockResolvedValue({ users: [], affiliate_link_clicks_by_pk: null });
  sendTransactionalEmailFromTemplate.mockResolvedValue(undefined);
});

const call = async (options: Record<string, unknown>) => {
  const { req, res } = createMocks<any, any>({ method: 'POST', ...options });
  await handler(req, res);
  return res;
};

/** Everything the handler sent outward, so leaked client values are detectable. */
const outboundPayloads = () =>
  JSON.stringify({
    sessionCreate: stripe.checkout.sessions.create.mock.calls,
    priceRetrieve: stripe.prices.retrieve.mock.calls,
    productRetrieve: stripe.products.retrieve.mock.calls,
    productLookup: getActiveProductById.mock.calls,
    saleInsert: insertUnpaidSale.mock.calls,
    giftCardInsert: insertUnpaidSaleWithGiftCard.mock.calls,
    customerIdWrite: updateStripeCustomerId.mock.calls,
    affiliateLookup: getAffiliateUserAndClick.mock.calls,
  });

describe('POST /api/v1/payments/stripe/checkout', () => {
  describe('authentication', () => {
    it('rejects an unauthenticated caller with 401 and never talks to Stripe', async () => {
      getViewerById.mockResolvedValue(null);

      const res = await call({ body: { productId: REAL_PRODUCT_ID } });

      expect(res._getStatusCode()).toBe(401);
      expect(res._getData()).toEqual({
        message: 'Could not find valid user from session',
        statusCode: 401,
      });
      expect(getActiveProductById).not.toHaveBeenCalled();
      expect(stripe.checkout.sessions.create).not.toHaveBeenCalled();
      expect(insertUnpaidSale).not.toHaveBeenCalled();
    });
  });

  describe('product id validation', () => {
    it.each([
      ['missing body field', {}],
      ['empty string', { productId: '' }],
      ['number', { productId: 12345 }],
      ['object', { productId: { id: REAL_PRODUCT_ID } }],
      ['array', { productId: [REAL_PRODUCT_ID] }],
      ['boolean', { productId: true }],
      ['null with no legacy product', { productId: null }],
      ['legacy product with a non-string id', { product: { id: 42 } }],
    ])('rejects a %s product id with 400 before any lookup', async (_label, body) => {
      const res = await call({ body });

      expect(res._getStatusCode()).toBe(400);
      expect(res._getData()).toEqual({
        message: 'Did not receive a valid product',
        statusCode: 400,
      });
      expect(getActiveProductById).not.toHaveBeenCalled();
      expect(stripe.checkout.sessions.create).not.toHaveBeenCalled();
    });

    it('rejects an id that does not resolve to an ACTIVE product without creating a session', async () => {
      getActiveProductById.mockResolvedValue(null);

      const res = await call({ body: { productId: 'retired-or-unknown-product' } });

      expect(res._getStatusCode()).toBe(400);
      expect(getActiveProductById).toHaveBeenCalledWith('retired-or-unknown-product');
      expect(stripe.prices.retrieve).not.toHaveBeenCalled();
      expect(stripe.products.retrieve).not.toHaveBeenCalled();
      expect(stripe.checkout.sessions.create).not.toHaveBeenCalled();
      expect(insertUnpaidSale).not.toHaveBeenCalled();
      expect(insertUnpaidSaleWithGiftCard).not.toHaveBeenCalled();
    });
  });

  describe('price tampering (regression guard)', () => {
    it('charges the resolved price id and ignores every price field in the request body', async () => {
      const res = await call({ body: tamperedBody() });

      expect(res._getStatusCode()).toBe(200);

      // The Stripe objects fetched are the ones named by the DB row.
      expect(stripe.products.retrieve).toHaveBeenCalledWith(REAL_STRIPE_PRODUCT_ID);
      expect(stripe.prices.retrieve).toHaveBeenCalledWith(REAL_STRIPE_PRICE_ID);

      const sessionArgs = stripe.checkout.sessions.create.mock.calls[0][0];
      expect(sessionArgs.line_items).toEqual([{ quantity: 1, price: REAL_STRIPE_PRICE_ID }]);
      expect(sessionArgs.mode).toBe('payment');
      expect(sessionArgs.success_url).toBe(`${ROOT_URL}/course?subscribed=true`);

      const saleArgs = insertUnpaidSale.mock.calls[0][0];
      expect(saleArgs.stripePriceId).toBe(REAL_STRIPE_PRICE_ID);
      expect(saleArgs.stripeProductId).toBe(REAL_STRIPE_PRODUCT_ID);
      expect(saleArgs.originalPrice).toBe(REAL_PRICE_DOLLARS);
      expect(saleArgs.purchasedProductId).toBe(REAL_PRODUCT_ID);
      expect(saleArgs.payingUserId).toBe('user-1');

      // Nothing the client sent reached Stripe or the database.
      const payloads = outboundPayloads();
      expect(payloads).not.toContain(BOGUS_PRICE_ID);
      expect(payloads).not.toContain(BOGUS_PRODUCT_ID);
      expect(payloads).not.toContain(BOGUS_ROW_ID);
      expect(payloads).not.toContain(String(BOGUS_ACCESS_DAYS));
      expect(payloads).not.toContain('0.01');
      expect(payloads).not.toContain(BOGUS_USER_ID);
      expect(payloads).not.toContain(BOGUS_CUSTOMER_ID);
      expect(payloads).not.toContain('999999');
    });

    it('attributes the sale to the session viewer, not to ids named in the body', async () => {
      // Mass assignment: `insertUnpaidSale` is called with an object literal, so a
      // body field must never be able to reassign who is buying, who is credited
      // or which Stripe customer is charged.
      await call({ body: tamperedBody() });

      const saleArgs = insertUnpaidSale.mock.calls[0][0];
      expect(saleArgs.payingUserId).toBe('user-1');
      expect(saleArgs.stripeCustomerId).toBe('cus_NEW');
      expect(saleArgs.affiliateUserId).toBeUndefined();
      expect(saleArgs.affiliateAmountEarned).toBeUndefined();
      expect(Object.keys(saleArgs)).not.toContain('userId');
      expect(updateStripeCustomerId).toHaveBeenCalledWith({
        id: 'user-1',
        stripeCustomerId: 'cus_NEW',
      });
    });

    it('reads only the id out of a legacy full-product body', async () => {
      const res = await call({
        body: {
          product: {
            id: REAL_PRODUCT_ID,
            stripePriceId: BOGUS_PRICE_ID,
            price: 0.01,
            productAccessDays: BOGUS_ACCESS_DAYS,
          },
        },
      });

      expect(res._getStatusCode()).toBe(200);
      expect(getActiveProductById).toHaveBeenCalledWith(REAL_PRODUCT_ID);
      expect(stripe.checkout.sessions.create.mock.calls[0][0].line_items).toEqual([
        { quantity: 1, price: REAL_STRIPE_PRICE_ID },
      ]);
      expect(outboundPayloads()).not.toContain(BOGUS_PRICE_ID);
    });

    it('sends session metadata rebuilt from the database, not from the request', async () => {
      await call({ body: tamperedBody() });

      const { metadata } = stripe.checkout.sessions.create.mock.calls[0][0];

      expect(metadata).toEqual({
        id: REAL_PRODUCT_ID,
        associatedProductId: null,
        type: 'FULL_COURSE',
        productType: null,
        productAccessDays: REAL_ACCESS_DAYS,
        stripeProductId: REAL_STRIPE_PRODUCT_ID,
        stripePriceId: REAL_STRIPE_PRICE_ID,
        name: 'Skilled.dev Full Course',
        price: REAL_PRICE_DOLLARS,
        planDescription: 'Everything in the course',
        lengthDescription: '90 days of access',
        isAdditionalSupportPrice: 'false',
      });
    });

    it('aborts with 500 when the DB row and the Stripe price disagree', async () => {
      // Someone repointed the price in Stripe (or the DB) without the other side
      // following: buildDisplayProduct must refuse to build a chargeable product.
      stripe.prices.retrieve.mockResolvedValue(buildStripePrice({ id: 'price_SOMETHING_ELSE' }));

      const res = await call({ body: { productId: REAL_PRODUCT_ID } });

      expect(res._getStatusCode()).toBe(500);
      expect(stripe.checkout.sessions.create).not.toHaveBeenCalled();
      expect(insertUnpaidSale).not.toHaveBeenCalled();
      expect(Sentry.captureException).toHaveBeenCalled();
    });

    it('aborts with 500 when the DB row and the Stripe product disagree', async () => {
      stripe.products.retrieve.mockResolvedValue(buildStripeProduct({ id: 'prod_SOMETHING_ELSE' }));

      const res = await call({ body: { productId: REAL_PRODUCT_ID } });

      expect(res._getStatusCode()).toBe(500);
      expect(stripe.checkout.sessions.create).not.toHaveBeenCalled();
      expect(insertUnpaidSale).not.toHaveBeenCalled();
    });
  });

  describe('stripe customer handling', () => {
    it('reuses an existing stripe customer and does not re-write the customer id', async () => {
      getViewerById.mockResolvedValue(buildViewer({ stripeCustomerId: 'cus_EXISTING' }));

      await call({ body: { productId: REAL_PRODUCT_ID } });

      const sessionArgs = stripe.checkout.sessions.create.mock.calls[0][0];
      expect(sessionArgs.customer).toBe('cus_EXISTING');
      expect(sessionArgs.customer_email).toBeUndefined();
      expect(updateStripeCustomerId).not.toHaveBeenCalled();
      expect(insertUnpaidSale.mock.calls[0][0].stripeCustomerId).toBe('cus_EXISTING');
    });

    it('passes the viewer email for a new customer and persists the id Stripe returns', async () => {
      await call({ body: { productId: REAL_PRODUCT_ID } });

      const sessionArgs = stripe.checkout.sessions.create.mock.calls[0][0];
      expect(sessionArgs.customer_email).toBe('buyer@example.com');
      expect(sessionArgs.customer).toBeUndefined();
      expect(updateStripeCustomerId).toHaveBeenCalledWith({
        id: 'user-1',
        stripeCustomerId: 'cus_NEW',
      });
    });

    it('unwraps an expanded customer object rather than storing "[object Object]"', async () => {
      stripe.checkout.sessions.create.mockResolvedValue(
        buildSession({ customer: { id: 'cus_EXPANDED', object: 'customer' } }),
      );

      await call({ body: { productId: REAL_PRODUCT_ID } });

      expect(updateStripeCustomerId).toHaveBeenCalledWith({
        id: 'user-1',
        stripeCustomerId: 'cus_EXPANDED',
      });
      expect(insertUnpaidSale.mock.calls[0][0].stripeCustomerId).toBe('cus_EXPANDED');
    });

    it('still records the sale when persisting the customer id fails', async () => {
      updateStripeCustomerId.mockRejectedValue(new Error('hasura down'));

      const res = await call({ body: { productId: REAL_PRODUCT_ID } });

      expect(res._getStatusCode()).toBe(200);
      expect(Sentry.captureException).toHaveBeenCalled();
      expect(insertUnpaidSale).toHaveBeenCalledTimes(1);
      expect(insertUnpaidSale.mock.calls[0][0].stripeCustomerId).toBe('cus_NEW');
    });
  });

  describe('affiliate attribution', () => {
    const affiliateCookies = {
      'skilled-friend': 'affiliate-code',
      'skilled-ref-id': '22222222-2222-2222-2222-222222222222',
    };

    it('computes the affiliate payout from the resolved price, not the posted one', async () => {
      getAffiliateUserAndClick.mockResolvedValue({
        users: [{ id: 'affiliate-user', affiliateId: 'affiliate-code', affiliateRevenueShare: 0.5 }],
        affiliate_link_clicks_by_pk: { id: affiliateCookies['skilled-ref-id'] },
      });

      await call({ body: tamperedBody(), cookies: affiliateCookies });

      expect(getAffiliateUserAndClick).toHaveBeenCalledWith({
        affiliateId: 'affiliate-code',
        clickId: affiliateCookies['skilled-ref-id'],
      });

      const saleArgs = insertUnpaidSale.mock.calls[0][0];
      expect(saleArgs.affiliateUserId).toBe('affiliate-user');
      expect(saleArgs.affiliateLinkClickId).toBe(affiliateCookies['skilled-ref-id']);
      expect(saleArgs.affiliatePayoutStatus).toBe('UNPAID');
      // (299 - 299 * 0.029 - 0.30) * 0.5
      expect(saleArgs.affiliateAmountEarned).toBeCloseTo(145.0145, 4);
    });

    it('completes the purchase without attribution when the click id is unknown', async () => {
      getAffiliateUserAndClick.mockResolvedValue({
        users: [{ id: 'affiliate-user', affiliateRevenueShare: 0.5 }],
        affiliate_link_clicks_by_pk: null,
      });

      const res = await call({ body: { productId: REAL_PRODUCT_ID }, cookies: affiliateCookies });

      expect(res._getStatusCode()).toBe(200);
      const saleArgs = insertUnpaidSale.mock.calls[0][0];
      expect(saleArgs.affiliateUserId).toBeUndefined();
      expect(saleArgs.affiliateAmountEarned).toBeUndefined();
      expect(Sentry.captureException).toHaveBeenCalled();
    });

    it('completes the purchase when the affiliate lookup itself fails', async () => {
      getAffiliateUserAndClick.mockRejectedValue(new Error('hasura down'));

      const res = await call({ body: { productId: REAL_PRODUCT_ID }, cookies: affiliateCookies });

      expect(res._getStatusCode()).toBe(200);
      expect(insertUnpaidSale).toHaveBeenCalledTimes(1);
      expect(insertUnpaidSale.mock.calls[0][0].affiliateUserId).toBeUndefined();
    });

    it('skips the affiliate lookup entirely when only one of the two cookies is present', async () => {
      await call({
        body: { productId: REAL_PRODUCT_ID },
        cookies: { 'skilled-friend': 'affiliate-code' },
      });

      expect(getAffiliateUserAndClick).not.toHaveBeenCalled();
      expect(insertUnpaidSale.mock.calls[0][0].affiliateUserId).toBeUndefined();
    });
  });

  describe('sale records', () => {
    it('writes a gift card sale with the access days from the database', async () => {
      getActiveProductById.mockResolvedValue(
        buildDbProduct({
          type: 'GIFT_CARD',
          associatedProduct: { id: 'assoc-product', type: 'FULL_COURSE' },
        }),
      );

      const res = await call({ body: tamperedBody() });

      expect(res._getStatusCode()).toBe(200);
      expect(insertUnpaidSale).not.toHaveBeenCalled();

      const giftArgs = insertUnpaidSaleWithGiftCard.mock.calls[0][0];
      expect(giftArgs.saleType).toBe('GIFT_CARD');
      expect(giftArgs.giftCardStatus).toBe('UNPAID');
      expect(giftArgs.giftCardSource).toBe('SALE');
      expect(giftArgs.giftCardType).toBe('FULL_COURSE');
      expect(giftArgs.productAccessDays).toBe(REAL_ACCESS_DAYS);
      expect(giftArgs.originalPrice).toBe(REAL_PRICE_DOLLARS);
      expect(giftArgs.senderEmail).toBe('buyer@example.com');
      expect(giftArgs.purchasedProductId).toBe(REAL_PRODUCT_ID);
      expect(stripe.checkout.sessions.create.mock.calls[0][0].success_url).toBe(
        `${ROOT_URL}/my/settings`,
      );

      // The original flaw let a buyer pay the cheapest real price while minting a
      // gift card carrying arbitrary access days, so this path gets the same
      // leak check as the course path.
      const payloads = outboundPayloads();
      expect(payloads).not.toContain(String(BOGUS_ACCESS_DAYS));
      expect(payloads).not.toContain(BOGUS_PRICE_ID);
      expect(payloads).not.toContain(BOGUS_ROW_ID);
    });

    // KNOWN BUG, written as the behaviour we want rather than the behaviour we
    // have: a product whose `type` is neither FULL_COURSE nor GIFT_CARD (e.g. the
    // CART member of SaleType) still gets a payable Stripe checkout session, but no
    // sale row is written. The customer can be charged while the webhook fails with
    // "Could not find sale that matched session" forever, so nothing is ever
    // granted. `it.failing` passes only while the bug is present; when the handler
    // learns to reject unsupported types this test reports "failing test passed"
    // and the `.failing` marker should be deleted, rather than the fix being
    // reverted to keep a green suite.
    it.failing('refuses to create a payable session for an unsupported product type', async () => {
      getActiveProductById.mockResolvedValue(buildDbProduct({ type: 'CART' }));

      const res = await call({ body: { productId: REAL_PRODUCT_ID } });

      expect(res._getStatusCode()).toBe(400);
      expect(stripe.checkout.sessions.create).not.toHaveBeenCalled();
      expect(insertUnpaidSale).not.toHaveBeenCalled();
      expect(insertUnpaidSaleWithGiftCard).not.toHaveBeenCalled();
    });

    it('returns the session and notifies internally on success', async () => {
      const res = await call({ body: { productId: REAL_PRODUCT_ID } });

      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toMatchObject({ id: 'cs_test_session_1' });
      expect(sendTransactionalEmailFromTemplate).toHaveBeenCalledWith(
        'ops@skilled.dev',
        'CHECKOUT_SESSION_CREATED',
        expect.objectContaining({ userId: 'user-1', price: REAL_PRICE_DOLLARS }),
      );
    });
  });

  describe('failures', () => {
    it('returns 500 without recording a sale when Stripe rejects the session', async () => {
      stripe.checkout.sessions.create.mockRejectedValue(new Error('stripe exploded'));

      const res = await call({ body: { productId: REAL_PRODUCT_ID } });

      expect(res._getStatusCode()).toBe(500);
      expect(res._getData()).toEqual({
        message: 'There was an error communicating with Stripe',
        statusCode: 500,
      });
      expect(insertUnpaidSale).not.toHaveBeenCalled();
      expect(Sentry.captureException).toHaveBeenCalled();
    });

    it('does not leak the underlying error message to the caller', async () => {
      stripe.checkout.sessions.create.mockRejectedValue(
        new Error('Invalid API Key provided: sk_live_supersecret'),
      );

      const res = await call({ body: { productId: REAL_PRODUCT_ID } });

      // Pinned status + exact message first: without these the "does not contain
      // the secret" assertion would also pass on any early rejection that never
      // reached Stripe at all.
      expect(res._getStatusCode()).toBe(500);
      expect(res._getData()).toEqual({
        message: 'There was an error communicating with Stripe',
        statusCode: 500,
      });
      expect(JSON.stringify(res._getData())).not.toContain('sk_live_supersecret');
      expect(JSON.stringify(res._getData())).not.toContain('Invalid API Key');
    });

    it('returns 500 when the sale insert fails after the session was created', async () => {
      insertUnpaidSale.mockRejectedValue(new Error('constraint violation'));

      const res = await call({ body: { productId: REAL_PRODUCT_ID } });

      expect(res._getStatusCode()).toBe(500);
    });
  });

  describe('method handling', () => {
    it.each(['GET', 'PUT', 'DELETE', 'PATCH'])('rejects %s with 405 and an Allow header', async (method) => {
      const res = await call({ method, body: { productId: REAL_PRODUCT_ID } });

      expect(res._getStatusCode()).toBe(405);
      expect(res.getHeader('Allow')).toEqual(['POST']);
      expect(res._getData()).toBe(`Method ${method} Not Allowed`);
      expect(getViewerById).not.toHaveBeenCalled();
      expect(stripe.checkout.sessions.create).not.toHaveBeenCalled();
    });

    it('applies security headers even on a rejected method', async () => {
      const res = await call({ method: 'GET' });

      expect(res.getHeader('X-Frame-Options')).toBe('DENY');
      expect(res.getHeader('X-Content-Type-Options')).toBe('nosniff');
    });
  });
});
