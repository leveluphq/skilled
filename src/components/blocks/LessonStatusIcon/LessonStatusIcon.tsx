import * as React from 'react';
import { LessonStatus } from 'utils/constants/lesson';
import { Status } from 'utils/constants/lesson';

import { ReviewIcon, CompleteIcon } from './styles';

const LessonStatusIcon: React.FC<{ status: Status }> = ({ status }) => {
  if (status === LessonStatus.NeedsReview) {
    return <ReviewIcon />;
  } else if (status === LessonStatus.Complete) {
    return <CompleteIcon />;
  }

  return null;
};

export default LessonStatusIcon;
