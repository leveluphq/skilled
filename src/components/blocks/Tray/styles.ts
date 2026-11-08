import styled from 'styled-components';
import { rgba } from 'style/utils/color';
import { RawButton, MAX_CONTENT_WIDTH } from 'style/elements';
import { mobile } from 'style/breakpoints';
// import { SIDEBAR_WIDTH } from 'components/blocks/Sidebar/styles';

// width: ${MAX_CONTENT_WIDTH}px;
// max-width: ${({ isSidebarPage }) =>
//   isSidebarPage ? `calc(100vw - ${SIDEBAR_WIDTH}px)` : '100vw'};
// bottom: ${({ isOpen, height }) => (isOpen ? '0' : `-${height}`)};
export const Wrapper = styled.div<{
  isOpen: boolean;
  height: string;
  width: number;
  maxWidth?: string;
  isSidebarPage: boolean;
  fluid?: boolean;
}>`
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
  max-width: ${({ maxWidth }) => (maxWidth ? maxWidth : `${MAX_CONTENT_WIDTH}px`)};
  position: fixed;
  bottom: 0;
  left: inherit;
  right: ${({ fluid }) => (fluid ? 0 : 'inherit')};
  transform: translateY(${({ isOpen, height }) => (isOpen ? '0' : `${height}`)});
  margin: 0 auto;
  z-index: ${({ theme, isOpen }) => (isOpen ? theme.zIndex.z1 : '-1')};
  transition: transform 100ms linear, opacity 100ms linear;
  width: ${({ width }) => width}%;
  box-shadow: 0 -12px 16px rgba(0, 0, 0, 0.6);
  border-top: 1px solid ${(props) => props.theme.color.border};
  border-left: 1px solid ${(props) => props.theme.color.border};
  border-right: 1px solid ${(props) => props.theme.color.border};

  &:focus {
    outline: none;
  }

  ${mobile()} {
    max-width: 100vw;
    width: 100vw;
  }
`;

export const Container = styled.div<{ useContentHeight?: boolean; backgroundOpacity?: number }>`
  max-height: ${({ useContentHeight }) => (useContentHeight ? '100vh' : '50vh')};
  background-color: ${({ theme, backgroundOpacity }) =>
    rgba(theme.color.backgroundDistinct, backgroundOpacity)};
  padding: 24px;
  overflow-y: auto;
`;

export const CloseButton = styled(RawButton)`
  position: absolute;
  top: 2px;
  right: 2px;
  font-size: 32px;
  padding-left: 10px;
  padding-right: 10px;
  padding-bottom: 4px;
`;
