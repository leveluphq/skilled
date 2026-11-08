import gql from 'graphql-tag';

export const INSERT_LESSON_STATUS = gql`
  mutation insertLessonStatus(
    $lessonId: uuid!
    $userId: String!
    $explanationStepsViewed: Int! = 0
    $validationStepsViewed: Int! = 0
    $status: String!
  ) {
    insert_users_lessons_status(
      objects: {
        explanationStepsViewed: $explanationStepsViewed
        validationStepsViewed: $validationStepsViewed
        lessonId: $lessonId
        userId: $userId
        status: $status
      }
      on_conflict: {
        constraint: users_lessons_status_pkey
        update_columns: [status, explanationStepsViewed, validationStepsViewed]
      }
    ) {
      returning {
        validationStepsViewed
        status
        lessonId
        userId
        explanationStepsViewed
      }
    }
  }
`;
