import * as React from 'react';
import { useGetLessonsQuery } from 'types/generated/client';
import { findNextLessonUrl, findPreviousLessonUrl } from 'utils/client/lesson';
import { EMPTY_LINK_PROPS } from 'utils/constants/http';
import NavigateCourseButtons from './NavigateCourseButtons';
import { OwnProps } from './props';

const NavigateCourseButtonsWrapper: React.FC<OwnProps> = (props) => {
  let previousLessonUrl = EMPTY_LINK_PROPS;
  let nextLessonUrl = EMPTY_LINK_PROPS;
  const activeLessonSlug = props.slug;
  const { data } = useGetLessonsQuery();

  if (data && data.lessons && typeof activeLessonSlug === 'string') {
    previousLessonUrl = findPreviousLessonUrl(data, activeLessonSlug);
  }

  if (data && data.lessons && typeof activeLessonSlug === 'string') {
    nextLessonUrl = findNextLessonUrl(data, activeLessonSlug);
  }

  return (
    <NavigateCourseButtons
      {...props}
      previousLessonUrl={previousLessonUrl}
      nextLessonUrl={nextLessonUrl}
    />
  );
};

export default NavigateCourseButtonsWrapper;
