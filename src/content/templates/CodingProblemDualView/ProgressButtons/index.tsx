import * as React from 'react';
import useButtonQueries from 'components/hooks/useButtonQueries';
import ProgressButtons from './ProgressButtons';
import { ButtonOwnProps } from '../props';

const ProgressButtonsContainer: React.FC<ButtonOwnProps> = (props) => {
  const {
    viewer,
    lesson,
    status,
    loading,
    error,
    insertLessonStatus,
    setFinishLessonStatus,
    nextLessonUrl,
  } = useButtonQueries(props.slug);

  return (
    <ProgressButtons
      viewer={viewer}
      lesson={lesson}
      status={status}
      loading={loading}
      error={error}
      nextLessonUrl={nextLessonUrl}
      insertLessonStatus={insertLessonStatus}
      setFinishLessonStatus={setFinishLessonStatus}
      {...props}
    />
  );
};

export default ProgressButtonsContainer;
