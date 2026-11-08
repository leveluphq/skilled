import { ApolloError } from '@apollo/client';
import { GetViewerQuery } from 'types/generated/client';
import { DisplayProduct } from 'utils/shared/products/buildDisplayProduct';

export interface Props {
  loading: boolean;
  data?: GetViewerQuery;
  error?: ApolloError;
  products: DisplayProduct[];
}

export interface CardProps {
  price: number;
  isDisabled: boolean;
  onClickBuy: () => void;
}
