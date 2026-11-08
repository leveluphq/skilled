import * as React from 'react';
import { Checkmark32 } from '@carbon/icons-react';
import { Props } from './props';

import { Wrapper, Content } from './styles';

const LessonCard: React.FC<Props> = ({ name }) => {
  return (
    <Wrapper>
      <Content>
        {name} <Checkmark32 />
      </Content>
    </Wrapper>
  );
};

export default LessonCard;
