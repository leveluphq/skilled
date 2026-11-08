import gql from 'graphql-tag';
import { USER_AS_VIEWER_FRAGMENT } from 'components/graphql/fragments/userAsViewer';

export const CATEGORY_LESSONS_FRAGMENT = gql`
  fragment categoryLessons on categories {
    id
    position
    previewVideo
    title
    description
    slug
    lessons(
      order_by: { position: asc }
      where: { position: { _is_null: false }, status: { _eq: "ACTIVE" } }
    ) {
      accessLevel
      description
      position
      slug
      title
      type
      id
    }
  }
`;

export const GET_CATEGORY_LESSONS_QUERY = gql`
  query getCategoryLessons {
    categories(order_by: { position: asc }) {
      ...categoryLessons
    }
    ${CATEGORY_LESSONS_FRAGMENT}
  }
`;

export const GET_CATEGORY_LESSONS_WITH_VIEWER_QUERY = gql`
  query getCategoryLessonsWithViewer($userId: String!) {
    categories(order_by: { position: asc }) {
      ...categoryLessons
    }
    users_lessons_status(where: { userId: { _eq: $userId } }) {
      explanationStepsViewed
      validationStepsViewed
      status
      lessonId
      userId
      notes
    }
    users_by_pk(id: $userId) {
      ...userAsViewer
    }
    ${CATEGORY_LESSONS_FRAGMENT}
    ${USER_AS_VIEWER_FRAGMENT}
  }
`;
