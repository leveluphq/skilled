import styled from 'styled-components';

export const Table = styled.table`
  margin-left: auto;
  margin-right: auto;
  margin-top: 24px;
  text-align: center;

  thead tr {
    border-bottom: 1px solid ${({ theme }) => theme.color.textPrimary};
  }

  thead th:nth-of-type(2) {
    border-left: 1px solid ${({ theme }) => theme.color.textPrimary};
    border-right: 1px solid ${({ theme }) => theme.color.textPrimary};
  }

  tr {
    border-bottom: 1px solid ${({ theme }) => theme.color.border};
  }
`;
