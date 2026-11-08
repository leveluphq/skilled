import Stripe from 'stripe';
import centsToDollars from 'utils/shared/payments/centsToDollars';
import { GetActiveProductsQuery } from 'types/generated/server';
import { SaleType } from 'utils/constants/payments';

const buildDisplayProduct = (
  db: GetActiveProductsQuery['products'][0],
  stripeProduct: Stripe.Product,
  stripePrice: Stripe.Price,
) => {
  if (db.stripeProductId !== stripeProduct.id) {
    throw new Error('Products do not match');
  }

  if (db.stripePriceId !== stripePrice.id) {
    throw new Error('Prices do not match');
  }

  return {
    id: db.id,
    associatedProductId: db.associatedProduct?.id || null,
    type: db.type as SaleType,
    productType: db.associatedProduct?.type || null,
    productAccessDays: db.productAccessDays,
    stripeProductId: db.stripeProductId,
    stripePriceId: db.stripePriceId,
    name: db.displayTitle || stripeProduct.name,
    price: centsToDollars(stripePrice.unit_amount),
    planDescription: db.displayDescription || stripeProduct.description,
    lengthDescription: db.displayLengthDescription || null,
    isAdditionalSupportPrice: db.isAdditionalSupportPrice || false,
  };
};

export type DisplayProduct = ReturnType<typeof buildDisplayProduct>;

export default buildDisplayProduct;
