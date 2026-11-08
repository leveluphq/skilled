import { Users_Lessons_Status } from 'types/generated/client';
import { Statuses } from 'utils/constants/lesson';

type Func = (lessonStatuses: Partial<Users_Lessons_Status>[]) => Statuses;

const buildUserLessonStatus: Func = lessonStatuses => {
  return lessonStatuses.reduce((acc: Statuses, curr: Partial<Users_Lessons_Status>) => {
    return {
      ...acc,
      [curr.lessonId]: curr.status,
    };
  }, {});
};

export default buildUserLessonStatus;
