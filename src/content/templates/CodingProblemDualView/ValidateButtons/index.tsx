import * as React from 'react';
import useButtonQueries from 'components/hooks/useButtonQueries';
import ValidateButtons from './ValidateButtons';
import { ButtonOwnProps } from '../props';

const ValidateButtonsContainer: React.FC<ButtonOwnProps> = (props) => {
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
    <ValidateButtons
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

export default ValidateButtonsContainer;
