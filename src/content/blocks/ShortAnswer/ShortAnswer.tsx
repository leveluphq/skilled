import * as React from 'react';
import { ChevronDown20 } from '@carbon/icons-react';

import { RawButton } from 'style/elements';
import { Wrapper, Question, Text, AnswerWrapper, Answer } from './styles';

const DEFAULT_HEIGHT = 200;
const TRANSITION_TIME_MS = 250;

interface Props {
  question: React.ReactNode;
  answer: React.ReactNode;
}

export enum TransitionState {
  Closed = 'CLOSED',
  Opening = 'OPENING',
  Open = 'OPEN',
  Closing = 'CLOSING',
}

const ShortAnswer: React.FC<Props> = ({ question, answer }) => {
  const [isRevealed, setIsRevealed] = React.useState(false);
  const [transitionState, setTransitionState] = React.useState(TransitionState.Closed);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (transitionState === TransitionState.Closing) {
      setTransitionState(TransitionState.Closed);
    }
  }, [transitionState]);

  React.useEffect(() => {
    if (isRevealed) {
      setTransitionState(TransitionState.Opening);
    } else {
      setTransitionState(TransitionState.Closing);
    }

    let timeout = setTimeout(() => {
      if (isRevealed) {
        setTransitionState(TransitionState.Open);
      }
    }, TRANSITION_TIME_MS);

    return () => clearTimeout(timeout);
  }, [isRevealed]);

  return (
    <Wrapper>
      <RawButton onClick={() => setIsRevealed(!isRevealed)}>
        <Question isRevealed={isRevealed}>
          <Text>{question}</Text>
          <ChevronDown20 />
        </Question>
      </RawButton>
      <AnswerWrapper
        isRevealed={isRevealed}
        containerHeight={ref.current ? ref.current.offsetHeight : DEFAULT_HEIGHT}
        transitionTime={TRANSITION_TIME_MS}
        transitionState={transitionState}
      >
        <Answer ref={ref}>{answer}</Answer>
      </AnswerWrapper>
    </Wrapper>
  );
};

export default ShortAnswer;
