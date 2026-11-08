import * as React from 'react';
import { complexityQuestions } from 'utils/shared/reasoningPractice';
import ReasoningQuiz from './ReasoningQuiz';
export default function ComplexityPractice() {
  return (
    <ReasoningQuiz title="Count the work before choosing a bound" questions={complexityQuestions} />
  );
}
