import useStaticViewerToken from 'components/hooks/useStaticViewerToken';
import {
  useGetLessonBySlugWithViewerQuery,
  useGetLessonBySlugQuery,
  useInsertLessonStatusMutation,
  useSetFinishLessonStatusMutation,
  useGetLessonsQuery,
} from 'types/generated/client';
import { findNextLessonUrl } from 'utils/client/lesson';
import { EMPTY_LINK_PROPS } from 'utils/constants/http';

const useButtonQueries = (slug: string) => {
  const viewerToken = useStaticViewerToken();
  const [insertLessonStatus] = useInsertLessonStatusMutation();
  const [setFinishLessonStatus] = useSetFinishLessonStatusMutation();
  const { data: lessonsData } = useGetLessonsQuery();

  if (viewerToken) {
    const { data, error, loading } = useGetLessonBySlugWithViewerQuery({
      variables: { slug, userId: viewerToken },
    });
    let nextLessonUrl = EMPTY_LINK_PROPS;

    if (lessonsData && lessonsData.lessons) {
      nextLessonUrl = findNextLessonUrl(lessonsData, slug);
    }

    const viewer = data && data.users_by_pk;
    const lesson = data && data.lessons[0];
    const status = data && data.users_lessons_status[0];

    return {
      viewer,
      lesson,
      status,
      loading,
      error,
      insertLessonStatus,
      setFinishLessonStatus,
      nextLessonUrl,
    };
  } else {
    const { data, error, loading } = useGetLessonBySlugQuery({
      variables: { slug },
    });
    let nextLessonUrl = EMPTY_LINK_PROPS;

    if (lessonsData && lessonsData.lessons) {
      nextLessonUrl = findNextLessonUrl(lessonsData, slug);
    }

    const lesson = data && data.lessons[0];

    return {
      lesson,
      viewer: undefined,
      status: undefined,
      loading,
      error,
      insertLessonStatus: undefined,
      setFinishLessonStatus: undefined,
      nextLessonUrl,
    };
  }
};

export default useButtonQueries;
