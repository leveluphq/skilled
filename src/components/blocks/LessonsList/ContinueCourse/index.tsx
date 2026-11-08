import * as React from 'react';
import ViewerContext from 'components/context/ViewerContext';
import { useGetViewerQuery } from 'types/generated/client';
import { OwnProps } from './props';
import ContinueCourse from './ContinueCourse';

const ContinueCourseContainer: React.FC<OwnProps> = props => {
  const viewerToken = React.useContext(ViewerContext);

  if (viewerToken) {
    const { data, loading, error } = useGetViewerQuery({ variables: { id: viewerToken } });
    return <ContinueCourse loading={loading} error={error} data={data} {...props} />;
  } else {
    return <ContinueCourse loading={false} {...props} />;
  }
};

export default ContinueCourseContainer;
