import { print } from 'graphql/language/printer';
import gql from 'graphql-tag';
import client from 'services/server/graphql/client';
import {
  InsertUnpaidGiftCardMutationVariables,
  InsertUnpaidGiftCardMutation,
} from 'types/generated/server';

const INSERT_UNPAID_GIFT_CARD = gql`
  mutation insertUnpaidGiftCard(
    $status: String
    $stripePriceId: String
    $stripeProductId: String
    $senderId: String
    $productAccessDays: Int
    $productDescription: String
    $productName: String
    $productType: String
    $senderEmail: String
    $type: String
    $saleId: uuid = ""
  ) {
    insert_gift_cards_one(
      object: {
        stripePriceId: $stripePriceId
        stripeProductId: $stripeProductId
        status: $status
        senderId: $senderId
        productAccessDays: $productAccessDays
        productDescription: $productDescription
        productName: $productName
        productType: $productType
        senderEmail: $senderEmail
        type: $type
        saleId: $saleId
      }
    ) {
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
`;

const insertUnpaidGiftCard = (variables: InsertUnpaidGiftCardMutationVariables) => {
  return client.request<InsertUnpaidGiftCardMutation>(print(INSERT_UNPAID_GIFT_CARD), variables);
};

export default insertUnpaidGiftCard;
