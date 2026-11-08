import styled from 'styled-components';
import { Container, GhostButton, RawButton } from 'style/elements';
import { BaseSection, videoWrapperStyles } from 'style/elements/lesson';
import { mobile } from 'style/breakpoints';

export const PageContainer = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;

  ${mobile()} {
    height: auto;
  }
`;

export const Wrapper = styled.div`
  display: flex;
  height: 100%;
  max-width: 100vw;
  flex: 1;
  overflow-y: auto;

  ${mobile()} {
    width: 100vw;
    overflow: visible;
  }
`;

export const Section = styled(BaseSection)<{ isOpen?: boolean }>`
  padding-top: ${({ isOpen }) => (isOpen ? 30 : 0)}px;
  padding-bottom: ${({ isOpen }) => (isOpen ? 36 : 0)}px;

  &:nth-child(2) {
    background-color: ${(props) => props.theme.color.backgroundPrimary};
  }

  &:focus {
    outline: none;
  }
`;

export const Body = styled.div<{ isOpen?: boolean }>`
  background-color: ${(props) => props.theme.color.backgroundSecondary};
  overflow: auto;
  padding-bottom: ${({ isOpen }) => (isOpen ? '12px' : 0)};

  h3 {
    margin-top: 32px;
  }
`;

export const SolutionButton = styled(GhostButton)`
  width: 100%;
  height: 100%;
  min-height: 40px;
  font-size: 0.9em;
`;

export const TrayHeader = styled.h3`
  color: ${({ theme }) => theme.color.brand};
  margin: 0;
  line-height: 1;
  margin-bottom: 8px;
`;

export const TrayContainer = styled(Container)`
  padding: 0;
`;

export const EditorContainer = styled.div`
  position: relative;
`;

export const TrayVideoWrapper = styled.div`
  ${videoWrapperStyles};
`;

export const ShowSolutionVideoWrapper = styled.div`
  margin-top: 32px;
  text-align: center;
`;

export const ShowSolutionVideoButton = styled(RawButton)`
  text-decoration: underline;
`;

export const LeftSection = styled.div<{ width: number; hasScroll: boolean }>`
  overflow-anchor: none;
  overflow: auto;
  /* overflow: ${({ hasScroll }) => (hasScroll ? 'auto' : 'hidden')};
  height: ${({ hasScroll, theme }) =>
    hasScroll ? '100%' : `calc(100vh - ${theme.spacing.navHeight}px)`}; */
  width: ${({ width }) => width}%;
  max-width: ${({ width }) => width}%;

  ${mobile()} {
    width: 100vw;
    max-width: 100vw;
    height: 100%;
    overflow: visible;
  }
`;

export const RightSection = styled.div<{ width: number }>`
  position: relative;
  border-left: 1px solid ${({ theme }) => theme.color.border};
  width: ${({ width }) => width}%;
  max-width: ${({ width }) => width}%;
  display: flex;
  flex-direction: column;

  ${mobile()} {
    display: none;
  }
`;

export const HideDesktop = styled.div`
  display: none;
  ${mobile()} {
    display: block;
  }
`;

const TAB_HEIGHT = 52;
export const ContentWrapper = styled.div<{ isActive: boolean; isPadded?: boolean }>`
  display: ${({ isActive }) => (isActive ? 'block' : 'none')};
  padding-top: ${({ isPadded }) => (isPadded ? '32px' : '0')};
  height: ${({ isPadded }) => (isPadded ? '100%' : `calc(100% - ${TAB_HEIGHT}px)`)};
`;

export const LeftPanelTabWrapper = styled.div`
  display: flex;
  height: ${TAB_HEIGHT}px;
`;

export const LeftPanelTab = styled(RawButton)<{ isActive: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50%;
  min-height: 44px;
  padding: 8px 12px;
  line-height: 1.4;
  border-radius: 0;
  font-weight: ${({ isActive }) => (isActive ? '700' : '500')};
  background-color: ${({ isActive, theme }) =>
    isActive ? theme.color.backgroundPrimary : theme.color.backgroundSecondary};
  border-top: 2px solid
    ${({ theme, isActive }) => (isActive ? theme.color.buttonPrimary : 'transparent')};
  &:focus-visible {
    outline: 3px solid ${({ theme }) => theme.color.brand};
    outline-offset: -3px;
  }
`;

export const TabLeft = styled(LeftPanelTab)<{ isActive: boolean }>`
  box-shadow: ${({ isActive }) =>
    !isActive ? 'inset -2px -2px 10px 0px rgba(10,10,10,0.25)' : 'none'};
`;
export const TabRight = styled(LeftPanelTab)<{ isActive: boolean }>`
  box-shadow: ${({ isActive }) =>
    !isActive ? 'inset 2px -2px 10px 0px rgba(10,10,10,0.25)' : 'none'};
`;

export const FullVideoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  overflow: hidden;
  height: 100%;
`;
