import { print } from 'graphql/language/printer';
import gql from 'graphql-tag';
import client from 'services/server/graphql/client';
import { GetUserByStripeCustomerIdQuery } from 'types/generated/server';

const GET_USER_BY_STRIPE_CUSTOMER_ID = gql`
  query getUserByStripeCustomerId($stripeCustomerId: String) {
    users(where: { stripeCustomerId: { _eq: $stripeCustomerId } }) {
      id
      email
      stripeCustomerId
      fullCourseAccessEndsAt
      fullCourseAccessLatestUpgradedAt
      fullCourseAccessFirstUpgradedAt
      fullCourseAccessTerminatedAt
    }
  }
`;

const getUserByStripeCustomerId = async (stripeCustomerId: string) => {
  const data = await client.request<GetUserByStripeCustomerIdQuery>(
    print(GET_USER_BY_STRIPE_CUSTOMER_ID),
    {
      stripeCustomerId,
    },
  );

  return data.users[0];
};

export default getUserByStripeCustomerId;
