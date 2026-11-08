/**
 * `createStripeUser` is the only place the Skilled user id is attached to a
 * Stripe customer. That metadata link is what lets a Stripe-side record be
 * reconciled back to an account, so the exact payload is worth pinning.
 */

jest.mock('services/server/stripe/instance', () => ({
  __esModule: true,
  default: {
    customers: { create: jest.fn() },
  },
}));

let createStripeUser: (params: { id: string; email: string }) => Promise<any>;
let stripeInstance: any;

const CREATE_USER_ORIGINAL_ENV = { ...process.env };

beforeAll(() => {
  process.env.STRIPE_SECRET_KEY = 'sk_test_not_real';
  createStripeUser = require('../createStripeUser').default;
  stripeInstance = require('services/server/stripe/instance').default;
});

afterAll(() => {
  process.env = CREATE_USER_ORIGINAL_ENV;
});

beforeEach(() => {
  jest.clearAllMocks();
  stripeInstance.customers.create.mockResolvedValue({ id: 'cus_CREATED' });
});

describe('createStripeUser', () => {
  it('links the Skilled user id to the Stripe customer via metadata', async () => {
    const customer = await createStripeUser({ id: 'user-1', email: 'buyer@example.com' });

    expect(stripeInstance.customers.create).toHaveBeenCalledWith({
      email: 'buyer@example.com',
      metadata: { id: 'user-1' },
    });
    expect(customer).toEqual({ id: 'cus_CREATED' });
  });

  it('forwards only id and email, never extra caller-supplied fields', async () => {
    // A caller that spread a request body in here must not be able to set
    // arbitrary Stripe customer attributes (balance, description, tax ids...).
    await createStripeUser({
      id: 'user-1',
      email: 'buyer@example.com',
      balance: -1000000,
      description: 'attacker controlled',
    } as any);

    expect(stripeInstance.customers.create).toHaveBeenCalledWith({
      email: 'buyer@example.com',
      metadata: { id: 'user-1' },
    });
  });
});

export {};
