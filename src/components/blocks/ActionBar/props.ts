import { LeftPanelTabs } from 'content/templates/CodingProblemDualView/props';
import {
  GetLessonBySlugWithViewerQuery,
  InsertLessonStatusMutationHookResult,
} from 'types/generated/client';

export interface LeftPanelProps {
  activeLeftPanel?: LeftPanelTabs;
  toggleActiveLeftPanel?: () => void;
}

export interface OwnProps extends LeftPanelProps {
  slug: string;
}

export interface Props extends OwnProps {
  data?: GetLessonBySlugWithViewerQuery;
  loading: boolean;
  insertLessonStatus: InsertLessonStatusMutationHookResult[0];
}
