import { GetCategoryLessonsQuery, GetCategoryLessonsWithViewerQuery } from 'types/generated/client';
import { LessonStatus, Statuses } from 'utils/constants/lesson';
import { BasePalette } from 'style/theme';

export type Lessons = GetCategoryLessonsQuery['categories'][0]['lessons'];

export interface Props {
  data?: GetCategoryLessonsQuery;
}

export interface PropsWithViewer {
  data?: GetCategoryLessonsWithViewerQuery;
}

export enum Tabs {
  All = 'All',
  Pending = 'Pending',
  NeedsReview = 'Review',
  Complete = 'Complete',
}

export const TABS = {
  [Tabs.All]: {
    text: Tabs.All,
    color: BasePalette.Button,
    getActiveLessons: (lessons: Lessons = []) => lessons,
  },
  [Tabs.Pending]: {
    text: Tabs.Pending,
    color: BasePalette.Orange,
    getActiveLessons: (lessons: Lessons = [], statuses: Statuses) =>
      lessons.filter(lesson => {
        const status = statuses[lesson.id];
        return !status || status === LessonStatus.Init || status === LessonStatus.InProgress;
      }),
  },
  [Tabs.NeedsReview]: {
    text: Tabs.NeedsReview,
    color: BasePalette.Red,
    getActiveLessons: (lessons: Lessons = [], statuses: Statuses) =>
      lessons.filter(lesson => {
        const status = statuses[lesson.id];
        return status === LessonStatus.NeedsReview;
      }),
  },
  [Tabs.Complete]: {
    text: Tabs.Complete,
    color: BasePalette.Green,
    getActiveLessons: (lessons: Lessons = [], statuses: Statuses) =>
      lessons.filter(lesson => {
        const status = statuses[lesson.id];
        return status === LessonStatus.Complete;
      }),
  },
};
