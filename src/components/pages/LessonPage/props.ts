import * as React from 'react';
// NOTE: Just picking this from a generic page
import { ContentProps } from 'content/props';
import {
  GetLessonBySlugWithViewerQuery,
  InsertLessonStatusMutationHookResult,
  SetActiveLessonMutationHookResult,
} from 'types/generated/client';

type StaticProps = {
  [key: string]: any;
}

export interface OwnProps extends StaticProps {
  Component: React.ComponentType<ContentProps>;
}

export interface LessonProps extends OwnProps {
  toggleCodeEditor: () => void;
  isCodeEditorOpen: boolean;
  data?: GetLessonBySlugWithViewerQuery;
  insertLessonStatus: InsertLessonStatusMutationHookResult[0];
  setActiveLesson: SetActiveLessonMutationHookResult[0];
  isFetchingUserLessonDetails: boolean;
}
