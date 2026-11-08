import styled, { css } from 'styled-components';
import { FOCUS_WIDTH } from 'style/theme';
import { rgba } from 'style/utils/color';
import { RawButton } from 'style/elements';
import { mobile } from 'style/breakpoints';

export const SIDEBAR_WIDTH = 232;

const sidebarRightStyles = css`
  right: 0;
  border-left: 1px solid ${({ theme }) => theme.color.border};
`;

const sidebarLeftStyles = css`
  left: 0;
  border-right: 1px solid ${({ theme }) => theme.color.border};
`;

// TODO: These styles should probably be extended instead of configured.
// ie. SidebarContainerRight = styled(SidebarContainer)
export const SidebarContainer = styled.div<{ right?: boolean; sidebarDepth?: boolean }>`
  ${({ right }) => (right ? sidebarRightStyles : sidebarLeftStyles)};
  background-color: ${({ theme }) => theme.color.backgroundSecondary};
  box-shadow: ${({ sidebarDepth }) =>
    sidebarDepth ? `0 14px 10px 4px ${rgba('#0f0f0f', 0.75)}` : 'none'};
  width: ${SIDEBAR_WIDTH}px;
  height: 100vh;
  position: fixed;
  top: 0;
  display: flex;
  flex-direction: column;

  ${mobile()} {
    display: none;
  }
`;

export const SidebarTitle = styled.h2`
  height: ${({ theme }) => theme.spacing.navHeight}px;
  padding: 1rem;
  line-height: 1;
  font-size: 1.2em;
  font-weight: 400;
  display: flex;
  align-items: center;
  flex-shrink: 0;
`;

export const SidebarMenu = styled.nav`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow-y: auto;
`;

const itemStyles = css`
  font-size: 0.9em;
  padding-left: 1rem;
  padding-right: 1rem;
  padding-top: 0.65rem;
  padding-bottom: 0.65rem;
  line-height: 1.3;
  transition: background-color 150ms ease, color 500ms ease;
  outline-offset: -${FOCUS_WIDTH}px;
  display: flex;
  align-items: center;
  border-radius: 0;

  svg {
    transition: fill 500ms ease;
  }

  &:hover {
    background-color: ${({ theme }) => theme.color.buttonPrimary};
  }

  &:disabled {
    color: ${({ theme }) => theme.color.textSecondary};
    cursor: default;

    svg {
      fill: ${({ theme }) => theme.color.textSecondary};
    }
  }

  &:disabled:hover {
    background-color: inherit;
  }
`;

export const SidebarMenuItem = styled.a<{ isHighlighted?: boolean }>`
  ${itemStyles};
  cursor: pointer;
  border: ${({ theme, isHighlighted }) =>
    isHighlighted ? `1px solid ${theme.color.buttonPrimary}` : 'none'};
`;

export const SidebarMenuButton = styled(RawButton)`
  ${itemStyles};
  cursor: pointer;
  text-align: left;
`;

export const SidebarFooter = styled.div``;

export const SidebarMenuTitle = styled(RawButton)<{ isOpen: boolean }>`
  ${itemStyles};
  border-radius: 0;
  text-align: left;
  display: flex;
  justify-content: space-between;
  width: 100%;

  svg {
    will-change: transform;
    transition: transform 80ms linear;
    transform: rotate(${({ isOpen }) => (isOpen ? 180 : 0)}deg);
  }
`;

export const SidebarMenuItems = styled.div`
  display: flex;
  flex-direction: column;
`;

export const SidebarToggleMenu = styled.div`
  ${SidebarMenuItem} {
    padding-left: 2rem;
    font-weight: 300;
    font-size: 0.8em;
  }
  ${SidebarMenuButton} {
    padding-left: 2rem;
    font-weight: 300;
    font-size: 0.8em;
  }
`;
