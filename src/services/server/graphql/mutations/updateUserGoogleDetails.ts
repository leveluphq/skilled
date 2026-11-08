import { print } from 'graphql/language/printer';
import gql from 'graphql-tag';
import client from 'services/server/graphql/client';
import {
  UpdateUserGoogleDetailsMutationVariables,
  UpdateUserGoogleDetailsMutation,
} from 'types/generated/server';

const UPDATE_USER_GOOGLE_DETAILS = gql`
  mutation updateUserGoogleDetails(
    $id: String!
    $googleProfile: jsonb!
    $googleId: String!
    $googleEmailVerified: Boolean
    $googleAccessToken: String
    $googleRefreshToken: String
    $googleTokenExpiryDate: String
    $googleTokenType: String
    $googleIdToken: String
    $locale: String
  ) {
    update_users(
      where: { id: { _eq: $id } }
      _set: {
        googleProfile: $googleProfile
        googleId: $googleId
        googleEmailVerified: $googleEmailVerified
        googleAccessToken: $googleAccessToken
        googleRefreshToken: $googleRefreshToken
        googleTokenExpiryDate: $googleTokenExpiryDate
        googleTokenType: $googleTokenType
        googleIdToken: $googleIdToken
        locale: $locale
      }
    ) {
      returning {
        id
        role
      }
    }
  }
`;

const updateUserGoogleDetails = (variables: UpdateUserGoogleDetailsMutationVariables) => {
  return client.request<UpdateUserGoogleDetailsMutation>(
    print(UPDATE_USER_GOOGLE_DETAILS),
    variables,
  );
};

export default updateUserGoogleDetails;
