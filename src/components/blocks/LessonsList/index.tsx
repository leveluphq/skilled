import * as React from 'react';
import ViewerContext from 'components/context/ViewerContext';
import { publicCourse } from 'content/resources/publicCourse';
import { useGetCategoryLessonsWithViewerQuery } from 'types/generated/client';
import EmptySidebarPage from 'components/blocks/Loading/EmptySidebarPage';
import { TITLE, LABEL, RIGHT } from './Sidebar/Sidebar';
import LessonList from './LessonList';
import LessonListWithViewer from './LessonListWithViewer';

import { ErrorText } from './styles';

const ViewerLessonList: React.FC<{ viewerToken: string }> = ({ viewerToken }) => {
  const { data, error, loading } = useGetCategoryLessonsWithViewerQuery({
    variables: { userId: viewerToken },
  });

  if (loading || (!data && !error)) {
    return <EmptySidebarPage title={TITLE} label={LABEL} right={RIGHT} />;
  }

  if (error) {
    return <ErrorText>{`Error! ${error.message}`}</ErrorText>;
  }

  return <LessonListWithViewer data={data} />;
};

const LessonsContainer: React.FC = () => {
  const viewerToken = React.useContext(ViewerContext);

  if (viewerToken) {
    return <ViewerLessonList viewerToken={viewerToken} />;
  } else {
    return <LessonList data={publicCourse} />;
  }
};

export default LessonsContainer;
