import { print } from 'graphql/language/printer';
import gql from 'graphql-tag';
import client from 'services/server/graphql/client';
import { GetUserByEmailQuery } from 'types/generated/server';

const GET_USER_BY_EMAIL = gql`
  query getUserByEmail($email: String) {
    users(where: { email: { _eq: $email } }) {
      id
      email
      role
      githubUsername
      githubProfile
      githubNodeId
      githubId
      registrationSource
    }
  }
`;

const getUserByEmail = async (email: string) => {
  const data = await client.request<GetUserByEmailQuery>(print(GET_USER_BY_EMAIL), {
    email,
  });

  return data.users[0];
};

export default getUserByEmail;
