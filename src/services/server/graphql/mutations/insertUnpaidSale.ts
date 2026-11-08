import { print } from 'graphql/language/printer';
import gql from 'graphql-tag';
import client from 'services/server/graphql/client';
import {
  InsertUnpaidSaleMutationVariables,
  InsertUnpaidSaleMutation,
} from 'types/generated/server';

const INSERT_UNPAID_SALE = gql`
  mutation insertUnpaidSale(
    $type: String
    $stripeSessionId: String
    $status: String
    $paymentProcessor: String
    $payingUserId: String
    $originalPrice: numeric
    $stripePaymentStatus: String
    $stripeCustomerId: String
    $stripePriceId: String
    $stripeProductId: String
    $purchasedProductId: uuid!
    $affiliateLinkClickId: uuid
    $affiliateUserId: String
    $affiliatePayoutStatus: String
    $affiliateAmountEarned: numeric
  ) {
    insert_sales_one(
      object: {
        type: $type
        stripeSessionId: $stripeSessionId
        status: $status
        paymentProcessor: $paymentProcessor
        payingUserId: $payingUserId
        originalPrice: $originalPrice
        stripePaymentStatus: $stripePaymentStatus
        stripeCustomerId: $stripeCustomerId
        stripeProductId: $stripeProductId
        stripePriceId: $stripePriceId
        purchasedProductId: $purchasedProductId
        affiliateLinkClickId: $affiliateLinkClickId
        affiliateUserId: $affiliateUserId
        affiliatePayoutStatus: $affiliatePayoutStatus
        affiliateAmountEarned: $affiliateAmountEarned
      }
    ) {
      id
      stripeSessionId
    }
  }
`;

const insertUnpaidSale = (variables: InsertUnpaidSaleMutationVariables) => {
  return client.request<InsertUnpaidSaleMutation>(print(INSERT_UNPAID_SALE), variables);
};

export default insertUnpaidSale;
