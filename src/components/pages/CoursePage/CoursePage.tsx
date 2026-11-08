import * as React from 'react';
import { NextPage } from 'next';
import PageWithSidebar from 'components/pages/PageLayout/PageWithSidebar';
import LessonList from 'components/blocks/LessonsList';
import AuthCard from 'components/blocks/AuthCard';
import LanguageGuideLinks from 'components/blocks/LanguageGuideLinks/LanguageGuideLinks';
import useSmoothScrollLinks from 'components/hooks/useSmoothScrollLinks';

import { AuthCardWrapper } from './styles';

const CoursePage: NextPage = () => {
  useSmoothScrollLinks();

  return (
    <PageWithSidebar right>
      <AuthCard Wrapper={AuthCardWrapper} />
      <LessonList />
      <LanguageGuideLinks />
    </PageWithSidebar>
  );
};

export default CoursePage;
