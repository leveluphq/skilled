import styled, { css } from 'styled-components';
// @ts-ignore
import { ExpandAll20, ListChecked20 } from '@carbon/icons-react';
import { rgba } from 'style/utils/color';
import { ButtonLink as BaseButton, PillButton, GhostButton } from 'style/elements';
import { FOCUS_WIDTH } from 'style/theme';
import { LessonConfidenceColor } from 'utils/constants/lesson';
import { mobile } from 'style/breakpoints';

export const Wrapper = styled.div`
  text-align: center;
`;

export const ButtonFull = styled(BaseButton)`
  width: calc(50% - 8px);
  outline-offset: -${FOCUS_WIDTH}px;

  &:first-of-type {
    margin-right: 8px;
  }

  &:last-of-type {
    margin-left: 8px;
  }

  ${mobile()} {
    width: 100%;

    &:first-of-type {
      margin-right: 0;
      margin-bottom: 12px;
    }

    &:last-of-type {
      margin-left: 0;
    }
  }
`;

export const Button = styled(GhostButton)`
  padding-left: 2rem;
  padding-right: 2rem;
  height: 52px;
  width: calc(50% - 8px);
  font-weight: 500;

  &:first-of-type {
    margin-right: 8px;
  }

  &:last-of-type {
    margin-left: 8px;
  }

  ${mobile()} {
    width: 100%;

    &:first-of-type {
      margin-right: 0;
      margin-bottom: 12px;
    }

    &:last-of-type {
      margin-left: 0;
    }
  }
`;

export const ButtonLink = styled(PillButton)`
  color: ${({ theme }) => theme.color.textSecondary};
  width: auto;
  margin-top: 16px;
  background: none;
  border: none;
  font-size: 12px;
  padding: 1rem 1rem;
  margin-left: auto;
  margin-right: auto;

  &:hover {
    border: none;
  }
`;

export const ExpandText = styled.span`
  margin-left: 6px;
  margin-right: 8px;
`;

export const ConfidenceSection = styled.div`
  text-align: center;

  ${mobile()} {
    text-align: center;
  }
`;

export const ConfidenceTitle = styled.h3`
  font-size: 1.2em;
  font-weight: 400;
  margin-bottom: 0;
`;

export const ConfidenceSubtitle = styled.p`
  color: ${({ theme }) => theme.color.textSecondary};
  font-weight: 400;
`;

export const ConfidenceSliderWrapper = styled.div`
  margin-top: 0.5rem;
`;

export const ConfidenceLabel = styled.label`
  margin-right: 4px;
`;

const SLIDER_SIZE = 20;
export const ConfidenceInput = styled.input<{ confidence: number }>`
  outline-offset: 12px;
  margin: 0;
  margin-bottom: 20px;
  border-radius: 4px;

  -webkit-appearance: none; /* Override default CSS styles */
  appearance: none;
  width: 50%; /* Full-width */
  height: 4px; /* Specified height */
  background-color: ${({ theme }) => theme.color.inverted};
  cursor: pointer; /* Cursor on hover */

  ${mobile()} {
    width: 100%;
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none; /* Override default look */
    appearance: none;
    width: ${SLIDER_SIZE}px; /* Set a specific slider handle width */
    height: ${SLIDER_SIZE}px; /* Slider handle height */
    background: ${({ confidence }) => LessonConfidenceColor[confidence]};
    cursor: pointer; /* Cursor on hover */
    border-radius: 50%;

    &:focus {
      outline: ${({ theme }) => theme.focus};
    }
  }

  &::-moz-range-thumb {
    width: ${SLIDER_SIZE}px; /* Set a specific slider handle width */
    height: ${SLIDER_SIZE}px; /* Slider handle height */
    background: ${({ confidence }) => LessonConfidenceColor[confidence]};
    cursor: pointer; /* Cursor on hover */
    border-radius: 50%;

    &:focus {
      outline: ${({ theme }) => theme.focus};
    }
  }
`;

export const ConfidenceLabelWrapper = styled.div`
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75em;
  letter-spacing: 0.5px;
`;

export const ConfidenceOutput = styled.output<{ confidence: number }>`
  color: ${({ confidence }) => LessonConfidenceColor[confidence]};
`;

export const FinishButtonsWrapper = styled.div`
  margin-top: 3rem;
`;

export const FinishTitle = styled(ConfidenceTitle)`
  margin-bottom: 0.5rem;
`;

export const CTAButton = styled(ButtonFull)`
  color: ${({ theme }) => theme.color.textPrimary};
  background-color: ${({ theme }) => theme.color.cta};

  &:hover {
    background-color: ${({ theme }) => rgba(theme.color.cta, 0.85)};
  }
`;

export const ErrorButton = styled(ButtonFull)`
  color: ${({ theme }) => theme.color.textPrimary};
  background-color: ${({ theme }) => theme.color.alert};

  &:hover {
    background-color: ${({ theme }) => theme.color.alertHover};
  }
`;

const iconStyles = css`
  position: absolute;
  left: 24px;
`;

export const BreakdownIcon = styled(ExpandAll20)`
  ${iconStyles};
`;

export const ValidateIcon = styled(ListChecked20)`
  ${iconStyles};
`;

export const NavigateWrapper = styled.div`
  margin-top: 24px;
`;
