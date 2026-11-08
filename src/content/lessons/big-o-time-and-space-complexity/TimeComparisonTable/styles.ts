import styled from 'styled-components';
import { tablet } from 'style/breakpoints';

export const Table = styled.table`
  td,
  th {
    border: 1px solid ${({ theme }) => theme.color.textPrimary};
    border-collapse: collapse;
    font-size: 0.75em;
    text-align: center;

    ${tablet()} {
      font-size: 8px;
      padding: 2px 4px !important;

      sup {
        font-size: 8px;
      }
    }
  }

  th {
    background-color: ${({ theme }) => theme.color.blackPalette.Black4};
  }

  tr td:first-child {
    background-color: ${({ theme }) => theme.color.blackPalette.Black6};
    text-align: right;
  }

  .best {
    background-color: #2f8f3a;
  }

  .good {
    background-color: #84c916;
  }

  .okay {
    background-color: #dbc21a;
  }

  .medium {
    background-color: #ee6a14;
  }

  .bad {
    background-color: #e14042;
  }
`;
