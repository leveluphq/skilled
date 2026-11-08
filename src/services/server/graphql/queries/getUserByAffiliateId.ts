import { print } from 'graphql/language/printer';
import gql from 'graphql-tag';
import client from 'services/server/graphql/client';
import { GetUserByAffiliateIdQuery } from 'types/generated/server';

const GET_USER_BY_AFFILIATE_ID = gql`
  query getUserByAffiliateId($affiliateId: String!) {
    users(where: { affiliateId: { _ilike: $affiliateId } }) {
      id
      affiliateId
    }
  }
`;

const getUserByAffiliateId = async (affiliateId: string) => {
  const data = await client.request<GetUserByAffiliateIdQuery>(print(GET_USER_BY_AFFILIATE_ID), {
    affiliateId,
  });

  return data.users[0];
};

export default getUserByAffiliateId;
