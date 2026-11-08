import { print } from 'graphql/language/printer';
import gql from 'graphql-tag';
import client from 'services/server/graphql/client';
import { GetUserByFacebookIdQuery } from 'types/generated/server';

const GET_USER_BY_FACEBOOK_ID = gql`
  query getUserByFacebookId($facebookId: String) {
    users(where: { facebookId: { _eq: $facebookId } }) {
      id
      email
      role
      facebookId
      facebookProfile
      registrationSource
    }
  }
`;

const getUserByFacebookId = async (facebookId: string) => {
  if (!facebookId) {
    return null;
  }

  const data = await client.request<GetUserByFacebookIdQuery>(print(GET_USER_BY_FACEBOOK_ID), {
    facebookId,
  });

  return data.users[0];
};

export default getUserByFacebookId;
