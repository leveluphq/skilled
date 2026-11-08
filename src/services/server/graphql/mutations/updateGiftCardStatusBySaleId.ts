import { print } from 'graphql/language/printer';
import gql from 'graphql-tag';
import client from 'services/server/graphql/client';
import {
  UpdateGiftCardStatusBySaleIdMutationVariables,
  UpdateGiftCardStatusBySaleIdMutation,
} from 'types/generated/server';

const UPDATE_GIFT_CARD_STATUS_BY_SALE_ID = gql`
  mutation updateGiftCardStatusBySaleId($saleId: uuid, $status: String) {
    update_gift_cards(where: { saleId: { _eq: $saleId } }, _set: { status: $status }) {
      returning {
        id
      }
    }
  }
`;

const updateGiftCardStatusBySaleId = (variables: UpdateGiftCardStatusBySaleIdMutationVariables) => {
  return client.request<UpdateGiftCardStatusBySaleIdMutation>(
    print(UPDATE_GIFT_CARD_STATUS_BY_SALE_ID),
    variables,
  );
};

export default updateGiftCardStatusBySaleId;
