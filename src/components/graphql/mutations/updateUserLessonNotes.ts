import gql from 'graphql-tag';

export const UPDATE_USER_LESSON_NOTES = gql`
  mutation updateUserLessonNotes($lessonId: uuid!, $userId: String!, $notes: String) {
    update_users_lessons_status_by_pk(
      _set: { notes: $notes }
      pk_columns: { lessonId: $lessonId, userId: $userId }
    ) {
      status
      explanationStepsViewed
      validationStepsViewed
      confidence
      lessonId
      userId
      notes
    }
  }
`;
