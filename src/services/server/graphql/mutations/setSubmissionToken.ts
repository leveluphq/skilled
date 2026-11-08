import { print } from 'graphql/language/printer';
import gql from 'graphql-tag';
import client from 'services/server/graphql/client';
import {
  SetSubmissionTokenMutationVariables,
  SetSubmissionTokenMutation,
} from 'types/generated/server';

const SET_SUBMISSION_TOKEN = gql`
  mutation setSubmissionToken($id: uuid!, $codeRunnerToken: String!) {
    update_code_submissions_by_pk(
      _set: { codeRunnerToken: $codeRunnerToken }
      pk_columns: { id: $id }
    ) {
      id
      codeRunnerToken
    }
  }
`;

const setSubmissionToken = (variables: SetSubmissionTokenMutationVariables) => {
  return client.request<SetSubmissionTokenMutation>(print(SET_SUBMISSION_TOKEN), variables);
};

export default setSubmissionToken;
