import { print } from 'graphql/language/printer';
import gql from 'graphql-tag';
import client from 'services/server/graphql/client';
import {
  UpdateCompletedSaleGiftCardMutationVariables,
  UpdateCompletedSaleGiftCardMutation,
} from 'types/generated/server';

const UPDATE_COMPLETED_SALE_GIFT_CARD = gql`
  mutation updateCompletedSaleGiftCard(
    $saleId: uuid!
    $amountPaid: numeric!
    $saleStatus: String!
    $stripeCustomerId: String
    $stripeCustomerEmail: String
    $stripePaymentStatus: String!
    $transactionObject: jsonb!
    $giftCardStatus: String!
    $affiliateAmountEarned: numeric
  ) {
    update_sales_by_pk(
      pk_columns: { id: $saleId }
      _set: {
        amountPaid: $amountPaid
        status: $saleStatus
        stripeCustomerId: $stripeCustomerId
        stripeCustomerEmail: $stripeCustomerEmail
        stripePaymentStatus: $stripePaymentStatus
        transactionObject: $transactionObject
        affiliateAmountEarned: $affiliateAmountEarned
      }
    ) {
      id
      stripePriceId
      stripeProductId
      stripePaymentStatus
      stripeSessionId
      type
      status
      payingUser {
        fullCourseAccessEndsAt
        fullCourseAccessFirstUpgradedAt
        fullCourseAccessLatestUpgradedAt
        fullCourseAccessTerminatedAt
        stripeCustomerId
        id
      }
    }
    update_gift_cards(where: { saleId: { _eq: $saleId } }, _set: { status: $giftCardStatus }) {
      returning {
        id
      }
    }
  }
`;

const updateCompletedSaleGiftCard = (variables: UpdateCompletedSaleGiftCardMutationVariables) => {
  return client.request<UpdateCompletedSaleGiftCardMutation>(
    print(UPDATE_COMPLETED_SALE_GIFT_CARD),
    variables,
  );
};

export default updateCompletedSaleGiftCard;
