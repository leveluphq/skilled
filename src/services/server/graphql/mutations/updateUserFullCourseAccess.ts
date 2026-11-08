import { print } from 'graphql/language/printer';
import gql from 'graphql-tag';
import client from 'services/server/graphql/client';
import {
  UpdateUserFullCourseAccessMutationVariables,
  UpdateUserFullCourseAccessMutation,
} from 'types/generated/server';

const UPDATE_USER_FULL_COURSE_ACCESS = gql`
  mutation updateUserFullCourseAccess(
    $id: String!
    $fullCourseAccessEndsAt: timestamptz
    $fullCourseAccessFirstUpgradedAt: timestamptz
    $fullCourseAccessLatestUpgradedAt: timestamptz
    $type: String
    $saleId: uuid
    $productType: String
    $productName: String
    $productDescription: String
    $productAccessDays: Int
    $giftCardId: uuid
    $detailsObject: jsonb
  ) {
    update_users_by_pk(
      pk_columns: { id: $id }
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
    insert_upgrade_event_log_one(
      object: {
        userId: $id
        type: $type
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

const updateUserFullCourseAccess = (variables: UpdateUserFullCourseAccessMutationVariables) => {
  return client.request<UpdateUserFullCourseAccessMutation>(
    print(UPDATE_USER_FULL_COURSE_ACCESS),
    variables,
  );
};

export default updateUserFullCourseAccess;
