import styled from 'styled-components';
import { mobile } from 'style/breakpoints';
import { ActionButton, PillButton, GhostButton, RawButton, CONTAINER_PAD } from 'style/elements';
import { Content } from 'components/blocks/StyledMarkdown/styles';

const HEADER_HEIGHT = 52;
const BOTTOM_HEIGHT = 60;
const SECTION_PADDING = 16;
const BORDER_RADIUS = 4;

export const Wrapper = styled.div<{ isOpen: boolean }>`
  position: fixed;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  padding: ${2 * SECTION_PADDING}px ${SECTION_PADDING}px;
  padding-top: ${SECTION_PADDING}px;
  width: 100vw;
  height: 100vh;
  z-index: ${({ theme }) => theme.zIndex.z2};
  transition: transform 150ms linear, opacity 150ms linear;
  transform: translateY(${({ isOpen }) => (isOpen ? '0' : '100vh')});
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
  background: ${({ theme }) => theme.color.backgroundPrimary};

  ${mobile()} {
    overflow: auto;
    padding-left: 0;
    padding-right: 0;
  }

  &:focus {
    outline: none;
  }
`;

export const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 ${SECTION_PADDING}px;
  padding-top: 8px;
  padding-bottom: 8px;
  height: ${HEADER_HEIGHT}px;
  flex-shrink: 0;
`;

export const Title = styled.h3`
  line-height: 1;
`;

export const TitleRight = styled.div`
  display: flex;
  align-items: center;
`;

export const CloseButton = styled(GhostButton)`
  height: 36px;
  font-size: 10px;
  font-weight: bold;
  text-transform: uppercase;
  width: 200px;
`;

export const CloseIcon = styled.span`
  font-size: 18px;
  margin-right: 8px;
`;

export const Container = styled.div`
  display: flex;
  height: 100%;
  flex-grow: 1;
  overflow: auto;

  ${mobile()} {
    flex-direction: column;
  }
`;

export const RunButton = styled(ActionButton)`
  box-shadow: ${({ theme }) => theme.shadow.medium};
  width: 92px;
  padding: 8px 16px;
  font-size: 12px;
  height: 100%;
`;

export const Section = styled.div`
  height: 100%;
  width: 50%;
  padding-left: 16px;
  padding-right: 16px;
  position: relative;

  ${mobile()} {
    width: 100%;
    margin-bottom: 32px;
  }
`;

export const SectionHeader = styled.div<{ fullScreen?: boolean }>`
  display: flex;
  align-items: center;
  background-color: ${({ theme, fullScreen }) =>
    fullScreen ? theme.color.navBackground : 'transparent'};
  box-shadow: ${({ theme, fullScreen }) => (fullScreen ? theme.shadow.medium : 'none')};
  position: relative;
  z-index: ${({ theme }) => theme.zIndex.z1};
  flex-shrink: 0;
  line-height: 1;
  height: ${HEADER_HEIGHT}px;
  width: 100%;
  max-width: 100%;
  overflow: auto;
  border-top-left-radius: ${BORDER_RADIUS}px;
  border-top-right-radius: ${BORDER_RADIUS}px;
`;

export const RunCodeHeader = styled.div<{ fullScreen?: boolean }>`
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: ${({ theme }) => theme.zIndex.z1};
`;
// export const RunCodeHeader = styled.div<{ fullScreen?: boolean }>`
//   display: flex;
//   align-items: center;
//   justify-content: space-between;
//   padding: 0 24px;
//   background-color: ${({ theme, fullScreen }) =>
//     fullScreen ? theme.color.navBackground : theme.color.backgroundSecondary};
//   box-shadow: ${({ theme, fullScreen }) => (fullScreen ? theme.shadow.medium : 'none')};
//   position: relative;
//   z-index: ${({ theme }) => theme.zIndex.z1};
//   flex-shrink: 0;
//   line-height: 1;
//   height: ${HEADER_HEIGHT}px;
//   width: 100%;
//   max-width: 100%;
//   overflow: auto;
// `;

export const SectionContent = styled.div<{ fullScreen?: boolean }>`
  border-radius: ${({ fullScreen }) => (fullScreen ? `${BORDER_RADIUS}px` : 0)};
  box-shadow: ${({ theme, fullScreen }) => (fullScreen ? theme.shadow.stroke : 'none')},
    ${({ theme, fullScreen }) => (fullScreen ? theme.shadow.medium : 'none')};
  height: 100%;
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;

  .react-codemirror2 {
    height: 100%;
    overflow: auto;
    border-bottom-left-radius: ${({ fullScreen }) => (fullScreen ? `${BORDER_RADIUS}px` : 0)};
    border-bottom-right-radius: ${({ fullScreen }) => (fullScreen ? `${BORDER_RADIUS}px` : 0)};
  }

  .CodeMirror {
    height: 100%;
  }

  .CodeMirror-empty {
    color: #546e7a;
  }

  .CodeMirror-code {
    &:focus {
      outline: none;
    }
  }

  .CodeMirror-lines {
    padding: 8px 0;
  }
`;

export const VisibleTab = styled.div<{ visible: boolean }>`
  display: ${({ visible }) => (visible ? 'flex' : 'none')};
  height: 100%;
  width: 100%;
  position: relative;
  flex: 1 1 auto;
  overflow: auto;
  overflow: hidden;
  flex-direction: column;
`;

export const UserCodeSection = styled.div<{ fullScreen?: boolean; visible: boolean }>`
  display: ${({ visible }) => (visible ? 'block' : 'none')};
  border-radius: ${({ fullScreen }) => (fullScreen ? `${BORDER_RADIUS}px` : 0)};
  height: 100%;
  width: 100%;
  position: relative;
  flex: 1 1 auto;
  overflow: auto;

  .react-codemirror2 {
    height: calc(
      100% - ${({ fullScreen }) => (fullScreen ? HEADER_HEIGHT : BOTTOM_HEIGHT)}px
    ) !important;
    overflow: auto;
  }

  .CodeMirror {
    height: 100%;
  }

  .CodeMirror-code {
    &:focus {
      outline: none;
    }
  }

  .CodeMirror-lines {
    padding: 8px 0;
  }
`;

export const FlexWrapperCenter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const TopBar = styled(FlexWrapperCenter)`
  width: 100%;
  height: 100%;
  padding: 12px;
`;

export const BottomBar = styled(FlexWrapperCenter)`
  height: ${BOTTOM_HEIGHT}px;
  padding: 14px;
`;

export const SavingText = styled.span`
  color: ${({ theme }) => theme.color.textSecondary};
  margin-left: 12px;
  font-size: 12px;
`;

export const ResetText = styled.span`
  margin-right: 8px;
  font-size: 12px;
  transform: translateX(8px);
  opacity: 0;
  transition: transform 100ms linear, opacity 100ms linear;
`;

export const SvgButton = styled(RawButton)`
  line-height: 1;
  display: flex;
  align-items: center;
  margin-left: 16px;

  &:hover {
    ${ResetText} {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;

export const FlexItems = styled.div`
  display: flex;
  align-items: center;
  height: 100%;
`;

export const ToggleContainer = styled.div`
  display: flex;
  margin: 0 auto;
  padding: 0 24px;
`;

export const ToggleButton = styled(PillButton)<{ isActive: boolean }>`
  font-weight: 600;
  font-size: 0.9em;
  padding: 10px;
  padding-bottom: 6px;
  margin-right: 6px;
  margin-left: 6px;
  margin-bottom: 0;
  outline: none;
  border-radius: 0;
  border-bottom: 2px solid
    ${({ theme, isActive }) => (isActive ? theme.color.brand : 'transparent')};

  &:focus {
    outline: none;
    border-bottom: 2px solid ${({ theme }) => theme.color.brand};
  }
`;

export const TextSection = styled.div<{ fullScreen?: boolean }>`
  background-color: ${({ theme, fullScreen }) =>
    fullScreen ? theme.color.backgroundSecondary : 'transparent'};
  border-bottom-left-radius: ${({ fullScreen }) => (fullScreen ? `${BORDER_RADIUS}px` : 0)};
  border-bottom-right-radius: ${({ fullScreen }) => (fullScreen ? `${BORDER_RADIUS}px` : 0)};
  height: 100%;
  overflow-y: auto;
  padding: 16px 8px;
`;

export const ResultsText = styled.div`
  height: 100%;
  overflow-y: auto;
  font-weight: 400;
  font-size: 14px;

  ul,
  ol {
    padding: 0;
  }

  /* Room for two-digit numbers ("11.") to the left of each test */
  ol {
    padding-left: 12px;
  }

  ol li {
    margin-left: ${CONTAINER_PAD}px;
    margin-bottom: 6px;
  }

  li p {
    padding: 0;
    margin: 0;
    margin-bottom: ${CONTAINER_PAD}px;
  }
`;

export const TextContent = styled(Content)`
  font-weight: 400;
  font-size: 14px;

  ol li {
    margin-left: ${CONTAINER_PAD}px;
  }

  li p {
    padding: 0;
    margin: 0;
    margin-bottom: ${CONTAINER_PAD}px;
  }
`;

export const BlurBox = styled.div<{ isVisible: boolean }>`
  height: 100%;
  max-height: calc(100% - ${HEADER_HEIGHT}px);
  position: relative;
  filter: ${({ isVisible }) => (isVisible ? 'none' : 'blur(4px)')};
  transition: filter 100ms linear;
`;

export const SolutionToggleButton = styled(GhostButton)`
  box-shadow: ${({ theme }) => theme.shadow.medium};
  position: absolute;
  top: ${HEADER_HEIGHT}px;
  bottom: 0;
  left: 50%;
  right: 50%;
  transform: translate(-50%);
  margin: auto;
  padding-left: 16px;
  padding-right: 16px;
  font-size: 0.9em;
  height: 48px;
  min-width: 200px;
  font-weight: 600;
`;

export const ResultText = styled.div``;

export const UnavailableNotice = styled.p`
  margin: 0;
  padding: 8px 16px;
  font-size: 14px;
  background-color: ${({ theme }) => theme.color.backgroundSecondary};
`;

export const SpecTestsSection = styled.div`
  height: 100%;
  overflow-y: auto;
  padding: 12px 16px;
  font-size: 14px;

  ol {
    padding-left: 20px;
  }

  li + li {
    margin-top: 12px;
  }
`;

// "Line 7" in a compile error, which moves the editor's cursor there
export const LineButton = styled(RawButton)`
  text-decoration: underline;
  font-weight: 600;
  color: inherit;
`;

export const OutputText = styled.pre`
  margin: 8px 0 0;
  padding: 12px;
  border-radius: 4px;
  background-color: ${({ theme }) => theme.color.backgroundSecondary};
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-word;
`;

export const AnswerText = styled.div`
  font-weight: 300;
  font-size: 12px;
`;

export const ResultItem = styled.li<{ passed: boolean }>`
  ${ResultText} {
    display: flex;
    align-items: center;
    color: ${({ passed }) => (passed ? '#04c23b' : '#ff3737')};
  }

  svg {
    fill: ${({ passed }) => (passed ? '#04c23b' : '#ff3737')};
    margin-left: 4px;
  }
`;

export const LanguageSelectWrapper = styled.div`
  margin-left: 12px;
`;