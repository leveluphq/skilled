import styled, { css } from 'styled-components';
import { FOCUS_WIDTH } from 'style/theme';
import BasePopover from 'components/blocks/Popover';

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const Title = styled.h3`
  color: ${({ theme }) => theme.color.textSecondary};
  text-align: center;
  font-size: 12px;
  font-weight: 400;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 3px;
`;

const BUTTON_WIDTH = 24;
export const Popover = styled(BasePopover)<{ left?: number }>`
  left: ${({ left }) => (left ? `${-left + BUTTON_WIDTH}px` : 0)};
  visibility: hidden;
  font-size: 12px;
  white-space: nowrap;

  &:after {
    visibility: hidden;
  }
`;

export const ButtonWrapper = styled.div<{ spread: boolean }>`
  width: 100%;
  display: flex;
  justify-content: ${({ spread }) => (spread ? 'space-between' : 'center')};
`;

export const ButtonText = styled.span`
  color: ${({ theme }) => theme.color.textPrimary};
  font-weight: 600;
  font-size: 12px;
  margin-left: 6px;
  margin-right: 6px;
`;

const RADIUS = 3;
const buttonStyles = css<{ rounded: boolean; leftRadius?: boolean; rightRadius?: boolean }>`
  padding: 10px 18px;
  border: 1px solid ${({ theme }) => theme.color.border};
  display: inline-flex;
  align-items: center;
  line-height: 1;
  transition: border 150ms ease, background-color 150ms ease;
  outline-offset: -${FOCUS_WIDTH}px;
  border-radius: ${({ rounded }) => (rounded ? `${RADIUS}px` : 0)};

  ${({ leftRadius }) =>
    leftRadius
      ? `border-top-left-radius: ${RADIUS}px;
         border-bottom-left-radius: ${RADIUS}px;`
      : ''}

  ${({ rightRadius }) =>
    rightRadius
      ? `border-top-right-radius: ${RADIUS}px;
         border-bottom-right-radius: ${RADIUS}px;`
      : ''}

  svg {
    width: 14px;
    height: 14px;
    fill: ${({ theme }) => theme.color.textPrimary};
    transition: fill 150ms ease;
  }
`;

export const Button = styled.a`
  ${buttonStyles};
  position: relative;
  z-index: ${({ theme }) => theme.zIndex.z1};

  &:hover,
  &:focus {
    border: 1px solid ${({ theme }) => theme.color.buttonPrimary};
    background-color: ${({ theme }) => theme.color.buttonPrimary};
    color: ${({ theme }) => theme.color.textPrimary};

    svg {
      fill: ${({ theme }) => theme.color.textPrimary};
    }

    ${ButtonText} {
      color: ${({ theme }) => theme.color.textPrimary};
    }

    ${Popover} {
      visibility: visible;

      &:after {
        visibility: visible;
      }
    }
  }
`;

export const ButtonDisabled = styled.span`
  ${buttonStyles};
`;

export const LessonName = styled.div`
  color: ${({ theme }) => theme.color.textSecondary};
  font-size: 14px;
  margin-top: 16px;
`;

export const ButtonSection = styled.div<{ right?: boolean }>`
  text-align: ${({ right }) => (right ? 'right' : 'left')};
`;

export const JobButtonSection = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  margin-top: 32px;
`;

export const FindJobButton = styled.a`
  background-color: ${({ theme }) => theme.color.buttonPrimary};
  padding: 12px 48px;
  border-radius: 3px;
  font-weight: 600;
`;
