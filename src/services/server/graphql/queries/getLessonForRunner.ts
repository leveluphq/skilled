import { print } from 'graphql/language/printer';
import gql from 'graphql-tag';
import client from 'services/server/graphql/client';
import { GetLessonForRunnerQuery } from 'types/generated/server';

// What the code runner needs to know about a lesson before running code for it:
// its slug (which picks the tests) and who may see those tests
const GET_LESSON_FOR_RUNNER = gql`
  query getLessonForRunner($id: uuid!) {
    lessons_by_pk(id: $id) {
      id
      slug
      accessLevel
      status
    }
  }
`;

const getLessonForRunner = async (id: string) => {
  const data = await client.request<GetLessonForRunnerQuery>(print(GET_LESSON_FOR_RUNNER), { id });

  return data && data.lessons_by_pk;
};

export default getLessonForRunner;
