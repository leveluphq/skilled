import { print } from 'graphql/language/printer';
import gql from 'graphql-tag';
import client from 'services/server/graphql/client';
import {
  UpdateStripeCustomerIdMutationVariables,
  UpdateStripeCustomerIdMutation,
} from 'types/generated/server';

const UPDATE_STRIPE_CUSTOMER_ID = gql`
  mutation updateStripeCustomerId($id: String!, $stripeCustomerId: String!) {
    update_users_by_pk(pk_columns: { id: $id }, _set: { stripeCustomerId: $stripeCustomerId }) {
      id
      stripeCustomerId
      email
    }
  }
`;

const updateStripeCustomerId = (variables: UpdateStripeCustomerIdMutationVariables) => {
  return client.request<UpdateStripeCustomerIdMutation>(
    print(UPDATE_STRIPE_CUSTOMER_ID),
    variables,
  );
};

export default updateStripeCustomerId;
