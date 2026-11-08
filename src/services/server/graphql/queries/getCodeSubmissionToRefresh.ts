import { print } from 'graphql/language/printer';
import gql from 'graphql-tag';
import client from 'services/server/graphql/client';
import { GetCodeSubmissionToRefreshQuery } from 'types/generated/server';

// A run the editor is still waiting on, found by the token it polls with, with
// what's needed to judge its result
const GET_CODE_SUBMISSION_TO_REFRESH = gql`
  query getCodeSubmissionToRefresh($codeRunnerToken: String!) {
    code_submissions(where: { codeRunnerToken: { _eq: $codeRunnerToken } }, limit: 1) {
      id
      userId
      code
      language
      runnerVersion
      executionStatus
      createdAt
      lesson {
        slug
      }
    }
  }
`;

const getCodeSubmissionToRefresh = async (codeRunnerToken: string) => {
  const data = await client.request<GetCodeSubmissionToRefreshQuery>(
    print(GET_CODE_SUBMISSION_TO_REFRESH),
    {
      codeRunnerToken,
    },
  );

  return data && data.code_submissions[0];
};

export default getCodeSubmissionToRefresh;
