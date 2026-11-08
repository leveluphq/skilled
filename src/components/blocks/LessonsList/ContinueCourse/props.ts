import { ApolloError } from '@apollo/client';
import { GetViewerQuery } from 'types/generated/client';
import { Statuses } from 'utils/constants/lesson';

export interface OwnProps {
  statuses: Statuses;
}

export interface Props extends OwnProps {
  loading: boolean;
  data?: GetViewerQuery;
  error?: ApolloError;
}
