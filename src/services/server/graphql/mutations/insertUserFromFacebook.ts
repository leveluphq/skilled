import { print } from 'graphql/language/printer';
import gql from 'graphql-tag';
import client from 'services/server/graphql/client';
import {
  InsertUserFromFacebookMutationVariables,
  InsertUserFromFacebookMutation,
} from 'types/generated/server';

const INSERT_USER_FROM_FACEBOOK = gql`
  mutation insertUserFromFacebook(
    $registrationSource: String!
    $email: String!
    $name: String
    $facebookProfile: jsonb!
    $facebookId: String
    $facebookAccessToken: String!
    $image: String
    $firstName: String
    $middleName: String
    $lastName: String
    $nameFormat: String
    $shortName: String
  ) {
    insert_users(
      objects: {
        registrationSource: $registrationSource
        email: $email
        name: $name
        facebookProfile: $facebookProfile
        facebookId: $facebookId
        facebookAccessToken: $facebookAccessToken
        image: $image
        firstName: $firstName
        middleName: $middleName
        lastName: $lastName
        nameFormat: $nameFormat
        shortName: $shortName
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

const insertUserFromFacebook = (variables: InsertUserFromFacebookMutationVariables) => {
  return client.request<InsertUserFromFacebookMutation>(
    print(INSERT_USER_FROM_FACEBOOK),
    variables,
  );
};

export default insertUserFromFacebook;
