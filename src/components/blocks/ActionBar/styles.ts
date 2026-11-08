import styled from 'styled-components';
import { RawButton, PillButton, BACKGROUND_EASE } from 'style/elements';
import { mobile } from 'style/breakpoints';
import { rgba } from 'style/utils/color';

const HEIGHT = 36;
const RADIUS = 3;

export const Wrapper = styled.div`
  height: ${(props) => props.theme.spacing.navHeight}px;
  border-bottom: 1px solid ${({ theme }) => theme.color.border};
  flex-shrink: 0;
  padding: 0 ${({ theme }) => theme.spacing.gutter}px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Section = styled.div`
  display: flex;
  align-items: center;
  height: 100%;
  flex-shrink: 0;
`;

const ITEM_MARGIN = 16;

export const Item = styled.div<{ displayMobile?: boolean }>`
  height: ${(props) => props.theme.spacing.navHeight}px;
  display: flex;
  align-items: center;

  ${mobile()} {
    display: ${({ displayMobile }) => (displayMobile ? 'flex' : 'none')};
  }
`;

export const Left = styled(Section)<{ fullWidthMobile: boolean }>`
  ${Item} {
    margin-left: ${ITEM_MARGIN}px;

    &:first-of-type {
      margin-left: 0;
    }
  }

  ${mobile()} {
    width: ${({ fullWidthMobile }) => (fullWidthMobile ? '100%' : 'auto')};
    justify-content: space-between;
  }
`;

export const Right = styled(Section)`
  ${Item} {
    margin-right: ${ITEM_MARGIN}px;

    &:last-of-type {
      margin-right: 0;
    }
  }
`;

export const Logo = styled.a`
  height: 100%;
  line-height: 1;
  display: flex;
  align-items: center;
  margin-right: 32px;
`;

export const FadedButton = styled(RawButton)`
  height: ${HEIGHT}px;
  padding: 0 24px;
  border: 1px solid ${({ theme }) => theme.color.border};
  display: inline-flex;
  align-items: center;
  line-height: 1;
  transition: border 150ms ease, background-color 150ms ease;
  border-radius: ${RADIUS}px;
  font-size: 12px;

  svg {
    margin-left: 10px;
  }

  &:hover,
  &:focus {
    border: 1px solid ${({ theme }) => theme.color.buttonPrimary};
    background-color: ${({ theme }) => theme.color.buttonPrimary};
    color: ${({ theme }) => theme.color.textPrimary};

    svg {
      fill: ${({ theme }) => theme.color.textPrimary};
    }
  }
`;

export const LeftPanelToggleButton = styled(FadedButton)<{ isRotated: boolean }>`
  svg {
    margin-left: 0 !important;
    margin-right: 10px;
    ${({ isRotated }) => (isRotated ? 'transform: rotate(180deg);' : '')}
  }
`;

export const ToggleButton = styled(FadedButton)<{ isOpen: boolean }>`
  svg {
    will-change: transform;
    transition: transform 80ms linear;
    transform: rotate(${({ isOpen }) => (isOpen ? 180 : 0)}deg);
  }
`;

export const ShareButton = styled(RawButton)`
  height: ${HEIGHT}px;
  border: 2px solid ${({ theme }) => theme.color.textPrimary};
  color: ${({ theme }) => theme.color.textPrimary};
  padding: 0 24px;
  display: flex;
  align-items: center;
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
  text-transform: uppercase;
  border-radius: 3px;

  svg {
    margin-left: 10px;
  }
`;

export const TimerWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const StyledPillButton = styled(PillButton)`
  font-size: 14px;
`;

export const EyeToggle = styled(StyledPillButton)`
  width: ${HEIGHT}px;
  height: ${HEIGHT}px;
  justify-content: center;
`;

const PILL_WIDTH = 82;
export const TimerPillButton = styled(FadedButton)<{ isHidden: boolean }>`
  width: ${({ isHidden }) => (isHidden ? `${HEIGHT}px` : `${PILL_WIDTH}px`)};
  overflow: hidden;
  transition: width 200ms ease, ${BACKGROUND_EASE};
  justify-content: space-between;
  padding-left: 9px;
  padding-right: 11px;
  margin-left: 4px;

  &:hover {
    width: ${PILL_WIDTH}px;
  }

  svg {
    margin-right: 14px;
    margin-left: 0;
    flex-shrink: 0;
  }
`;

export const RegisterButton = styled(RawButton)`
  height: ${HEIGHT}px;
  color: ${(props) => props.theme.color.textPrimary};
  background-color: ${({ theme }) => theme.color.cta};
  padding: 0 24px;
  border-radius: 3px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 200ms ease-in-out, opacity 200ms ease-in-out;
  line-height: 1;
  font-weight: 600;

  &:hover {
    background-color: ${({ theme }) => rgba(theme.color.cta, 0.85)};
  }
`;
