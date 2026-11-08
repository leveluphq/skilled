import * as React from 'react';
import useStaticViewerToken from 'components/hooks/useStaticViewerToken';
import {
  useInsertLessonStatusMutation,
  useGetLessonBySlugWithViewerQuery,
} from 'types/generated/client';
import { OwnProps } from './props';
import ActionBar from './ActionBar';

const IMMEDIATE = true;

const ActionBarContainer: React.FC<OwnProps> = ({ slug, ...props }) => {
  const viewerToken = useStaticViewerToken(IMMEDIATE);

  if (viewerToken && slug) {
    const [insertLessonStatus] = useInsertLessonStatusMutation();
    const { data, loading } = useGetLessonBySlugWithViewerQuery({
      variables: { slug: slug as string, userId: viewerToken },
    });

    return (
      <ActionBar
        {...props}
        data={data}
        loading={loading}
        slug={slug}
        insertLessonStatus={insertLessonStatus}
      />
    );
  } else {
    const [insertLessonStatus] = useInsertLessonStatusMutation();
    return (
      <ActionBar
        {...props}
        loading={!process.browser}
        slug={slug}
        insertLessonStatus={insertLessonStatus}
      />
    );
  }
};

export default ActionBarContainer;
