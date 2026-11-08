import gql from 'graphql-tag';

export const UPDDATE_PREFERRED_CODING_LANGUAGE = gql`
  mutation updatePreferredCodingLanguage($id: String!, $preferredCodingLanguage: String!) {
    update_users_by_pk(
      pk_columns: { id: $id }
      _set: { preferredCodingLanguage: $preferredCodingLanguage }
    ) {
      id
    }
  }
`;
