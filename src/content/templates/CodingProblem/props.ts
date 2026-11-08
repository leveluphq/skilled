import { ApolloError } from '@apollo/client';
import { GetLessonBySlugWithViewerQuery } from 'types/generated/client';
import {
  InsertLessonStatusMutationHookResult,
  SetFinishLessonStatusMutationHookResult,
} from 'types/generated/client';
import { ProblemRefs } from 'components/hooks/useProblemScroller';
import { Lesson, Viewer } from 'utils/client/lesson';
import { LinkProps } from 'utils/constants/http';

export interface ScrollerProps {
  setActiveRef: (activeRef: ProblemRefs | null) => void;
  toggleTray: () => void;
  isComplete?: boolean;
}

export interface ButtonOwnProps {
  isComplete: boolean;
  hasStartedLesson: boolean;
  slug: string;
  explanationStepsViewed: number;
  validationStepsViewed: number;
  totalExplanationSteps: number;
  totalValidationSteps: number;
  incrementExplanationStep: (event: React.MouseEvent<HTMLButtonElement>) => void;
  incrementValidationStep: (event: React.MouseEvent<HTMLButtonElement>) => void;
  setQuestionComplete: (event: React.MouseEvent<HTMLButtonElement>) => void;
  toggleTray: () => void;
  scrollToSolution: () => void;
  toggleCodeEditor: () => void;
}

export type Status = GetLessonBySlugWithViewerQuery['users_lessons_status'][0] | undefined;

export interface ButtonProps extends ButtonOwnProps {
  viewer: Viewer;
  lesson: Lesson;
  status?: Status;
  loading: boolean;
  error?: ApolloError;
  nextLessonUrl: LinkProps;
  insertLessonStatus?: InsertLessonStatusMutationHookResult[0];
  setFinishLessonStatus?: SetFinishLessonStatusMutationHookResult[0];
}

export interface CallbackParams {
  viewer: Viewer;
  lesson: Lesson;
  status?: Status;
  loading: boolean;
  error?: ApolloError;
  authCallback: () => void;
  actionCallback: (event: React.MouseEvent<HTMLButtonElement>) => void;
  insertLessonStatus?: InsertLessonStatusMutationHookResult[0];
  explanationStepsViewed: number;
  validationStepsViewed: number;
}

export interface TextParams {
  isComplete?: boolean;
  viewedCount: number;
}
