import createStripeUser from 'services/server/stripe/createStripeUser';
import updateUserStripeCustomer from 'services/server/graphql/mutations/updateUserStripeCustomer';
import Sentry from 'utils/shared/sentry';

export const isStripeConfigured = () => !!process.env.STRIPE_SECRET_KEY;

/**
 * Gives a new user a Stripe customer when the site has Stripe, and resolves to
 * its id, or null when there isn't one. Logging in never depends on Stripe:
 * without STRIPE_SECRET_KEY nothing is created, and if Stripe fails the user
 * still logs in. Checkout copes with a user who has no customer: it sends their
 * email instead and saves the customer Stripe returns.
 */
const linkStripeCustomer = async ({ id, email }: { id: string; email: string }) => {
  if (!isStripeConfigured()) {
    return null;
  }

  try {
    const stripeUser = await createStripeUser({ id, email });

    await updateUserStripeCustomer({ id, stripeCustomerId: stripeUser.id });
    return stripeUser.id;
  } catch (error) {
    Sentry.withScope((_scope) => {
      Sentry.captureException(error);
    });

    return null;
  }
};

export default linkStripeCustomer;
