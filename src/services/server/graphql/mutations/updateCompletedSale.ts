import { print } from 'graphql/language/printer';
import gql from 'graphql-tag';
import client from 'services/server/graphql/client';
import {
  UpdateCompletedSaleMutationVariables,
  UpdateCompletedSaleMutation,
} from 'types/generated/server';

const UPDATE_COMPLETED_SALE = gql`
  mutation updateCompletedSale(
    $id: uuid!
    $amountPaid: numeric
    $status: String
    $stripeCustomerId: String
    $stripeCustomerEmail: String
    $stripePaymentStatus: String
    $transactionObject: jsonb
  ) {
    update_sales_by_pk(
      pk_columns: { id: $id }
      _set: {
        amountPaid: $amountPaid
        status: $status
        stripeCustomerId: $stripeCustomerId
        stripeCustomerEmail: $stripeCustomerEmail
        stripePaymentStatus: $stripePaymentStatus
        transactionObject: $transactionObject
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
  }
`;

const updateCompletedSale = (variables: UpdateCompletedSaleMutationVariables) => {
  return client.request<UpdateCompletedSaleMutation>(print(UPDATE_COMPLETED_SALE), variables);
};

export default updateCompletedSale;
