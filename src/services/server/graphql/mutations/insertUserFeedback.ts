import { print } from 'graphql/language/printer';
import gql from 'graphql-tag';
import client from 'services/server/graphql/client';
import {
  InsertUserFeedbackMutationVariables,
  InsertUserFeedbackMutation,
} from 'types/generated/server';

const INSERT_USER_FEEDBACK_MUTATION = gql`
  mutation insertUserFeedback(
    $email: String
    $feedback: String!
    $ip: String!
    $name: String
    $url: String!
    $userId: String
  ) {
    insert_user_feedback(
      objects: {
        email: $email
        feedback: $feedback
        ip: $ip
        name: $name
        url: $url
        userId: $userId
      }
    ) {
      returning {
        id
      }
    }
  }
`;

const insertUserFeedbackMutation = print(INSERT_USER_FEEDBACK_MUTATION);

const insertUserFeedback = (variables: InsertUserFeedbackMutationVariables) => {
  return client.request<InsertUserFeedbackMutation>(insertUserFeedbackMutation, variables);
};

export default insertUserFeedback;
