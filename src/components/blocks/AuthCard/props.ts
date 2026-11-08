import { ApolloError } from '@apollo/client';
import { GetViewerQuery } from 'types/generated/client';

export interface OwnProps {
  Wrapper: React.ComponentType<any>;
}

export interface Props extends OwnProps {
  loading: boolean;
  data?: GetViewerQuery;
  error?: ApolloError;
}
