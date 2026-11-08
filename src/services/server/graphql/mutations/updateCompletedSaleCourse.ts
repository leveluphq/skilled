import { print } from 'graphql/language/printer';
import gql from 'graphql-tag';
import client from 'services/server/graphql/client';
import {
  UpdateCompletedSaleCourseMutationVariables,
  UpdateCompletedSaleCourseMutation,
} from 'types/generated/server';

const UPDATE_COMPLETED_SALE_COURSE = gql`
  mutation updateCompletedSaleCourse(
    $saleId: uuid!
    $amountPaid: numeric!
    $saleStatus: String!
    $stripeCustomerId: String
    $stripeCustomerEmail: String
    $stripePaymentStatus: String
    $transactionObject: jsonb!
    $userId: String!
    $fullCourseAccessEndsAt: timestamptz!
    $fullCourseAccessFirstUpgradedAt: timestamptz!
    $fullCourseAccessLatestUpgradedAt: timestamptz!
    $upgradeType: String!
    $productType: String!
    $productName: String!
    $productDescription: String!
    $productAccessDays: Int!
    $upgradeDetailsObject: jsonb!
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
    insert_upgrade_event_log_one(
      object: {
        userId: $userId
        type: $upgradeType
        saleId: $saleId
        productType: $productType
        productName: $productName
        productDescription: $productDescription
        productAccessDays: $productAccessDays
        detailsObject: $upgradeDetailsObject
      }
    ) {
      id
    }
  }
`;

const updateCompletedSaleCourse = (variables: UpdateCompletedSaleCourseMutationVariables) => {
  return client.request<UpdateCompletedSaleCourseMutation>(
    print(UPDATE_COMPLETED_SALE_COURSE),
    variables,
  );
};

export default updateCompletedSaleCourse;
