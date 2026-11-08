import { NextApiRequest } from 'next';
import { print } from 'graphql/language/printer';
import gql from 'graphql-tag';
import { getValidViewerId } from 'utils/server/jwt';
import client from 'services/server/graphql/client';
import { GetViewerByIdQuery } from 'types/generated/server';

const GET_VIEWER_BY_ID = gql`
  query getViewerById($id: String!) {
    users_by_pk(id: $id) {
      id
      email
      role
      stripeCustomerId
      fullCourseAccessEndsAt
      fullCourseAccessLatestUpgradedAt
      fullCourseAccessFirstUpgradedAt
    }
  }
`;

const getViewerById = async (req: NextApiRequest) => {
  const viewerId = getValidViewerId(req);

  if (!viewerId) {
    return null;
  }

  const data = await client.request<GetViewerByIdQuery>(print(GET_VIEWER_BY_ID), {
    id: viewerId,
  });

  return data && data.users_by_pk;
};

export default getViewerById;
