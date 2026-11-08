import { print } from 'graphql/language/printer';
import gql from 'graphql-tag';
import client from 'services/server/graphql/client';
import { Code_Submissions_Bool_Exp, CountCodeSubmissionsQuery } from 'types/generated/server';

// How many code runs match, and when the one `offset` runs back started, for
// rate limits (services/server/runner/runLimits.ts)
const COUNT_CODE_SUBMISSIONS = gql`
  query countCodeSubmissions($where: code_submissions_bool_exp!, $offset: Int!) {
    code_submissions_aggregate(where: $where) {
      aggregate {
        count
      }
    }
    code_submissions(where: $where, order_by: { createdAt: desc }, offset: $offset, limit: 1) {
      createdAt
    }
  }
`;

const countCodeSubmissions = async (where: Code_Submissions_Bool_Exp, offset: number) => {
  const data = await client.request<CountCodeSubmissionsQuery>(print(COUNT_CODE_SUBMISSIONS), {
    where,
    offset,
  });
  const aggregate =
    data && data.code_submissions_aggregate && data.code_submissions_aggregate.aggregate;
  const runs = (data && data.code_submissions) || [];

  return {
    count: (aggregate && aggregate.count) || 0,
    // The run at `offset`, newest first: the oldest of the last offset + 1
    startedAt: runs.length ? new Date(runs[0].createdAt) : null,
  };
};

export default countCodeSubmissions;
