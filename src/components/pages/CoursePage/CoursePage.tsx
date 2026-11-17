import * as React from 'react';
import { NextPage } from 'next';
import PageWithSidebar from 'components/pages/PageLayout/PageWithSidebar';
import LessonList from 'components/blocks/LessonsList';
import CourseHeader from 'components/blocks/LessonsList/Title';
import AuthCard from 'components/blocks/AuthCard';
import LanguageGuideLinks from 'components/blocks/LanguageGuideLinks/LanguageGuideLinks';
import useSmoothScrollLinks from 'components/hooks/useSmoothScrollLinks';

import { Container } from 'style/elements';
import { AuthCardWrapper } from './styles';

const CoursePage: NextPage = () => {
  useSmoothScrollLinks();

  return (
    <PageWithSidebar right>
      <Container>
        <CourseHeader />
        <AuthCard Wrapper={AuthCardWrapper} />
      </Container>
      <LessonList />
      <LanguageGuideLinks />
    </PageWithSidebar>
  );
};

export default CoursePage;
