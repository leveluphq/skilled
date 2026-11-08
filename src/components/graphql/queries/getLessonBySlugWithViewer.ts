import gql from 'graphql-tag';
import { USER_AS_VIEWER_FRAGMENT } from 'components/graphql/fragments/userAsViewer';

export const GET_LESSON_BY_SLUG_WITH_VIEWER_QUERY = gql`
  query getLessonBySlugWithViewer($slug: String!, $userId: String!) {
    lessons(where: { slug: { _eq: $slug }, status: { _eq: "ACTIVE" } }) {
      title
      slug
      position
      id
      description
      accessLevel
      introductionVideoUrl
      type
      metaTitle
      metaDescription
      status
      category {
        title
        slug
        id
      }
    }
    users_by_pk(id: $userId) {
      ...userAsViewer
    }
    users_lessons_status(where: { lesson: { slug: { _eq: $slug } }, userId: { _eq: $userId } }) {
      status
      explanationStepsViewed
      validationStepsViewed
      confidence
      lessonId
      userId
      notes
    }
    code_drafts(where: { lesson: { slug: { _eq: $slug } }, userId: { _eq: $userId } }) {
      code
      createdAt
      id
      language
      lessonId
      updatedAt
      userId
    }
  }
  ${USER_AS_VIEWER_FRAGMENT}
`;
