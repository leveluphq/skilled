import { print } from 'graphql/language/printer';
import gql from 'graphql-tag';
import client from 'services/server/graphql/client';
import {
  InsertAffiliateLinkClickMutationVariables,
  InsertAffiliateLinkClickMutation,
} from 'types/generated/server';

const INSERT_AFFILIATE_LINK_CLICK = gql`
  mutation insertAffiliateLinkClick(
    $referralUrl: String!
    $ip: String!
    $destinationPagePath: String!
    $affiliateUserId: String
    $affiliateIdUsed: String!
  ) {
    insert_affiliate_link_clicks_one(
      object: {
        referralUrl: $referralUrl
        ip: $ip
        destinationPagePath: $destinationPagePath
        affiliateUserId: $affiliateUserId
        affiliateIdUsed: $affiliateIdUsed
      }
    ) {
      id
    }
  }
`;

const insertAffiliateLinkClick = (variables: InsertAffiliateLinkClickMutationVariables) => {
  return client.request<InsertAffiliateLinkClickMutation>(
    print(INSERT_AFFILIATE_LINK_CLICK),
    variables,
  );
};

export default insertAffiliateLinkClick;
