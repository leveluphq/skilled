import * as React from 'react';
import EmptySidebarPage from 'components/blocks/Loading/EmptySidebarPage';
import Head from 'components/blocks/Head';

export const TITLE = '';
export const LABEL = '';
export const RIGHT = true;

const LoadingLesson = () => {
  return (
    <>
      <Head title="Loading lesson..." />

      <EmptySidebarPage title={TITLE} label={LABEL} right={RIGHT} />
    </>
  );
};

export default LoadingLesson;
