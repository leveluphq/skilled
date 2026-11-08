import styled from 'styled-components';
import { GhostButton } from 'style/elements';

export const Wrapper = styled.div`
  position: relative;
`;

export const Blur = styled.div<{ isVisible: boolean }>`
  transition: filter 100ms linear;
  filter: ${({ isVisible }) => (isVisible ? 'none' : 'blur(6px)')};
`;

export const BlurToggleButton = styled(GhostButton)`
  box-shadow: ${({ theme }) => theme.shadow.stroke}, ${({ theme }) => theme.shadow.medium};
  z-index: ${({ theme }) => theme.zIndex.z1};
  position: absolute;
  left: 50%;
  right: 50%;
  top: 0;
  bottom: 0;
  transform: translate(-50%);
  margin: auto;
  padding-left: 16px;
  padding-right: 16px;
  font-size: 0.9em;
  height: 48px;
  min-width: 200px;
  font-weight: 600;
`;
