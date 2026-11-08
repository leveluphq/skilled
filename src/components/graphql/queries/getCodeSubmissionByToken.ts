import gql from 'graphql-tag';

export const GET_CODE_SUBMISSION_BY_TOKEN = gql`
  query getCodeSubmissionByToken($codeRunnerToken: String!) {
    code_submissions(
      where: { codeRunnerToken: { _eq: $codeRunnerToken }, executionStatus: { _neq: "EXECUTING" } }
      limit: 1
    ) {
      code
      codeRunnerStatusDescription
      codeRunnerStatusId
      codeRunnerToken
      compileOutput
      compileOutputDecoded
      createdAt
      diagnostics
      environment
      executionStatus
      id
      language
      memory
      message
      messageDecoded
      resultStatus
      results
      runnerVersion
      logs
      stderr
      stderrDecoded
      stdout
      stdoutDecoded
      tests
      time
      validator
    }
  }
`;
