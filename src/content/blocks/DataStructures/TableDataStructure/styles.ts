import styled from 'styled-components';
import { Container as BaseContainer } from 'style/elements';

export const Container = styled(BaseContainer)`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const Table = styled.table`
  border-collapse: collapse;

  tr th {
    padding-bottom: 20px;
  }
`;

export const Cell = styled.td`
  color: ${({ theme }) => theme.color.textPrimary};
  border: 1px solid ${({ theme }) => theme.color.textPrimary};
  line-height: 1;
  padding: 12px 24px !important;
  text-align: center;
  font-size: 14px;
`;

export const Row = styled.tr`
  ${Cell}:first-child {
    border: none;
  }
`;
