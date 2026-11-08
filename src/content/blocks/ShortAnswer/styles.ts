import styled from 'styled-components';
import { TransitionState } from './ShortAnswer';

const BORDER_RADIUS = 4;

export const Wrapper = styled.div`
  width: 100%;
  margin-top: 32px;

  button {
    width: 100%;
  }
`;

export const Question = styled.div<{ isRevealed: boolean }>`
  background-color: ${({ theme }) => theme.color.navBackground};
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  border-radius: ${BORDER_RADIUS}px;
  border-bottom-left-radius: ${({ isRevealed }) => (isRevealed ? 0 : BORDER_RADIUS)}px;
  border-bottom-right-radius: ${({ isRevealed }) => (isRevealed ? 0 : BORDER_RADIUS)}px;
  box-shadow: ${({ theme }) => theme.shadow.stroke}, ${({ theme }) => theme.shadow.medium};
  font-weight: 600;

  p {
    margin: 0 !important;
    padding: 0;
    text-align: left;
  }

  svg {
    margin-left: 8px;
    flex-shrink: 0;
    will-change: transform;
    transition: transform 80ms linear;
    transform: rotate(${({ isRevealed }) => (isRevealed ? 180 : 0)}deg);
  }
`;

export const Text = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
`;

export const AnswerWrapper = styled.div<{
  isRevealed: boolean;
  containerHeight: number;
  transitionTime: number;
  transitionState: TransitionState;
}>`
  transition: height ${({ transitionTime }) => transitionTime}ms linear;
  overflow: hidden;
  height: ${({ transitionState, containerHeight }) => {
    if (transitionState === TransitionState.Closed) {
      return 0;
    } else if (transitionState === TransitionState.Open) {
      return 'auto';
    } else if (
      transitionState === TransitionState.Opening ||
      transitionState === TransitionState.Closing
    ) {
      return `${containerHeight}px`;
    }
  }};
`;

export const Answer = styled.div`
  background-color: ${({ theme }) => theme.color.backgroundSecondary};
  border: 1px solid ${({ theme }) => theme.color.border};
  border-top: none;
  border-bottom-left-radius: ${BORDER_RADIUS}px;
  border-bottom-right-radius: ${BORDER_RADIUS}px;
  padding: 20px 4px;
  font-size: 14px;

  * {
    font-weight: 500;
  }

  > *:first-child {
    margin-top: 0 !important;
  }

  > *:last-child {
    margin-bottom: 0 !important;
  }
`;
