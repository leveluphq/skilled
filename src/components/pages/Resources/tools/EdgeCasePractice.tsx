import * as React from 'react';
import { edgeCaseQuestions } from 'utils/shared/reasoningPractice';
import ReasoningQuiz from './ReasoningQuiz';
export default function EdgeCasePractice() {
  return <ReasoningQuiz title="Find the test that exposes the bug" questions={edgeCaseQuestions} />;
}
