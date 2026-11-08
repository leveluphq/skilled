import { GetViewerQuery } from 'types/generated/client';
import { PageRoot } from 'utils/constants/routes';
import { getHasSubscription } from 'utils/client/lesson';

const EMPTY_SLUG = { href: '' };

const getActiveLessonSlug = (viewer: GetViewerQuery['users_by_pk'] | undefined) => {
  if (!getHasSubscription(viewer)) {
    return EMPTY_SLUG;
  }

  if (viewer && viewer.activeLesson && viewer.activeLesson.slug) {
    return {
      href: `/${PageRoot.Course}/${viewer.activeLesson.slug}`,
    };
  }

  // TODO: Where do I send them if they don't have an active lesson?
  // Will likely be determined if they have any statuses
  // Let the result of the function decide
  return EMPTY_SLUG;
};

export default getActiveLessonSlug;
