import { print } from 'graphql/language/printer';
import gql from 'graphql-tag';
import client from 'services/server/graphql/client';
import {
  UpdateCodeSubmissionResultsMutationVariables,
  UpdateCodeSubmissionResultsMutation,
} from 'types/generated/server';

// Only a submission that is still EXECUTING is updated, so the first result to
// arrive wins and a repeated Judge0 callback changes nothing. `affected_rows` is
// 0 when the submission doesn't exist or already has its result.
//
// Hasura sets a column to null when its variable isn't passed, so every column
// here is written on each call. Columns fixed at insert (runnerVersion) stay
// out of this mutation.
const UPDATE_CODE_SUBMISSION_RESULTS = gql`
  mutation updateCodeSubmissionResults(
    $id: uuid!
    $codeRunnerStatusDescription: String
    $codeRunnerStatusId: Int
    $compileOutput: String
    $compileOutputDecoded: String
    $diagnostics: jsonb
    $executionStatus: String
    $memory: numeric
    $message: String
    $messageDecoded: String
    $resultStatus: String
    $results: jsonb
    $stdout: String
    $stdoutDecoded: String
    $stderr: String
    $stderrDecoded: String
    $time: String
    $logs: String
  ) {
    update_code_submissions(
      where: { id: { _eq: $id }, executionStatus: { _eq: "EXECUTING" } }
      _set: {
        codeRunnerStatusDescription: $codeRunnerStatusDescription
        codeRunnerStatusId: $codeRunnerStatusId
        compileOutput: $compileOutput
        compileOutputDecoded: $compileOutputDecoded
        diagnostics: $diagnostics
        executionStatus: $executionStatus
        memory: $memory
        message: $message
        messageDecoded: $messageDecoded
        resultStatus: $resultStatus
        results: $results
        logs: $logs
        stdout: $stdout
        stdoutDecoded: $stdoutDecoded
        stderr: $stderr
        stderrDecoded: $stderrDecoded
        time: $time
      }
    ) {
      affected_rows
    }
  }
`;

const updateCodeSubmissionResults = (variables: UpdateCodeSubmissionResultsMutationVariables) => {
  return client.request<UpdateCodeSubmissionResultsMutation>(
    print(UPDATE_CODE_SUBMISSION_RESULTS),
    variables,
  );
};

export default updateCodeSubmissionResults;
