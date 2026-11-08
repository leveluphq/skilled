import { NextApiRequest } from 'next';
import { print } from 'graphql/language/printer';
import gql from 'graphql-tag';
import client from 'services/server/graphql/client';
import { GetLessonVideoIdByIdQuery } from 'types/generated/server';

const GET_LESSON_VIDEO_ID_BY_ID = gql`
  query getLessonVideoIdById($id: uuid!) {
    lessons_by_pk(id: $id) {
      id
      accessLevel
      solutionVideoUrl
    }
  }
`;

const getLessonVideoIdById = async (req: NextApiRequest) => {
  const { id } = req.query;

  if (!id) {
    return null;
  }

  const data = await client.request<GetLessonVideoIdByIdQuery>(print(GET_LESSON_VIDEO_ID_BY_ID), {
    id,
  });

  return data && data.lessons_by_pk;
};

export default getLessonVideoIdById;
