import styled, { css } from 'styled-components';
import { RawButton } from 'style/elements';
import { mobile } from 'style/breakpoints';

interface ModalProps {
  width: string;
  maxHeight?: string;
  border?: boolean;
  dark?: boolean;
}

const BORDER_WIDTH = 1;
const modalStyles = css`
  overflow: auto;
  position: relative;
  width: 100%;
  -webkit-overflow-scrolling: touch;
  box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.7), 0px 1px 1px 0px rgba(0, 0, 0, 0.54),
    0px 2px 1px 0px rgba(0, 0, 0, 0.52);

  ${mobile()} {
    min-width: 100vw;
    min-height: 100vh;
    max-height: 100vw;
    max-width: 100vh;
    width: 100vw;
    height: 100vh;
    border: none;
  }
`;

export const ModalWrapper = styled.div<ModalProps>`
  ${modalStyles};
  background-color: ${({ theme, dark }) =>
    dark ? theme.color.backgroundPrimary : theme.color.navBackground};
  max-width: ${({ width }) => width};
  max-height: ${(props) => (props.maxHeight ? props.maxHeight : 'calc(100vh - 64px)')};
  border: ${({ theme, border }) =>
    border ? `${BORDER_WIDTH}px solid ${theme.color.border}` : 'none'};
  border-radius: 8px;
`;

export const ModalContent = styled.div`
  text-align: center;
  padding: 56px 32px;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  ${mobile()} {
    min-width: 100vw;
    min-height: 100vh;
    max-height: 100vw;
    max-width: 100vh;
    width: 100vw;
    height: 100vh;
  }
`;

export const CloseButton = styled(RawButton)`
  color: ${(props) => props.theme.color.textPrimary};
  font-size: 36px;
  position: absolute;
  top: 4px;
  right: 4px;
  width: 44px;
  height: 44px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;
