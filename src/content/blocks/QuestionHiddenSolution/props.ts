import * as React from 'react';
import { ApolloError } from '@apollo/client';
import { GetLessonBySlugWithViewerQuery } from 'types/generated/client';

export interface OwnProps {
  introduction: React.ReactNode;
  solution: React.ReactNode;
  slug: string;
  isDefaultOpen?: boolean;
}

export interface Props extends OwnProps {
  loading: boolean;
  data?: GetLessonBySlugWithViewerQuery;
  error?: ApolloError;
}
