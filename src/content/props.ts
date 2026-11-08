import { GetLessonBySlugQuery, GetLessonBySlugWithViewerQuery } from 'types/generated/client';

export interface ContentProps {
  slug: string;
  hasLessonAccess: boolean;
  lesson: GetLessonBySlugQuery['lessons'][0];
  status?: GetLessonBySlugWithViewerQuery['users_lessons_status'][0];
  draft?: GetLessonBySlugWithViewerQuery['code_drafts'][0];
  toggleCodeEditor: () => void;
  isCodeEditorOpen: boolean;
  isFetchingUserLessonDetails: boolean;
}

export interface ExplanationProps {
  isComplete: boolean;
  explanationStepsViewed: number;
  isActiveSection: boolean;
  scrollRef?: any;
}

export interface ValidationProps {
  isComplete: boolean;
  validationStepsViewed: number;
  isActiveSection: boolean;
  scrollRef?: any;
}
