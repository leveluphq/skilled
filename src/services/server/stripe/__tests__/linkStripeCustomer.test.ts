/**
 * A new user's first login gives them a Stripe customer, but only when the site
 * has Stripe, and logging in never fails because of Stripe.
 */

jest.mock('services/server/stripe/createStripeUser', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('services/server/graphql/mutations/updateUserStripeCustomer', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('utils/shared/sentry', () => ({
  __esModule: true,
  default: {
    withScope: jest.fn((callback: (scope: unknown) => void) => callback({})),
    captureException: jest.fn(),
  },
}));

import createStripeUser from 'services/server/stripe/createStripeUser';
import updateUserStripeCustomer from 'services/server/graphql/mutations/updateUserStripeCustomer';
import Sentry from 'utils/shared/sentry';
import linkStripeCustomer, { isStripeConfigured } from '../linkStripeCustomer';

const createStripeUserMock = createStripeUser as jest.Mock;
const updateUserStripeCustomerMock = updateUserStripeCustomer as jest.Mock;
const ORIGINAL_ENV = { ...process.env };
const USER = { id: 'user-1', email: 'learner@example.com' };

beforeEach(() => {
  jest.clearAllMocks();
  process.env = { ...ORIGINAL_ENV, STRIPE_SECRET_KEY: 'sk_test_not_real' };
  createStripeUserMock.mockResolvedValue({ id: 'cus_NEW' });
  updateUserStripeCustomerMock.mockResolvedValue({});
});

afterAll(() => {
  process.env = ORIGINAL_ENV;
});

describe('linkStripeCustomer', () => {
  it("creates the user's Stripe customer and saves its id on the user", async () => {
    await expect(linkStripeCustomer(USER)).resolves.toBe('cus_NEW');
    expect(createStripeUserMock).toHaveBeenCalledWith(USER);
    expect(updateUserStripeCustomerMock).toHaveBeenCalledWith({
      id: 'user-1',
      stripeCustomerId: 'cus_NEW',
    });
  });

  it("does nothing when the site has no Stripe key, as a fresh copy doesn't", async () => {
    delete process.env.STRIPE_SECRET_KEY;

    await expect(linkStripeCustomer(USER)).resolves.toBeNull();
    expect(createStripeUserMock).not.toHaveBeenCalled();
    expect(updateUserStripeCustomerMock).not.toHaveBeenCalled();
    expect(Sentry.captureException).not.toHaveBeenCalled();
  });

  it('treats an empty key as no key', () => {
    process.env.STRIPE_SECRET_KEY = '';

    expect(isStripeConfigured()).toBe(false);
  });

  it('reports a Stripe failure and lets the login go on', async () => {
    const error = new Error('Stripe is down');

    createStripeUserMock.mockRejectedValue(error);

    await expect(linkStripeCustomer(USER)).resolves.toBeNull();
    expect(updateUserStripeCustomerMock).not.toHaveBeenCalled();
    expect(Sentry.captureException).toHaveBeenCalledWith(error);
  });

  it('reports a failure to save the customer and lets the login go on', async () => {
    const error = new Error('Hasura is down');

    updateUserStripeCustomerMock.mockRejectedValue(error);

    await expect(linkStripeCustomer(USER)).resolves.toBeNull();
    expect(Sentry.captureException).toHaveBeenCalledWith(error);
  });
});
