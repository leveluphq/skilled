import styled, { css } from 'styled-components';
import { rgba } from 'style/utils/color';
import { BasePalette, FOCUS_WIDTH } from 'style/theme';
import { FONT_FAMILY } from 'style/GlobalStyle';
import { LARGE_BREAK } from '../breakpoints';

export const MAX_PAGE_WIDTH = LARGE_BREAK;
export const MAX_CONTENT_WIDTH = 736;
export const MAX_CONTENT_WIDTH_LARGE = 1024;
export const CONTAINER_PAD = 16;

export const centerAlign = css`
  width: 100%;
  margin: 0 auto;
`;

export const CONTAINER_STYLES = css`
  ${centerAlign};
  max-width: ${MAX_CONTENT_WIDTH}px;
  padding: 0 ${CONTAINER_PAD}px;
`;

export const CONTAINER_STYLES_LARGE = css`
  ${centerAlign};
  max-width: ${MAX_CONTENT_WIDTH_LARGE}px;
  padding: 0 ${CONTAINER_PAD}px;
`;

export const Container = styled.div`
  ${CONTAINER_STYLES};
`;

export const ContainerLarge = styled.div`
  ${CONTAINER_STYLES_LARGE};
`;

export const pageWidthStyles = css`
  ${centerAlign};
  max-width: ${MAX_PAGE_WIDTH}px;
`;

export const rawButtonStyles = css`
  display: inline-block;
  position: relative;
  border: none;
  margin: 0;
  padding: 0;
  text-decoration: none;
  background: none;
  cursor: pointer;
  text-align: center;
  -webkit-appearance: none;
  -moz-appearance: none;
  font-family: ${FONT_FAMILY};
  font-size: 1em;
  color: ${({ theme }) => theme.color.textPrimary};
  line-height: 1;
  border-radius: 2px;

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

export const RawButton = styled.button`
  ${rawButtonStyles};
`;

interface BaseButtonProps {
  preventHover?: boolean;
}

const baseButtonStyles = css<BaseButtonProps>`
  padding: 1rem 2rem;
  background: ${({ theme }) => theme.color.buttonPrimary};
  color: #ffffff;
  transition: background-color 250ms ease-in-out;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${({ theme, preventHover }) =>
      preventHover ? theme.color.buttonPrimary : theme.color.buttonHover};
  }

  &:disabled,
  &[disabled] {
    opacity: 0.8;
    cursor: default;

    &:hover {
      background: ${({ theme }) => theme.color.buttonPrimary};
    }
  }
`;

export const Button = styled(RawButton)<BaseButtonProps>`
  ${baseButtonStyles};
`;

export const ButtonLink = styled.a<BaseButtonProps>`
  ${rawButtonStyles};
  ${baseButtonStyles};
`;

export const BACKGROUND_EASE = 'background 150ms ease';
export const PillButton = styled(RawButton)`
  transition: ${BACKGROUND_EASE};
  background: transparent;
  padding: 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  outline-offset: -${FOCUS_WIDTH}px;

  &:hover {
    background: rgba(80, 80, 80, 0.25);
  }
`;

interface GhostButtonProps {
  color?: string;
  textColor?: string;
  themeColor?: string;
  hoverable?: boolean;
  solid?: boolean;
}

const OPACITY = 0.4;
const getBackground = ({ theme, color = BasePalette.Button, themeColor }: any) => {
  let buttonBackground = BasePalette.Button;

  if (themeColor) {
    buttonBackground = theme.color[themeColor];
  } else if (color) {
    buttonBackground = color;
  }

  return buttonBackground;
};

const ghostButtonStyles = css<GhostButtonProps>`
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 2px solid ${(props) => getBackground(props)};
  background: ${(props) =>
    props.solid ? rgba(getBackground(props), 1) : rgba(getBackground(props), OPACITY)};
  color: ${({ textColor, theme }) => (textColor ? textColor : theme.color.textPrimary)};
  transition: ${BACKGROUND_EASE};

  &:hover {
    background: ${(props) =>
      props.hoverable || props.solid
        ? rgba(getBackground(props), 1)
        : rgba(getBackground(props), OPACITY)};
  }

  &:visited {
    color: ${({ textColor, theme }) => (textColor ? textColor : theme.color.textPrimary)};
  }
`;

export const GhostButton = styled(RawButton)<GhostButtonProps>`
  ${ghostButtonStyles};
`;

export const GhostButtonLink = styled.a<GhostButtonProps>`
  ${rawButtonStyles}
  ${ghostButtonStyles};
`;

const actionButtonStyles = css`
  line-height: 1;
  color: ${({ theme }) => theme.color.textPrimary};
  background-color: ${({ theme }) => theme.color.alert};
  border-radius: 2px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
  font-size: 0.9em;
  font-weight: 600;
  padding: 6px 12px;

  &:hover {
    background-color: ${({ theme }) => theme.color.alertHover};
  }
`;

export const ActionButtonLink = styled.a`
  ${actionButtonStyles};
`;

export const ActionButton = styled(RawButton)`
  ${rawButtonStyles};
  ${actionButtonStyles};

  &:disabled {
    box-shadow: none;
    background-color: ${({ theme }) => theme.color.alert};
    cursor: default;

    &:hover {
      background-color: ${({ theme }) => theme.color.alert};
    }
  }
`;

const inputStyles = css<{ isError?: boolean | string }>`
  border: 3px solid ${({ theme, isError }) => (isError ? theme.color.alert : theme.color.border)};
  box-shadow: inset 0 2px 2px rgba(0, 0, 0, 0.15);
  transition: border 150ms ease, box-shadow 150ms ease;
  width: 100%;
  border-radius: 4px;
  color: #323232;
  padding: 12px 16px;
  font-size: 14px;

  &:focus {
    border: 3px solid ${({ theme }) => theme.color.buttonPrimary};
    box-shadow: none;
    outline: none;
  }
`;

export const Input = styled.input`
  ${inputStyles};
`;

export const Textarea = styled.textarea`
  ${inputStyles};
`;

export const Label = styled.label`
  font-size: 13px;
  margin-bottom: 2px;
  font-weight: 600;
`;
