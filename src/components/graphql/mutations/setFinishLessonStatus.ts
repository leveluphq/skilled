import gql from 'graphql-tag';

export const SET_FINISH_LESSON_STATUS = gql`
  mutation setFinishLessonStatus(
    $lessonId: uuid!
    $userId: String!
    $status: String!
    $confidence: Int!
  ) {
    update_users_lessons_status(
      _set: { status: $status, confidence: $confidence }
      where: { lessonId: { _eq: $lessonId }, userId: { _eq: $userId } }
    ) {
      returning {
        validationStepsViewed
        status
        explanationStepsViewed
        lessonId
        userId
      }
    }
  }
`;
