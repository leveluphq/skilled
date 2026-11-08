import * as React from 'react';
import LessonStatusIcon from 'components/blocks/LessonStatusIcon';
import { Lessons } from 'types/generated/client';
import { Status } from 'utils/constants/lesson';

import { Card, Title, Description } from './styles';

interface Props {
  lesson: Partial<Lessons>;
  hoverable: boolean;
  status: Status;
  showDescription?: boolean;
}

const LessonCard: React.FC<Props> = props => {
  const {
    status,
    lesson: { title, description },
    showDescription,
  } = props;

  return (
    <Card {...props}>
      <Title>
        <span>{title}</span> <LessonStatusIcon status={status} />
      </Title>
      {showDescription && !!description && <Description>{description}</Description>}
    </Card>
  );
};

export default LessonCard;
