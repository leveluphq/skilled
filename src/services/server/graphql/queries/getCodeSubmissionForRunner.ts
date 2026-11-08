import { print } from 'graphql/language/printer';
import gql from 'graphql-tag';
import client from 'services/server/graphql/client';
import { GetCodeSubmissionForRunnerQuery } from 'types/generated/server';

// Everything needed to rebuild a submission's program and judge its result
// when Judge0 calls back
const GET_CODE_SUBMISSION_FOR_RUNNER = gql`
  query getCodeSubmissionForRunner($id: uuid!) {
    code_submissions_by_pk(id: $id) {
      id
      code
      language
      runnerVersion
      executionStatus
      lesson {
        slug
      }
    }
  }
`;

const getCodeSubmissionForRunner = async (id: string) => {
  const data = await client.request<GetCodeSubmissionForRunnerQuery>(
    print(GET_CODE_SUBMISSION_FOR_RUNNER),
    { id },
  );

  return data && data.code_submissions_by_pk;
};

export default getCodeSubmissionForRunner;
