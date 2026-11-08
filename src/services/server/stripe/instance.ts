import Stripe from 'stripe';

const API_VERSION = '2020-08-27';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: API_VERSION,
  typescript: true,
});

export default stripe;
