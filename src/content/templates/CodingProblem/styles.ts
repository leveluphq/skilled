import styled from 'styled-components';
import { Container, GhostButton, RawButton } from 'style/elements';
import { BaseSection, videoWrapperStyles } from 'style/elements/lesson';

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
  overflow-anchor: none;
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
