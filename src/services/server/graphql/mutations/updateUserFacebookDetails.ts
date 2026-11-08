import { print } from 'graphql/language/printer';
import gql from 'graphql-tag';
import client from 'services/server/graphql/client';
import {
  UpdateUserFacebookDetailsMutationVariables,
  UpdateUserFacebookDetailsMutation,
} from 'types/generated/server';

const UPDATE_USER_FACEBOOK_DETAILS = gql`
  mutation updateUserFacebookDetails(
    $id: String!
    $facebookProfile: jsonb!
    $facebookId: String!
    $facebookAccessToken: String
  ) {
    update_users(
      where: { id: { _eq: $id } }
      _set: {
        facebookProfile: $facebookProfile
        facebookId: $facebookId
        facebookAccessToken: $facebookAccessToken
      }
    ) {
      returning {
        id
        role
      }
    }
  }
`;

const updateUserFacebookDetails = (variables: UpdateUserFacebookDetailsMutationVariables) => {
  return client.request<UpdateUserFacebookDetailsMutation>(
    print(UPDATE_USER_FACEBOOK_DETAILS),
    variables,
  );
};

export default updateUserFacebookDetails;
