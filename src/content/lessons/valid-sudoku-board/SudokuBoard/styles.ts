import styled from 'styled-components';
import { Container as BaseContainer } from 'style/elements';

export const Container = styled(BaseContainer)`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const Table = styled.table`
  border-collapse: collapse;
  border: 3px solid ${({ theme }) => theme.color.textPrimary};
`;

export const Row = styled.tr``;

export const Cell = styled.td`
  color: ${({ theme }) => theme.color.textPrimary};
  border: 1px solid ${({ theme }) => theme.color.textPrimary};
  line-height: 1;
  width: 32px;
  height: 32px;
  padding: 0 !important;
  text-align: center;
  font-size: 14px;
`;
