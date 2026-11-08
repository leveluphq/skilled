import { print } from 'graphql/language/printer';
import gql from 'graphql-tag';
import client from 'services/server/graphql/client';
import { GetUserByGithubNodeIdQuery } from 'types/generated/server';

const GET_USER_BY_GITHUB_NODE_ID = gql`
  query getUserByGithubNodeId($githubNodeId: String) {
    users(where: { githubNodeId: { _eq: $githubNodeId } }) {
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

const getUserByGithubNodeId = async (githubNodeId: string) => {
  if (!githubNodeId) {
    return null;
  }

  const data = await client.request<GetUserByGithubNodeIdQuery>(print(GET_USER_BY_GITHUB_NODE_ID), {
    githubNodeId,
  });

  return data.users[0];
};

export default getUserByGithubNodeId;
