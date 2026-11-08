import { print } from 'graphql/language/printer';
import gql from 'graphql-tag';
import client from 'services/server/graphql/client';
import { GetActiveProductByIdQuery } from 'types/generated/server';

/**
 * Fetch a single ACTIVE product by id.
 *
 * Selects the same fields as `getActiveProducts` so the row can be handed to
 * `buildDisplayProduct` unchanged. The `status` filter is part of the query rather
 * than a post-fetch check so that a retired product cannot be purchased by id.
 */
const GET_ACTIVE_PRODUCT_BY_ID = gql`
  query getActiveProductById($id: uuid!) {
    products(where: { id: { _eq: $id }, status: { _eq: "ACTIVE" } }, limit: 1) {
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

const getActiveProductById = async (id: string) => {
  const data = await client.request<GetActiveProductByIdQuery>(print(GET_ACTIVE_PRODUCT_BY_ID), {
    id,
  });

  return data?.products?.[0] || null;
};

export default getActiveProductById;
