import { print } from 'graphql/language/printer';
import gql from 'graphql-tag';
import client from 'services/server/graphql/client';
import {
  ClaimCodeSubmissionRefreshMutation,
  ClaimCodeSubmissionRefreshMutationVariables,
} from 'types/generated/server';

// Lets one Judge0 lookup through for a run still waiting on its result, if no
// other has since `lastBefore`. The update changes nothing but
// the row's updatedAt, which its trigger sets, so updatedAt marks the last
// lookup. Concurrent calls can't both get through: `affected_rows` is 1 only
// for the one that touched the row.
const CLAIM_CODE_SUBMISSION_REFRESH = gql`
  mutation claimCodeSubmissionRefresh($id: uuid!, $lastBefore: timestamptz!) {
    update_code_submissions(
      where: {
        id: { _eq: $id }
        executionStatus: { _eq: "EXECUTING" }
        updatedAt: { _lt: $lastBefore }
      }
      _set: { executionStatus: "EXECUTING" }
    ) {
      affected_rows
    }
  }
`;

const claimCodeSubmissionRefresh = async (
  variables: ClaimCodeSubmissionRefreshMutationVariables,
) => {
  const data = await client.request<ClaimCodeSubmissionRefreshMutation>(
    print(CLAIM_CODE_SUBMISSION_REFRESH),
    variables,
  );

  return (data?.update_code_submissions?.affected_rows || 0) > 0;
};

export default claimCodeSubmissionRefresh;
