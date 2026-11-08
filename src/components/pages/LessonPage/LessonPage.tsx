import * as React from 'react';
import throw404 from 'utils/client/throw404';
import { LessonStatus, CodingLanguage } from 'utils/constants/lesson';
import { getHasLessonAccess } from 'utils/client/lesson';
import useCodingLanguage from 'components/hooks/useCodingLanguage';
import { GetLessonBySlugWithViewerQuery } from 'types/generated/client';
import { LessonProps } from './props';

function instanceOfHasViewer(obj: any): obj is GetLessonBySlugWithViewerQuery {
  return !!obj && 'users_by_pk' in obj;
}

const getCodeDraft = (
  language: CodingLanguage,
  drafts: GetLessonBySlugWithViewerQuery['code_drafts'] = [],
) => {
  const draft = drafts.find((d) => d.language === language);
  return draft;
};

const LessonPage: React.FC<LessonProps> = ({
  data,
  lesson,
  Component,
  insertLessonStatus,
  setActiveLesson,
  toggleCodeEditor,
  isCodeEditorOpen,
  isFetchingUserLessonDetails,
}) => {
  if (!lesson || !Component) {
    return throw404();
  }

  const { language } = useCodingLanguage();
  const dataHasViewer = instanceOfHasViewer(data);
  const viewer = dataHasViewer ? data?.users_by_pk : null;
  const status = dataHasViewer ? data?.users_lessons_status[0] : undefined;
  const draft = dataHasViewer ? getCodeDraft(language, data?.code_drafts) : undefined;
  const { slug } = lesson;
  const hasLessonAccess = getHasLessonAccess(lesson, viewer);

  React.useEffect(() => {
    if (!viewer || !lesson) {
      return;
    }

    if (!status) {
      insertLessonStatus({
        variables: {
          userId: viewer.id,
          lessonId: lesson.id,
          status: LessonStatus.Init,
          explanationStepsViewed: 0,
          validationStepsViewed: 0,
        },
      });
    }

    setActiveLesson({
      variables: {
        userId: viewer.id,
        lessonId: lesson.id,
      },
    });
  }, [lesson, viewer, status, slug]);

  return (
    <Component
      hasLessonAccess={hasLessonAccess}
      slug={lesson.slug}
      lesson={lesson}
      status={status}
      draft={draft}
      isFetchingUserLessonDetails={isFetchingUserLessonDetails}
      toggleCodeEditor={toggleCodeEditor}
      isCodeEditorOpen={isCodeEditorOpen}
    />
  );
};

export default LessonPage;
