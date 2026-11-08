import { print } from 'graphql/language/printer';
import gql from 'graphql-tag';
import client from 'services/server/graphql/client';
import {
  InsertUnpaidSaleWithGiftCardMutationVariables,
  InsertUnpaidSaleWithGiftCardMutation,
} from 'types/generated/server';

const INSERT_UNPAID_SALE_WITH_GIFT_CARD = gql`
  mutation insertUnpaidSaleWithGiftCard(
    $saleType: String!
    $stripeSessionId: String!
    $saleStatus: String!
    $giftCardStatus: String!
    $giftCardType: String!
    $giftCardSource: String
    $paymentProcessor: String
    $payingUserId: String
    $originalPrice: numeric
    $stripePaymentStatus: String
    $stripeCustomerId: String
    $stripePriceId: String
    $stripeProductId: String
    $senderEmail: String
    $productAccessDays: Int
    $productDescription: String
    $productName: String
    $productType: String
    $purchasedProductId: uuid!
    $affiliateLinkClickId: uuid
    $affiliateUserId: String
    $affiliatePayoutStatus: String
    $affiliateAmountEarned: numeric
  ) {
    insert_sales_one(
      object: {
        type: $saleType
        stripeSessionId: $stripeSessionId
        status: $saleStatus
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
        giftCards: {
          data: {
            stripePriceId: $stripePriceId
            stripeProductId: $stripeProductId
            status: $giftCardStatus
            senderId: $payingUserId
            productAccessDays: $productAccessDays
            productDescription: $productDescription
            productName: $productName
            productType: $productType
            senderEmail: $senderEmail
            type: $giftCardType
            source: $giftCardSource
            productId: $purchasedProductId
          }
        }
      }
    ) {
      id
      stripeSessionId
      giftCards {
        id
        stripeProductId
        stripePriceId
        type
        status
        productAccessDays
        productDescription
        productName
        productType
        code
      }
    }
  }
`;

const insertUnpaidSaleWithGiftCard = (variables: InsertUnpaidSaleWithGiftCardMutationVariables) => {
  return client.request<InsertUnpaidSaleWithGiftCardMutation>(
    print(INSERT_UNPAID_SALE_WITH_GIFT_CARD),
    variables,
  );
};

export default insertUnpaidSaleWithGiftCard;
