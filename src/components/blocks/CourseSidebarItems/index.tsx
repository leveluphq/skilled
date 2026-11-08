import * as React from 'react';
import ViewerContext from 'components/context/ViewerContext';
import { publicCourse } from 'content/resources/publicCourse';
import { useGetCategoryLessonsWithViewerQuery } from 'types/generated/client';
import buildUserLessonStatus from 'utils/client/buildUserLessonStatus';
import { Statuses } from 'utils/constants/lesson';
import { OwnProps } from './props';
import CourseSidebarItems from './CourseSidebarItems';

const ViewerCourseSidebarItems: React.FC<OwnProps & { viewerId: string }> = ({
  viewerId,
  ...props
}) => {
  const { data, error, loading } = useGetCategoryLessonsWithViewerQuery({
    variables: { userId: viewerId },
  });

  if (loading) {
    return null;
  }

  if (error || !data) {
    return null;
  }

  const { categories, users_lessons_status } = data;
  const statuses: Statuses = buildUserLessonStatus(users_lessons_status);

  return <CourseSidebarItems categories={categories} statuses={statuses} {...props} />;
};

const CourseSidebarItemsContainer: React.FC<OwnProps> = (props) => {
  const viewerId = React.useContext(ViewerContext);

  if (viewerId) {
    return <ViewerCourseSidebarItems viewerId={viewerId} {...props} />;
  } else {
    return <CourseSidebarItems categories={publicCourse.categories} statuses={{}} {...props} />;
  }
};

export default CourseSidebarItemsContainer;
