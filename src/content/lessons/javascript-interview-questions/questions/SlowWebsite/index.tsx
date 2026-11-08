import * as React from 'react';
import ShortAnswer from 'content/blocks/ShortAnswer';
import Question from './question.mdx';
import Answer from './answer.mdx';

const QuestionAnswer = () => <ShortAnswer question={<Question />} answer={<Answer />} />;

export default QuestionAnswer;
