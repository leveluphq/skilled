import gql from 'graphql-tag';

export const SET_ACTIVE_LESSON_MUTATION = gql`
  mutation setActiveLesson($userId: String!, $lessonId: uuid!) {
    update_users(where: { id: { _eq: $userId } }, _set: { activeLessonId: $lessonId }) {
      returning {
        id
        activeLesson {
          id
          slug
        }
      }
    }
  }
`;
