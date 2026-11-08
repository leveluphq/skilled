import { print } from 'graphql/language/printer';
import gql from 'graphql-tag';
import client from 'services/server/graphql/client';
import { GetActiveProductsQuery } from 'types/generated/server';

const GET_ACTIVE_PRODUCTS = gql`
  query getActiveProducts {
    products(where: { status: { _eq: "ACTIVE" } }) {
      createdAt
      displayDescription
      displayLengthDescription
      id
      displayTitle
      productAccessDays
      status
      stripePriceId
      stripeProductId
      type
      updatedAt
      isAdditionalSupportPrice
      associatedProduct {
        id
        type
      }
    }
  }
`;

const getActiveProducts = async () => {
  const data = await client.request<GetActiveProductsQuery>(print(GET_ACTIVE_PRODUCTS));

  return data?.products;
};

export default getActiveProducts;
