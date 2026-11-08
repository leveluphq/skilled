import { print } from 'graphql/language/printer';
import gql from 'graphql-tag';
import client from 'services/server/graphql/client';
import { GetLessonBySlugQuery } from 'types/generated/server';

const GET_LESSON_BY_SLUG = gql`
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

const getLessonBySlug = async (slug: String) => {
  const data = await client.request<GetLessonBySlugQuery>(print(GET_LESSON_BY_SLUG), {
    slug,
  });

  return data?.lessons[0];
};

export default getLessonBySlug;
