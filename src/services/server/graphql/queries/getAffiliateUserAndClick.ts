import { print } from 'graphql/language/printer';
import gql from 'graphql-tag';
import client from 'services/server/graphql/client';
import {
  GetAffiliateUserAndClickQuery,
  GetAffiliateUserAndClickQueryVariables,
} from 'types/generated/server';

const GET_USER_BY_AFFILIATE_ID = gql`
  query getAffiliateUserAndClick($affiliateId: String!, $clickId: uuid!) {
    users(where: { affiliateId: { _ilike: $affiliateId } }) {
      id
      affiliateId
      affiliateRevenueShare
    }
    affiliate_link_clicks_by_pk(id: $clickId) {
      id
    }
  }
`;

const getAffiliateUserAndClick = async (variables: GetAffiliateUserAndClickQueryVariables) => {
  const data = await client.request<GetAffiliateUserAndClickQuery>(
    print(GET_USER_BY_AFFILIATE_ID),
    variables,
  );

  return data;
};

export default getAffiliateUserAndClick;
