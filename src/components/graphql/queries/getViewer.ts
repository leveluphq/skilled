import gql from 'graphql-tag';
import { USER_AS_VIEWER_FRAGMENT } from 'components/graphql/fragments/userAsViewer';

export const GET_VIEWIER_QUERY = gql`
  query getViewer($id: String!) {
    users_by_pk(id: $id) {
      ...userAsViewer
    }
  }
  ${USER_AS_VIEWER_FRAGMENT}
`;
