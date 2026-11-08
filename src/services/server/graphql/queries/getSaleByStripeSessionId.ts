import { print } from 'graphql/language/printer';
import gql from 'graphql-tag';
import client from 'services/server/graphql/client';
import { GetSaleByStripeSessionIdQuery } from 'types/generated/server';

const GET_SALE_BY_STRIPE_SESSION_ID = gql`
  query getSaleByStripeSessionId($stripeSessionId: String!) {
    sales(where: { stripeSessionId: { _eq: $stripeSessionId } }) {
      id
      type
      status
      stripeCustomerEmail
      stripeCustomerId
      stripePaymentStatus
      stripePriceId
      stripeProductId
      stripeSessionId
      affiliateAmountEarned
      payingUser {
        email
        fullCourseAccessEndsAt
        fullCourseAccessFirstUpgradedAt
        fullCourseAccessLatestUpgradedAt
        fullCourseAccessTerminatedAt
        stripeCustomerId
        id
      }
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
      affiliateUser {
        affiliateRevenueShare
        id
      }
    }
  }
`;

const getSaleByStripeSessionId = async (stripeSessionId: string) => {
  const data = await client.request<GetSaleByStripeSessionIdQuery>(
    print(GET_SALE_BY_STRIPE_SESSION_ID),
    {
      stripeSessionId,
    },
  );

  return data && data.sales[0];
};

export default getSaleByStripeSessionId;
