import gql from 'graphql-tag';
import { USER_AS_VIEWER_FRAGMENT } from 'components/graphql/fragments/userAsViewer';

export const GET_AFFILIATE_VIEWIER_QUERY = gql`
  query getAffiliateViewer($id: String!) {
    users_by_pk(id: $id) {
      ...userAsViewer
      affiliateRevenueShare
      affiliateLinkClicks_aggregate(where: { affiliateUserId: { _eq: $id } }) {
        aggregate {
          count(columns: referralUrl)
        }
      }
      affiliateSales {
        id
        affiliateAmountEarned
        affiliateUserId
        amountPaid
        createdAt
        type
        updatedAt
      }
      affiliateReferralClickCounts {
        affiliateUserId
        count
        mostRecentDate
        referralUrl
      }
    }
  }
  ${USER_AS_VIEWER_FRAGMENT}
`;
