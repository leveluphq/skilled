import { DisplayProduct } from 'utils/shared/products/buildDisplayProduct';
import api from 'services/client/api';

export const getStripeSession = async (product: DisplayProduct) => {
  // Only the id is sent: the server resolves price and entitlement from the
  // database and Stripe so they cannot be chosen by the caller.
  const sessionResponse = await api.post('payments/stripe/checkout', {
    payload: { productId: product.id },
  });
  return sessionResponse;
};
