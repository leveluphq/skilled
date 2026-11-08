import gql from 'graphql-tag';
import { USER_AS_VIEWER_FRAGMENT } from 'components/graphql/fragments/userAsViewer';

export const GET_USER_SETTINGS = gql`
  query getUserSettings($id: String!) {
    users_by_pk(id: $id) {
      ...userAsViewer
      theme
      affiliateId
      createdAt
      email
      id
      name
      role
      preferredCodingLanguage
      registrationSource
      fullCourseAccessEndsAt
      fullCourseAccessLatestUpgradedAt
      fullCourseAccessFirstUpgradedAt
      activeLesson {
        id
        slug
        title
        description
      }
      sentGiftCards(where: { status: { _eq: "ISSUED" } }) {
        id
        giftNote
        creditAmountDollars
        productAccessDays
        productDescription
        productName
        productType
        receiverEmail
        status
        code
      }
      receivedGiftCards(where: { status: { _eq: "ISSUED" } }) {
        id
        giftNote
        creditAmountDollars
        productAccessDays
        productDescription
        productName
        productType
        receiverEmail
        status
        code
      }
      redeemedGiftCards(where: { status: { _eq: "REDEEMED" } }) {
        id
        giftNote
        creditAmountDollars
        productAccessDays
        productDescription
        productName
        productType
        receiverEmail
        status
        code
        redeemedAt
      }
    }
  }
  ${USER_AS_VIEWER_FRAGMENT}
`;
