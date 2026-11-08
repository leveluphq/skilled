import { print } from 'graphql/language/printer';
import gql from 'graphql-tag';
import client from 'services/server/graphql/client';
import {
  RedeemCourseAccessGiftCardMutationVariables,
  RedeemCourseAccessGiftCardMutation,
} from 'types/generated/server';

const REDEEM_COURSE_ACCESS_GIFT_CARD = gql`
  mutation redeemCourseAccessGiftCard(
    $userId: String!
    $giftCardId: uuid!
    $giftCardStatus: String!
    $fullCourseAccessEndsAt: timestamptz!
    $fullCourseAccessFirstUpgradedAt: timestamptz!
    $fullCourseAccessLatestUpgradedAt: timestamptz!
    $redeemedAt: timestamptz!
    $upgradeType: String!
    $saleId: uuid
    $productType: String
    $productName: String
    $productDescription: String
    $productAccessDays: Int
    $detailsObject: jsonb
  ) {
    update_users_by_pk(
      pk_columns: { id: $userId }
      _set: {
        fullCourseAccessEndsAt: $fullCourseAccessEndsAt
        fullCourseAccessFirstUpgradedAt: $fullCourseAccessFirstUpgradedAt
        fullCourseAccessLatestUpgradedAt: $fullCourseAccessLatestUpgradedAt
      }
    ) {
      id
      fullCourseAccessEndsAt
      fullCourseAccessFirstUpgradedAt
      fullCourseAccessLatestUpgradedAt
    }
    update_gift_cards_by_pk(
      pk_columns: { id: $giftCardId }
      _set: { redeemerId: $userId, redeemedAt: $redeemedAt, status: $giftCardStatus }
    ) {
      id
      status
      redeemerId
      redeemedAt
      code
    }
    insert_upgrade_event_log_one(
      object: {
        userId: $userId
        type: $upgradeType
        saleId: $saleId
        productType: $productType
        productName: $productName
        productDescription: $productDescription
        productAccessDays: $productAccessDays
        giftCardId: $giftCardId
        detailsObject: $detailsObject
      }
    ) {
      id
    }
  }
`;

const redeemCourseAccessGiftCard = (variables: RedeemCourseAccessGiftCardMutationVariables) => {
  return client.request<RedeemCourseAccessGiftCardMutation>(
    print(REDEEM_COURSE_ACCESS_GIFT_CARD),
    variables,
  );
};

export default redeemCourseAccessGiftCard;
