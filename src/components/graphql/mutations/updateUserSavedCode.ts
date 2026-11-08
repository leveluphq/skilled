import gql from 'graphql-tag';

export const UPDATE_USER_SAVED_CODE = gql`
  mutation updateUserSavedCode(
    $lessonId: uuid!
    $userId: String!
    $code: String
    $language: String!
  ) {
    insert_code_drafts(
      objects: { code: $code, lessonId: $lessonId, language: $language, userId: $userId }
      on_conflict: { constraint: code_drafts_language_userId_lessonId_key, update_columns: code }
    ) {
      returning {
        code
        createdAt
        id
        language
        lessonId
        updatedAt
        userId
      }
    }
  }
`;
