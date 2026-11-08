import * as React from 'react';
import CodingProblemDualView from 'content/templates/CodingProblemDualView';
import { ContentProps } from 'content/props';
import { emptyComponent, upgradeCodeFunction } from 'utils/client/reactnoop';
import Introduction from './Introduction';
import QuestionStatement from './QuestionStatement';
import validationItems from './Validation';
import explanationItems from './Explanation';
import Solution from './Solution';
import LearningOutcomes from './LearningOutcomes';
import getUserAnswer from './UserAnswer';
import getTests from './Tests';
import getSolutionCode from './Solution/code/Solution';
import { video } from './data';

const Lesson: React.FC<ContentProps> = (props) => {
  const { hasLessonAccess } = props;
  return (
    <CodingProblemDualView
      {...props}
      Introduction={Introduction}
      QuestionStatement={QuestionStatement}
      Solution={hasLessonAccess ? Solution : emptyComponent}
      LearningOutcomes={hasLessonAccess ? LearningOutcomes : null}
      validationItems={validationItems}
      explanationItems={hasLessonAccess ? explanationItems : []}
      getUserAnswer={getUserAnswer}
      getTests={hasLessonAccess ? getTests : upgradeCodeFunction}
      getSolutionCode={hasLessonAccess ? getSolutionCode : upgradeCodeFunction}
      video={video}
    />
  );
};

export default Lesson;
