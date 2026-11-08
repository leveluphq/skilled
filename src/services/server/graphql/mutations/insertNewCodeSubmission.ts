import { print } from 'graphql/language/printer';
import gql from 'graphql-tag';
import client from 'services/server/graphql/client';
import {
  InsertNewCodeSubmissionMutationVariables,
  InsertNewCodeSubmissionMutation,
} from 'types/generated/server';

const INSERT_NEW_CODE_SUBMISSION = gql`
  mutation insertNewCodeSubmission(
    $code: String = ""
    $tests: String = ""
    $validator: String = ""
    $executionStatus: String!
    $language: String!
    $lessonId: uuid!
    $userId: String
    $runnerVersion: String
    $ipHash: String
    $environment: String!
  ) {
    insert_code_submissions(
      objects: {
        code: $code
        tests: $tests
        validator: $validator
        executionStatus: $executionStatus
        language: $language
        lessonId: $lessonId
        userId: $userId
        runnerVersion: $runnerVersion
        ipHash: $ipHash
        environment: $environment
      }
    ) {
      returning {
        id
      }
    }
  }
`;

const insertNewCodeSubmission = (variables: InsertNewCodeSubmissionMutationVariables) => {
  return client.request<InsertNewCodeSubmissionMutation>(
    print(INSERT_NEW_CODE_SUBMISSION),
    variables,
  );
};

export default insertNewCodeSubmission;
