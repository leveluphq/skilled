import { print } from 'graphql/language/printer';
import gql from 'graphql-tag';
import client from 'services/server/graphql/client';
import {
  InsertUserFromGithubMutationVariables,
  InsertUserFromGithubMutation,
} from 'types/generated/server';

const INSERT_USER_FROM_GITHUB = gql`
  mutation insertUserFromGithub(
    $registrationSource: String!
    $email: String!
    $name: String = ""
    $githubProfile: jsonb!
    $githubUsername: String
    $githubNodeId: String
    $githubId: Int
    $githubAccessToken: String
    $bio: String
    $image: String
    $location: String
    $website: String
    $company: String
  ) {
    insert_users(
      objects: {
        registrationSource: $registrationSource
        email: $email
        name: $name
        githubUsername: $githubUsername
        githubProfile: $githubProfile
        githubNodeId: $githubNodeId
        githubId: $githubId
        githubAccessToken: $githubAccessToken
        bio: $bio
        image: $image
        location: $location
        website: $website
        company: $company
      }
    ) {
      returning {
        id
        role
        email
      }
    }
  }
`;

const insertUserFromGithub = (variables: InsertUserFromGithubMutationVariables) => {
  return client.request<InsertUserFromGithubMutation>(print(INSERT_USER_FROM_GITHUB), variables);
};

export default insertUserFromGithub;
