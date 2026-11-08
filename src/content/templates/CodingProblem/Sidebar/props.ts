import { Lesson, Viewer } from 'utils/client/lesson';
import { ScrollerProps } from '../props';

export interface OwnProps extends ScrollerProps {
  slug: string;
  title: string;
  type: string;
  label: string;
  isComplete?: boolean;
  toggleTray: () => void;
  toggleCodeEditor: () => void;
  setQuestionComplete: () => void;
  isCodeEditorOpen: boolean;
  LearningOutcomes: React.FC | null;
  hasFetchedVideo: boolean;
  solutionVideoUrl: string | null;
  toggleSolutionVideoTray: () => void;
  isSolutionVideoTrayOpen: boolean;
}

export interface Props extends OwnProps {
  lesson: Lesson;
  viewer: Viewer;
}
