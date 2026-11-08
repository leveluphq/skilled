import { print } from 'graphql/language/printer';
import gql from 'graphql-tag';
import client from 'services/server/graphql/client';
import { GetGiftCardByCodeQuery } from 'types/generated/server';

const GET_GIFT_CARD_BY_CODE = gql`
  query getGiftCardByCode($code: String!) {
    gift_cards(where: { code: { _eq: $code } }, limit: 1) {
      createdAt
      creditAmountDollars
      giftNote
      id
      productAccessDays
      productDescription
      productName
      productType
      receiverEmail
      receiverId
      redeemerId
      saleId
      senderEmail
      senderId
      status
      stripePriceId
      stripeProductId
      type
      updatedAt
      product {
        type
        stripeProductId
        stripePriceId
        status
        productAccessDays
        id
        displayTitle
        displayLengthDescription
        displayDescription
        associatedProductId
      }
    }
  }
`;

const getGiftCardByCode = async (code: string) => {
  const data = await client.request<GetGiftCardByCodeQuery>(print(GET_GIFT_CARD_BY_CODE), {
    code,
  });

  return data.gift_cards[0];
};

export default getGiftCardByCode;
