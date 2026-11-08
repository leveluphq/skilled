import styled from 'styled-components';

export const Wrapper = styled.div`
  padding: 1rem;
  max-width: 960px;
  margin-left: auto;
  margin-right: auto;
`;

export const Section = styled.div`
  margin-top: 2rem;
`;

export const SectionTitle = styled.h2`
  font-weight: 400;
  margin-bottom: 0.5rem;
`;

export const Item = styled.p`
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;

  svg {
    margin-left: 4px;
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

export const ListItem = styled.li`
  font-weight: 300;
  margin-bottom: 0.5rem;
  line-height: 1.425;
`;

export const Paragraph = styled.p`
  font-weight: 300;
  margin-bottom: 0.5rem;
  line-height: 1.425;

  &:last-of-type {
    margin-bottom: 0;
  }
`;

export const BoldText = styled.strong`
  color: ${({ theme }) => theme.color.brand};
`;

export const ClickTable = styled.table`
  width: 100%;

  th {
    border-bottom: 1px solid ${({ theme }) => theme.color.border};
    font-weight: 600;
  }

  th,
  td {
    line-height: 2;
    text-align: center;

    &:first-of-type {
      text-align: left;
    }
  }
`;

export const AllSalesTable = styled.table`
  width: 100%;

  th {
    border-bottom: 1px solid ${({ theme }) => theme.color.border};
    font-weight: 600;
  }

  th,
  td {
    line-height: 2;
    text-align: center;

    &:first-of-type {
      text-align: left;
    }
  }
`;
