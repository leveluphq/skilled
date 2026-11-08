import { print } from 'graphql/language/printer';
import gql from 'graphql-tag';
import client from 'services/server/graphql/client';
import {
  UpdateUserStripeCustomerMutationVariables,
  UpdateUserStripeCustomerMutation,
} from 'types/generated/server';

const UPDATE_USER_STRIPE_CUSTOMER = gql`
  mutation updateUserStripeCustomer($id: String!, $stripeCustomerId: String!) {
    update_users(where: { id: { _eq: $id } }, _set: { stripeCustomerId: $stripeCustomerId }) {
      returning {
        id
        role
        stripeCustomerId
      }
    }
  }
`;

const updateUserStripeCustomer = (variables: UpdateUserStripeCustomerMutationVariables) => {
  return client.request<UpdateUserStripeCustomerMutation>(
    print(UPDATE_USER_STRIPE_CUSTOMER),
    variables,
  );
};

export default updateUserStripeCustomer;
