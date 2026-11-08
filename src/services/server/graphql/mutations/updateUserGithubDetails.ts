import { print } from 'graphql/language/printer';
import gql from 'graphql-tag';
import client from 'services/server/graphql/client';
import {
  UpdateUserGithubDetailsMutationVariables,
  UpdateUserGithubDetailsMutation,
} from 'types/generated/server';

const UPDATE_USER_GITHUB_DETAILS = gql`
  mutation updateUserGithubDetails(
    $id: String!
    $githubProfile: jsonb!
    $githubUsername: String!
    $githubNodeId: String
    $githubId: Int!
    $githubAccessToken: String
  ) {
    update_users(
      where: { id: { _eq: $id } }
      _set: {
        githubUsername: $githubUsername
        githubProfile: $githubProfile
        githubNodeId: $githubNodeId
        githubId: $githubId
        githubAccessToken: $githubAccessToken
      }
    ) {
      returning {
        id
        role
      }
    }
  }
`;

const updateUserGithubDetails = (variables: UpdateUserGithubDetailsMutationVariables) => {
  return client.request<UpdateUserGithubDetailsMutation>(
    print(UPDATE_USER_GITHUB_DETAILS),
    variables,
  );
};

export default updateUserGithubDetails;
