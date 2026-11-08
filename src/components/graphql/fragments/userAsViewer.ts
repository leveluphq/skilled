import gql from 'graphql-tag';

export const USER_AS_VIEWER_FRAGMENT = gql`
  fragment userAsViewer on users {
    id
    preferredCodingLanguage
    registrationSource
    role
    theme
    name
    email
    fullCourseAccessEndsAt
    fullCourseAccessLatestUpgradedAt
    fullCourseAccessFirstUpgradedAt
    affiliateId
    affiliateStatus
    activeLesson {
      id
      slug
      title
      description
    }
  }
`;
