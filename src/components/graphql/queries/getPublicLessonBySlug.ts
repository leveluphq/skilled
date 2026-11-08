import gql from 'graphql-tag';

export const GET_LESSON_BY_SLUG_QUERY = gql`
  query getLessonBySlug($slug: String!) {
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
        id
        title
        slug
      }
    }
  }
`;
