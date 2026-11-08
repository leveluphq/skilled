import styled from 'styled-components';
import { rgba } from 'style/utils/color';
import { BasePalette } from 'style/theme';
import { PillButton, BACKGROUND_EASE } from 'style/elements';

const BOTTOM_GRADIENT_HEIGHT = 32;

export const ToggleContainer = styled.div`
  display: flex;
`;

export const ToggleButton = styled(PillButton)<{ isActive: boolean }>`
  width: 50%;
  font-weight: 300;
  font-size: 0.9em;
  padding: 10px;
  margin-left: 12px;
  margin-right: 12px;
  margin-bottom: 4px;
  outline: none;
  border-radius: 0;
  text-align: center;
  justify-content: center;
  border-bottom: 1px solid
    ${({ theme, isActive }) => (isActive ? theme.color.inverted : 'transparent')};

  &:focus {
    outline: none;
    border-bottom: 1px solid ${({ theme }) => theme.color.inverted};
  }
`;

export const SectionHeader = styled.div`
  font-size: 0.7em;
  text-transform: uppercase;
  color: ${BasePalette.SkyBlue};
  padding: 0.5rem 0.9rem;
  padding-top: 1rem;
  display: flex;
  align-items: center;

  svg {
    fill: ${BasePalette.SkyBlue};
    margin-right: 8px;
  }
`;

export const FooterContainer = styled.div`
  padding-left: 1rem;
  padding-right: 1rem;
  padding-bottom: 0.4rem;
  padding-top: 2px;
  position: relative;
  flex-shrink: 0;
`;

export const Gradient = styled.div`
  width: 100%;
  position: absolute;
  left: 0;
  top: -${BOTTOM_GRADIENT_HEIGHT}px;
  height: ${BOTTOM_GRADIENT_HEIGHT}px;
  background: transparent;
  background: ${({ theme }) =>
    `linear-gradient(${rgba(theme.color.backgroundSecondary, 0)}, ${rgba(
      theme.color.backgroundSecondary,
      1,
    )})`};
`;

export const Spacer = styled.div`
  width: 100%;
  height: ${BOTTOM_GRADIENT_HEIGHT}px;
  flex-shrink: 0;
`;

export const Toggle = styled.div`
  font-size: 0.8em;
  display: flex;
  align-items: center;
  margin-bottom: 2px;

  label {
    margin-left: 2px;
  }
`;

export const TimerWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
`;

export const StyledPillButton = styled(PillButton)`
  font-size: 14px;
`;

const PILL_WIDTH = 78;
export const TimerPillButton = styled(StyledPillButton)<{ isHidden: boolean }>`
  width: ${({ isHidden }) => (isHidden ? '32px' : `${PILL_WIDTH}px`)};
  overflow: hidden;
  transition: width 200ms ease, ${BACKGROUND_EASE};
  justify-content: space-between;
  padding-right: 10px;

  &:hover {
    width: ${PILL_WIDTH}px;
  }

  svg {
    margin-right: 8px;
    flex-shrink: 0;
  }
`;

export const ButtonText = styled.span`
  margin-left: 8px;
`;
