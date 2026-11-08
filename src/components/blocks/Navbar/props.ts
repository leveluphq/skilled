import { ApolloError } from '@apollo/client';
import { GetViewerQuery } from 'types/generated/client';

export interface OwnProps {
  isFixed?: boolean;
  disableHeadroom?: boolean;
  hideContinue?: boolean;
  sidebar?: boolean;
  right?: boolean;
}

export interface Props extends OwnProps {
  loading: boolean;
  data?: GetViewerQuery;
  error?: ApolloError;
}

export interface AuthProps extends Props {
  handleFocus: () => void;
  handleBlur: () => void;
  show: boolean;
  isLoadingViewer: boolean;
  isFirstLoad: boolean;
}
