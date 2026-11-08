import styled from 'styled-components';
import { Container, GhostButton, PillButton, Input as BaseInput } from 'style/elements';

export const Wrapper = styled(Container)`
  margin-top: 16px;
`;

export const Form = styled.div`
  display: flex;
  margin-bottom: 8px;
`;

export const Input = styled(BaseInput)`
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  padding: 6px 16px;
`;

export const Button = styled(GhostButton)`
  flex-shrink: 0;
  font-size: 14px;
  font-weight: 400;
  padding-left: 24px;
  padding-right: 24px;
`;

export const ControlWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
`;

export const ControlButton = styled(PillButton)``;

export const PermList = styled.div`
  display: flex;
  flex-wrap: wrap;
  text-align: center;
  font-weight: 600;
`;

export const Character = styled.span<{ isVisited: boolean }>`
  color: ${({ isVisited, theme }) =>
    isVisited ? theme.color.basePalette.Purple : theme.color.textSecondary};
`;
