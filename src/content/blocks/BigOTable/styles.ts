import styled from 'styled-components';

export const Table = styled.table`
  text-align: center;
  display: inline-block;

  th {
    border-bottom: 1px solid ${({ theme }) => theme.color.textPrimary};
    font-weight: 400;
  }

  tr td:first-of-type,
  tr th:first-of-type {
    border-right: 1px solid ${({ theme }) => theme.color.textPrimary};
  }
`;
