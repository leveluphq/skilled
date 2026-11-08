import * as React from 'react';
import { Container } from 'style/elements';

import { Wrapper, QuestionText } from './styles';

const QuestionPrompt: React.FC = ({ children }) => {
  return (
    <Container>
      <Wrapper>
        <QuestionText>Prompt</QuestionText>
        <div>
          <strong>{children}</strong>
        </div>
      </Wrapper>
    </Container>
  );
};

export default QuestionPrompt;
