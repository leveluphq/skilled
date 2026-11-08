import { print } from 'graphql/language/printer';
import gql from 'graphql-tag';
import client from 'services/server/graphql/client';
import { GetUserByGoogleIdQuery } from 'types/generated/server';

const GET_USER_BY_GOOGLE_ID = gql`
  query getUserByGoogleId($googleId: String) {
    users(where: { googleId: { _eq: $googleId } }) {
      id
      email
      role
      googleId
      googleProfile
      registrationSource
    }
  }
`;

const getUserByGoogleId = async (googleId: string) => {
  if (!googleId) {
    return null;
  }

  const data = await client.request<GetUserByGoogleIdQuery>(print(GET_USER_BY_GOOGLE_ID), {
    googleId,
  });

  return data.users[0];
};

export default getUserByGoogleId;
