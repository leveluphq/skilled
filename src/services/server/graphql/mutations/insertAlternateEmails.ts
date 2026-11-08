import { print } from 'graphql/language/printer';
import gql from 'graphql-tag';
import client from 'services/server/graphql/client';
import {
  InsertAlternateEmailsMutationVariables,
  InsertAlternateEmailsMutation,
} from 'types/generated/server';

const INSERT_ALTERNATE_EMAILS = gql`
  mutation insertAlternateEmails($emails: [alternate_emails_insert_input!]!) {
    insert_alternate_emails(
      objects: $emails
      on_conflict: { constraint: alternate_emails_userId_email_key, update_columns: updatedAt }
    ) {
      returning {
        id
        email
        userId
        source
      }
    }
  }
`;

const insertAlternateEmails = (variables: InsertAlternateEmailsMutationVariables) => {
  return client.request<InsertAlternateEmailsMutation>(print(INSERT_ALTERNATE_EMAILS), variables);
};

export default insertAlternateEmails;
