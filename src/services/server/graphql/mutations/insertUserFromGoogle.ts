import { print } from 'graphql/language/printer';
import gql from 'graphql-tag';
import client from 'services/server/graphql/client';
import {
  InsertUserFromGoogleMutationVariables,
  InsertUserFromGoogleMutation,
} from 'types/generated/server';

const INSERT_USER_FROM_GOOGLE = gql`
  mutation insertUserFromGoogle(
    $registrationSource: String!
    $email: String!
    $name: String
    $googleProfile: jsonb!
    $googleId: String!
    $googleEmailVerified: Boolean
    $googleAccessToken: String
    $googleRefreshToken: String
    $googleTokenExpiryDate: String
    $googleTokenType: String
    $googleIdToken: String
    $locale: String
    $image: String
    $firstName: String
    $lastName: String
  ) {
    insert_users(
      objects: {
        registrationSource: $registrationSource
        email: $email
        name: $name
        googleProfile: $googleProfile
        googleId: $googleId
        googleEmailVerified: $googleEmailVerified
        googleAccessToken: $googleAccessToken
        googleRefreshToken: $googleRefreshToken
        googleTokenExpiryDate: $googleTokenExpiryDate
        googleTokenType: $googleTokenType
        googleIdToken: $googleIdToken
        locale: $locale
        image: $image
        firstName: $firstName
        lastName: $lastName
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

const insertUserFromGoogle = (variables: InsertUserFromGoogleMutationVariables) => {
  return client.request<InsertUserFromGoogleMutation>(print(INSERT_USER_FROM_GOOGLE), variables);
};

export default insertUserFromGoogle;
