/**
 * Tests for the code that turns a verified `checkout.session.completed` event
 * into a paid entitlement.
 *
 * Everything here runs *after* signature verification, so the adversarial input
 * is a well-formed event that does not correspond to a real, paid sale. The
 * guarantees worth pinning down are: no sale row -> no grant, the granted access
 * window and recorded amount come from the database/session rather than from any
 * client-supplied value, and a failure in the "nice to have" side effects (email,
 * mailing list) never blocks or silently skips the grant.
 */

jest.mock('services/server/stripe/instance', () => ({
  __esModule: true,
  default: {
    products: { retrieve: jest.fn() },
  },
}));

jest.mock('services/server/graphql/queries/getSaleByStripeSessionId', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('services/server/graphql/mutations/updateCompletedSaleCourse', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('services/server/graphql/mutations/updateCompletedSaleGiftCard', () => ({
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

jest.mock('services/server/email/contacts', () => ({
  __esModule: true,
  subscribeToList: jest.fn(),
  ListTag: {
    AllUsers: 'ALL_USERS',
    RegisteredUsers: 'REGISTERED_USERS',
    PayingUsers: 'PAYING_USERS',
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

const DAY_MS = 24 * 60 * 60 * 1000;
const LIFETIME_DAYS = 365 * 100;
const NOW = new Date('2024-03-01T12:00:00.000Z');

const buildPayingUser = (overrides: Record<string, unknown> = {}) => ({
  id: 'user-1',
  email: 'buyer@example.com',
  stripeCustomerId: 'cus_SALE',
  fullCourseAccessEndsAt: null,
  fullCourseAccessFirstUpgradedAt: null,
  fullCourseAccessLatestUpgradedAt: null,
  fullCourseAccessTerminatedAt: null,
  ...overrides,
});

const buildProduct = (overrides: Record<string, unknown> = {}) => ({
  id: 'product-1',
  type: 'FULL_COURSE',
  status: 'ACTIVE',
  stripeProductId: 'prod_REAL',
  stripePriceId: 'price_REAL',
  productAccessDays: 90,
  displayTitle: 'Skilled.dev Full Course',
  displayDescription: 'Everything in the course',
  displayLengthDescription: '90 days of access',
  associatedProductId: null,
  ...overrides,
});

const buildSale = (overrides: Record<string, unknown> = {}) => ({
  id: 'sale-1',
  type: 'FULL_COURSE',
  status: 'UNPAID',
  stripeCustomerEmail: 'sale-stored@example.com',
  stripeCustomerId: 'cus_SALE',
  stripePaymentStatus: 'unpaid',
  stripePriceId: 'price_REAL',
  stripeProductId: 'prod_REAL',
  stripeSessionId: 'cs_test_1',
  affiliateAmountEarned: null,
  payingUser: buildPayingUser(),
  product: buildProduct(),
  affiliateUser: null,
  ...overrides,
});

const buildEvent = (sessionOverrides: Record<string, unknown> = {}) =>
  ({
    id: 'evt_1',
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test_1',
        object: 'checkout.session',
        amount_total: 29900,
        payment_status: 'paid',
        customer: 'cus_SESSION',
        customer_email: 'session@example.com',
        ...sessionOverrides,
      },
    },
  } as any);

let handleCompletedCheckout: (event: any) => Promise<void>;
let stripe: any;
let getSaleByStripeSessionId: jest.Mock;
let updateCompletedSaleCourse: jest.Mock;
let updateCompletedSaleGiftCard: jest.Mock;
let sendTransactionalEmailFromTemplate: jest.Mock;
let subscribeToList: jest.Mock;
let Sentry: any;

const COMPLETED_CHECKOUT_ORIGINAL_ENV = { ...process.env };

beforeAll(() => {
  process.env.ROOT_URL = 'https://test.skilled.dev';
  process.env.INTERNAL_NOTIFICATION_EMAIL = 'ops@skilled.dev';
  process.env.STRIPE_SECRET_KEY = 'sk_test_not_real';

  handleCompletedCheckout = require('../handleCompletedCheckout').default;
  stripe = require('services/server/stripe/instance').default;
  getSaleByStripeSessionId =
    require('services/server/graphql/queries/getSaleByStripeSessionId').default;
  updateCompletedSaleCourse =
    require('services/server/graphql/mutations/updateCompletedSaleCourse').default;
  updateCompletedSaleGiftCard =
    require('services/server/graphql/mutations/updateCompletedSaleGiftCard').default;
  sendTransactionalEmailFromTemplate =
    require('services/server/email/transactional').sendTransactionalEmailFromTemplate;
  subscribeToList = require('services/server/email/contacts').subscribeToList;
  Sentry = require('utils/shared/sentry').default;
});

afterAll(() => {
  process.env = COMPLETED_CHECKOUT_ORIGINAL_ENV;
  jest.useRealTimers();
});

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers().setSystemTime(NOW);

  getSaleByStripeSessionId.mockResolvedValue(buildSale());
  stripe.products.retrieve.mockResolvedValue({
    id: 'prod_REAL',
    name: 'Stripe Product Name',
    description: 'Stripe product description',
  });
  updateCompletedSaleCourse.mockResolvedValue({});
  updateCompletedSaleGiftCard.mockResolvedValue({});
  sendTransactionalEmailFromTemplate.mockResolvedValue(undefined);
  subscribeToList.mockResolvedValue(undefined);
});

describe('handleCompletedCheckout', () => {
  describe('event to sale binding', () => {
    it('refuses to grant anything when no sale matches the session id', async () => {
      getSaleByStripeSessionId.mockResolvedValue(undefined);

      await expect(handleCompletedCheckout(buildEvent({ id: 'cs_UNKNOWN' }))).rejects.toThrow(
        'Could not find sale that matched session',
      );

      expect(getSaleByStripeSessionId).toHaveBeenCalledWith('cs_UNKNOWN');
      expect(updateCompletedSaleCourse).not.toHaveBeenCalled();
      expect(updateCompletedSaleGiftCard).not.toHaveBeenCalled();
      expect(subscribeToList).not.toHaveBeenCalled();
    });

    it('throws when the event carries no session object', async () => {
      const event = { id: 'evt_1', type: 'checkout.session.completed', data: { object: null } };

      await expect(handleCompletedCheckout(event as any)).rejects.toThrow(
        'Not a valid checkout session',
      );
      expect(getSaleByStripeSessionId).not.toHaveBeenCalled();
    });

    it('refuses to grant for a sale type it does not understand', async () => {
      getSaleByStripeSessionId.mockResolvedValue(buildSale({ type: 'CART' }));

      await expect(handleCompletedCheckout(buildEvent())).rejects.toThrow(
        'Type of sale not matched',
      );
      expect(updateCompletedSaleCourse).not.toHaveBeenCalled();
      expect(updateCompletedSaleGiftCard).not.toHaveBeenCalled();
    });

    it('refuses to grant course access when the sale has no linked product', async () => {
      getSaleByStripeSessionId.mockResolvedValue(buildSale({ product: null }));

      await expect(handleCompletedCheckout(buildEvent())).rejects.toThrow(
        'Could not find matching product',
      );
      expect(updateCompletedSaleCourse).not.toHaveBeenCalled();
    });
  });

  describe('course entitlement', () => {
    it('grants access from the product record and marks the sale paid', async () => {
      await handleCompletedCheckout(buildEvent());

      expect(stripe.products.retrieve).toHaveBeenCalledWith('prod_REAL');
      expect(updateCompletedSaleCourse).toHaveBeenCalledTimes(1);

      const args = updateCompletedSaleCourse.mock.calls[0][0];
      expect(args.saleId).toBe('sale-1');
      expect(args.userId).toBe('user-1');
      expect(args.saleStatus).toBe('PAID');
      expect(args.upgradeType).toBe('UPGRADE');
      expect(args.productType).toBe('FULL_COURSE');
      expect(args.productName).toBe('Skilled.dev Full Course');
      expect(args.productDescription).toBe('90 days of access');
      expect(args.productAccessDays).toBe(90);
      expect(args.upgradeDetailsObject).toEqual(buildProduct());
      // IS_LIFETIME_ACCESS is on, so the window is 100 years rather than the
      // product's own 90 days.
      expect(args.fullCourseAccessEndsAt).toBe(
        new Date(NOW.getTime() + LIFETIME_DAYS * DAY_MS).toISOString(),
      );
      expect(args.fullCourseAccessFirstUpgradedAt).toBe(NOW.toISOString());
      expect(args.fullCourseAccessLatestUpgradedAt).toBe(NOW.toISOString());
    });

    it('extends from the existing end date instead of resetting it', async () => {
      const existingEndsAt = '2025-01-01T00:00:00.000Z';
      getSaleByStripeSessionId.mockResolvedValue(
        buildSale({
          payingUser: buildPayingUser({
            fullCourseAccessEndsAt: existingEndsAt,
            fullCourseAccessFirstUpgradedAt: '2023-06-01T00:00:00.000Z',
          }),
        }),
      );

      await handleCompletedCheckout(buildEvent());

      const args = updateCompletedSaleCourse.mock.calls[0][0];
      expect(args.fullCourseAccessEndsAt).toBe(
        new Date(new Date(existingEndsAt).getTime() + LIFETIME_DAYS * DAY_MS).toISOString(),
      );
      // The first upgrade timestamp is preserved once it exists.
      expect(args.fullCourseAccessFirstUpgradedAt).toBe('2023-06-01T00:00:00.000Z');
      expect(args.fullCourseAccessLatestUpgradedAt).toBe(NOW.toISOString());
    });

    it('falls back to the Stripe product name and description when the DB has none', async () => {
      getSaleByStripeSessionId.mockResolvedValue(
        buildSale({
          product: buildProduct({ displayTitle: null, displayLengthDescription: null }),
        }),
      );

      await handleCompletedCheckout(buildEvent());

      const args = updateCompletedSaleCourse.mock.calls[0][0];
      expect(args.productName).toBe('Stripe Product Name');
      expect(args.productDescription).toBe('Stripe product description');
    });

    it('records the amount actually paid, converted from cents', async () => {
      await handleCompletedCheckout(buildEvent({ amount_total: 14900 }));

      expect(updateCompletedSaleCourse.mock.calls[0][0].amountPaid).toBe(149);
    });

    it('records 0 rather than NaN when the session has no total', async () => {
      await handleCompletedCheckout(buildEvent({ amount_total: null }));

      expect(updateCompletedSaleCourse.mock.calls[0][0].amountPaid).toBe(0);
    });

    it('prefers the session customer/email and falls back to the stored sale values', async () => {
      await handleCompletedCheckout(buildEvent());

      let args = updateCompletedSaleCourse.mock.calls[0][0];
      expect(args.stripeCustomerId).toBe('cus_SESSION');
      expect(args.stripeCustomerEmail).toBe('session@example.com');

      jest.clearAllMocks();
      getSaleByStripeSessionId.mockResolvedValue(buildSale());
      stripe.products.retrieve.mockResolvedValue({ id: 'prod_REAL', name: 'n', description: 'd' });

      await handleCompletedCheckout(buildEvent({ customer: null, customer_email: null }));

      args = updateCompletedSaleCourse.mock.calls[0][0];
      expect(args.stripeCustomerId).toBe('cus_SALE');
      expect(args.stripeCustomerEmail).toBe('sale-stored@example.com');
    });

    it('ignores product fields echoed back in the session metadata', async () => {
      // Checkout writes the resolved product into `session.metadata`, so the
      // metadata is the one place on a verified event that still carries the shape
      // of the old, client-trusted product object. The grant must come from the
      // sale's own product row, not from metadata that a future (or restored)
      // client-controlled path could poison.
      await handleCompletedCheckout(
        buildEvent({
          metadata: {
            id: 'product-ATTACKER',
            type: 'FULL_COURSE',
            productAccessDays: '36500',
            price: '0.01',
            stripePriceId: 'price_ATTACKER',
            name: 'Attacker Product',
          },
        }),
      );

      const args = updateCompletedSaleCourse.mock.calls[0][0];
      expect(args.userId).toBe('user-1');
      expect(args.productAccessDays).toBe(90);
      expect(args.productName).toBe('Skilled.dev Full Course');
      expect(args.amountPaid).toBe(299);
      expect(stripe.products.retrieve).toHaveBeenCalledWith('prod_REAL');
      // `transactionObject` intentionally stores the whole event, so only the
      // fields that drive the grant are checked for contamination.
      const grantFields = JSON.stringify({ ...args, transactionObject: undefined });
      expect(grantFields).not.toContain('product-ATTACKER');
      expect(grantFields).not.toContain('price_ATTACKER');
      expect(grantFields).not.toContain('36500');
    });

    // KNOWN BUG, written as the behaviour we want rather than the behaviour we
    // have: `session.payment_status` is stored but never checked, so a
    // `checkout.session.completed` that arrives with `payment_status: 'unpaid'`
    // (delayed-notification payment methods) still grants full course access.
    // `it.failing` passes only while the bug is present -- once the handler starts
    // requiring 'paid'/'no_payment_required' this reports "failing test passed" and
    // the `.failing` marker should be removed, rather than the fix reverted.
    it.failing('does not grant access when the session reports payment_status "unpaid"', async () => {
      await handleCompletedCheckout(buildEvent({ payment_status: 'unpaid', amount_total: 0 }));

      expect(updateCompletedSaleCourse).not.toHaveBeenCalled();
    });

    // KNOWN BUG (same convention as above): there is no idempotency guard. Stripe
    // explicitly delivers webhook events more than once, and this route returns 500
    // (triggering a retry) on any downstream failure. Replaying the same event for a
    // sale that is already PAID re-runs the grant and stacks another access window
    // onto the user's current end date.
    it.failing('does not re-grant access for a sale that is already marked PAID', async () => {
      const alreadyPaidEndsAt = '2124-03-01T12:00:00.000Z';
      getSaleByStripeSessionId.mockResolvedValue(
        buildSale({
          status: 'PAID',
          payingUser: buildPayingUser({ fullCourseAccessEndsAt: alreadyPaidEndsAt }),
        }),
      );

      await handleCompletedCheckout(buildEvent());

      expect(updateCompletedSaleCourse).not.toHaveBeenCalled();
    });
  });

  describe('affiliate payout', () => {
    it('recomputes the payout from the amount actually paid, not the amount quoted', async () => {
      getSaleByStripeSessionId.mockResolvedValue(
        buildSale({
          affiliateAmountEarned: 145.0145,
          affiliateUser: { id: 'affiliate-1', affiliateRevenueShare: 0.5 },
        }),
      );

      // Buyer used a promo code: $299 quoted, $199 actually charged.
      await handleCompletedCheckout(buildEvent({ amount_total: 19900 }));

      // (199 - 199 * 0.029 - 0.30) * 0.5
      expect(updateCompletedSaleCourse.mock.calls[0][0].affiliateAmountEarned).toBeCloseTo(
        96.4645,
        4,
      );
    });

    it('keeps the stored payout when the sale has no affiliate user', async () => {
      getSaleByStripeSessionId.mockResolvedValue(buildSale({ affiliateAmountEarned: 12.34 }));

      await handleCompletedCheckout(buildEvent());

      expect(updateCompletedSaleCourse.mock.calls[0][0].affiliateAmountEarned).toBe(12.34);
    });
  });

  describe('gift card entitlement', () => {
    it('issues the gift card and does not touch course access', async () => {
      getSaleByStripeSessionId.mockResolvedValue(buildSale({ type: 'GIFT_CARD' }));

      await handleCompletedCheckout(buildEvent());

      expect(updateCompletedSaleCourse).not.toHaveBeenCalled();
      expect(stripe.products.retrieve).not.toHaveBeenCalled();

      const args = updateCompletedSaleGiftCard.mock.calls[0][0];
      expect(args).toEqual({
        saleId: 'sale-1',
        amountPaid: 299,
        saleStatus: 'PAID',
        giftCardStatus: 'ISSUED',
        stripeCustomerId: 'cus_SESSION',
        stripeCustomerEmail: 'session@example.com',
        stripePaymentStatus: 'paid',
        transactionObject: buildEvent(),
        affiliateAmountEarned: null,
      });
    });

    it('issues a gift card even though no product row is linked to the sale', async () => {
      // The "Could not find matching product" guard is deliberately scoped to the
      // course branch; a gift card carries its access days on the sale row itself,
      // so requiring a product here would strand paid gift cards unissued.
      getSaleByStripeSessionId.mockResolvedValue(buildSale({ type: 'GIFT_CARD', product: null }));

      await expect(handleCompletedCheckout(buildEvent())).resolves.toBeUndefined();

      expect(updateCompletedSaleGiftCard).toHaveBeenCalledTimes(1);
      expect(updateCompletedSaleGiftCard.mock.calls[0][0].giftCardStatus).toBe('ISSUED');
    });
  });

  describe('side effects never block the grant', () => {
    it('subscribes the buyer to the paying-users list', async () => {
      await handleCompletedCheckout(buildEvent());

      expect(subscribeToList).toHaveBeenCalledWith('buyer@example.com', 'PAYING_USERS', true);
    });

    it('still resolves when the mailing list subscribe fails', async () => {
      subscribeToList.mockRejectedValue(new Error('sendinblue down'));

      await expect(handleCompletedCheckout(buildEvent())).resolves.toBeUndefined();

      expect(updateCompletedSaleCourse).toHaveBeenCalledTimes(1);
      expect(Sentry.captureException).toHaveBeenCalled();
    });

    it('still grants access when the internal notification email throws', async () => {
      sendTransactionalEmailFromTemplate.mockImplementation(() => {
        throw new Error('sendinblue down');
      });

      await expect(handleCompletedCheckout(buildEvent())).resolves.toBeUndefined();

      expect(updateCompletedSaleCourse).toHaveBeenCalledTimes(1);
      expect(Sentry.captureException).toHaveBeenCalled();
    });

    it('propagates a failure of the entitlement write so Stripe retries', async () => {
      updateCompletedSaleCourse.mockRejectedValue(new Error('hasura down'));

      await expect(handleCompletedCheckout(buildEvent())).rejects.toThrow('hasura down');
      expect(subscribeToList).not.toHaveBeenCalled();
    });
  });
});

export {};
