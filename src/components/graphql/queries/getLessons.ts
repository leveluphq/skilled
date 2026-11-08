import gql from 'graphql-tag';

export const GET_LESSONS_QUERY = gql`
  query getLessons {
    lessons(
      order_by: { position: asc }
      where: { position: { _is_null: false }, status: { _eq: "ACTIVE" } }
    ) {
      id
      title
      slug
      position
      description
      accessLevel
      introductionVideoUrl
    }
  }
`;
