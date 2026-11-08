import { ApolloError } from '@apollo/client';
import { GetViewerQuery } from 'types/generated/client';

export interface Props {
  loading: boolean;
  data?: GetViewerQuery;
  error?: ApolloError;
}
