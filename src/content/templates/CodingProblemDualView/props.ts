import { ApolloError } from '@apollo/client';
import { GetLessonBySlugWithViewerQuery } from 'types/generated/client';
import {
  InsertLessonStatusMutationHookResult,
  SetFinishLessonStatusMutationHookResult,
} from 'types/generated/client';
import { ProblemRefs } from 'components/hooks/useProblemScroller';
import { Lesson, Viewer } from 'utils/client/lesson';
import { LinkProps } from 'utils/constants/http';
import { ContentProps } from 'content/props';
import { VideoDetails, CodeSnippetGenerator } from 'utils/constants/lesson';

export interface Props extends ContentProps {
  Introduction: React.FC;
  QuestionStatement: React.FC;
  Solution: React.FC;
  LearningOutcomes: React.FC | null;
  validationItems: React.FC[];
  explanationItems: React.FC[];
  getUserAnswer: CodeSnippetGenerator;
  getTests: CodeSnippetGenerator;
  getSolutionCode: CodeSnippetGenerator;
  video: VideoDetails;
}

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
  overrideAccessSetting?: boolean;
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
  overrideAccessSetting?: boolean;
}

export interface TextParams {
  isComplete?: boolean;
  viewedCount: number;
}

export enum LeftPanelTabs {
  Text = 'TEXT',
  Video = 'VIDEO',
}
