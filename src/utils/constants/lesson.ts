import * as React from 'react';
import { BasePalette } from 'style/theme';

export const VALIDATE_TITLE = 'Validate My Answer';
export const TEST_BUTTON_TEXT = 'Run My Code';

export enum LessonType {
  Question = 'QUESTION',
  Instructional = 'INSTRUCTIONAL',
}

export enum LessonVisibilityStatus {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
  Beta = 'BETA',
}

type LessonTypeNames = Record<LessonType, string>;

export const lessonTypeNames: LessonTypeNames = {
  [LessonType.Question]: 'Interview Question',
  [LessonType.Instructional]: 'Learn',
};

export enum LessonAccessLevel {
  Free = 'FREE', // Free for anyone
  Trial = 'TRIAL', // Free if you make an account
  Subscription = 'SUBSCRIPTION',
}

// A language is offered to learners only once it's in codingLanguageList
export enum CodingLanguage {
  Javascript = 'JAVASCRIPT',
  Typescript = 'TYPESCRIPT',
  Python = 'PYTHON',
  Java = 'JAVA',
  Cpp = 'CPP',
  Csharp = 'CSHARP',
  Go = 'GO',
  Kotlin = 'KOTLIN',
  Swift = 'SWIFT',
  Rust = 'RUST',
}

export interface EnforceLanguage {
  default: CodingLanguage;
  options: CodingLanguage[];
}

export type CodeSnippetGenerator = (language: CodingLanguage) => React.ReactNode;

export type ContentForLanguage = (language: CodingLanguage) => React.ReactNode;

export const LanguageName: Record<CodingLanguage, string> = {
  [CodingLanguage.Javascript]: 'JavaScript',
  [CodingLanguage.Typescript]: 'TypeScript',
  [CodingLanguage.Python]: 'Python',
  [CodingLanguage.Java]: 'Java',
  [CodingLanguage.Cpp]: 'C++',
  [CodingLanguage.Csharp]: 'C#',
  [CodingLanguage.Go]: 'Go',
  [CodingLanguage.Kotlin]: 'Kotlin',
  [CodingLanguage.Swift]: 'Swift',
  [CodingLanguage.Rust]: 'Rust',
};

// CodeMirror modes (codemirror/mode/*); the clike languages are MIME types
export const CodingLanguageMode: Record<CodingLanguage, string> = {
  [CodingLanguage.Javascript]: 'javascript',
  [CodingLanguage.Typescript]: 'javascript',
  [CodingLanguage.Python]: 'python',
  [CodingLanguage.Java]: 'text/x-java',
  [CodingLanguage.Cpp]: 'text/x-c++src',
  [CodingLanguage.Csharp]: 'text/x-csharp',
  [CodingLanguage.Go]: 'go',
  [CodingLanguage.Kotlin]: 'text/x-kotlin',
  [CodingLanguage.Swift]: 'swift',
  [CodingLanguage.Rust]: 'rust',
};

export const codingLanguageList = [
  CodingLanguage.Javascript,
  CodingLanguage.Typescript,
  CodingLanguage.Python,
  CodingLanguage.Java,
  CodingLanguage.Cpp,
  CodingLanguage.Csharp,
  CodingLanguage.Go,
  CodingLanguage.Kotlin,
  CodingLanguage.Swift,
  CodingLanguage.Rust,
];

export const languageConfig: Record<CodingLanguage, { tabSize: number; indentWithTabs?: boolean }> = {
  [CodingLanguage.Javascript]: { tabSize: 2 },
  [CodingLanguage.Typescript]: { tabSize: 2 },
  [CodingLanguage.Python]: { tabSize: 4 },
  [CodingLanguage.Java]: { tabSize: 4 },
  [CodingLanguage.Cpp]: { tabSize: 4 },
  [CodingLanguage.Csharp]: { tabSize: 4 },
  // gofmt indents with tabs
  [CodingLanguage.Go]: { tabSize: 4, indentWithTabs: true },
  [CodingLanguage.Kotlin]: { tabSize: 4 },
  [CodingLanguage.Swift]: { tabSize: 4 },
  [CodingLanguage.Rust]: { tabSize: 4 },
};

export enum LessonStatus {
  Init = 'INIT',
  InProgress = 'IN_PROGRESS',
  NeedsReview = 'NEEDS_REVIEW',
  Complete = 'COMPLETE',
}

export interface Statuses {
  [key: string]: LessonStatus | null;
}

export type Status = LessonStatus | null | undefined;

export const LessonConfidence = [
  '(Move slider to pick confidence)',
  'I am very lost',
  'I need practice',
  'I feel okay about it',
  'I feel good about it',
  'I am an expert',
];

export const LessonConfidenceColor = [
  BasePalette.Gray,
  BasePalette.Red,
  BasePalette.Orange,
  BasePalette.Yellow,
  BasePalette.SkyBlue,
  BasePalette.Green,
];

export const REACT_PLAYER_CLASSNAME = 'react-player';

export const videoProps = {
  pip: true,
  playsinline: true,
  controls: true,
  className: REACT_PLAYER_CLASSNAME,
};

export interface VideoSegment {
  name: string;
  startTimeSeconds: number;
  endTimeSeconds: number;
}

export interface VideoDetails {
  segments: VideoSegment[];
  // Corrections made to the lesson after its solution video was recorded, one
  // short sentence each, so a learner knows where the video and the text differ.
  changesSinceRecording?: string[];
}

export enum ReasonForMissing {
  UpgradeRequired = 'UPGRADE_REQUIRED',
  Replacing = 'REPLACING',
}
