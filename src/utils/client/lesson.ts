import { Lessons, GetLessonBySlugWithViewerQuery, GetLessonsQuery } from 'types/generated/client';
import { LessonAccessLevel } from 'utils/constants/lesson';
import { LinkProps, EMPTY_LINK_PROPS } from 'utils/constants/http';
import { PageRoot } from 'utils/constants/routes';
import {
  TEST_SHOW_ALL_CONTENT,
  IS_FULL_COURSE_FREE,
  IS_LIFETIME_ACCESS,
  OPEN_ALL_LESSONS,
} from 'utils/constants/payments';

export type Viewer = GetLessonBySlugWithViewerQuery['users_by_pk'];
export type Lesson = GetLessonBySlugWithViewerQuery['lessons'][0] | undefined;

interface ViewerWithSubscriptions {
  fullCourseAccessEndsAt?: string | null;
}

type MaybeViewerWithSubscriptions = ViewerWithSubscriptions | undefined | null;

export const isInsideDateRange = (date: string) => {
  return Date.now() < new Date(date).getTime();
};

// NOTE: Subscriptions are now deprecated
const getAccessForAll = (viewer: MaybeViewerWithSubscriptions) => {
  return !!viewer && IS_FULL_COURSE_FREE;
};

export const getHasSubscription = (viewer: MaybeViewerWithSubscriptions) => {
  return (
    TEST_SHOW_ALL_CONTENT ||
    getAccessForAll(viewer) ||
    (!!viewer &&
      !!viewer.fullCourseAccessEndsAt &&
      (isInsideDateRange(viewer.fullCourseAccessEndsAt) || IS_LIFETIME_ACCESS))
  );
};

export const getHasLessonAccess = (
  lesson: Pick<Lessons, 'accessLevel'> | undefined | null,
  viewer: MaybeViewerWithSubscriptions,
) => {
  // The run-code and solution video routes check access here too, so this
  // opens a lesson on the server as well as in the page
  if (TEST_SHOW_ALL_CONTENT || OPEN_ALL_LESSONS) {
    return true;
  }

  if (!lesson) {
    return false;
  }

  const hasSubscription = getHasSubscription(viewer);
  const isPublicLesson = lesson.accessLevel === LessonAccessLevel.Free;
  const isFreeForUsers = !!viewer && lesson.accessLevel === LessonAccessLevel.Trial;

  return hasSubscription || isPublicLesson || isFreeForUsers;
};

const COURSE_COMPLETE_URL: LinkProps = {
  href: `/${PageRoot.Course}?course_status=complete`,
  text: 'Course Complete',
};

const urlFromSlug = (slug: string | undefined, defaultLink: LinkProps, text: string) => {
  return slug ? { href: `/${PageRoot.Course}/${slug}`, text } : defaultLink;
};

export const findLessonBySlug = (lessons: GetLessonsQuery['lessons'] = [], slug: string) => {
  for (let i = 0; i < lessons.length; i++) {
    const lesson = lessons[i];

    if (lesson.slug === slug) {
      return { lesson, index: i };
    }
  }

  return { lesson: null, index: -1 };
};

export const findPreviousLessonUrl = ({ lessons = [] }: GetLessonsQuery, slug: string) => {
  const { lesson, index } = findLessonBySlug(lessons, slug);

  if (!lesson) {
    return EMPTY_LINK_PROPS;
  }

  const previousLesson = lessons[index - 1] || {};
  const previousLessonUrl = urlFromSlug(
    previousLesson.slug,
    EMPTY_LINK_PROPS,
    previousLesson.title,
  );

  return previousLessonUrl;
};

export const findNextLessonUrl = ({ lessons = [] }: GetLessonsQuery, slug: string) => {
  const { lesson, index } = findLessonBySlug(lessons, slug);

  if (!lesson) {
    return EMPTY_LINK_PROPS;
  }

  const nextLesson = lessons[index + 1] || {};
  const nextLessonUrl = urlFromSlug(nextLesson.slug, COURSE_COMPLETE_URL, nextLesson.title);

  return nextLessonUrl;
};
