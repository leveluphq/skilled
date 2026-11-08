import styled from 'styled-components';
import { mobile } from 'style/breakpoints';

export const Wrapper = styled.div`
  display: flex;

  ${mobile()} {
    flex-direction: column;
  }
`;

export const Column = styled.div`
  width: 100%;

  &:first-of-type {
    padding-right: 24px;
    border-right: 2px solid ${({ theme }) => theme.color.border};

    ${mobile()} {
      width: 100%;
      padding: 0;
      border: none;
      margin-bottom: 16px;
    }
  }

  &:last-of-type {
    padding-left: 24px;

    ${mobile()} {
      width: 100%;
      padding: 0;
      border: none;
      margin-top: 16px;
    }
  }

  ${mobile()} {
    width: 100%;
    padding: 0;
    border: none;
  }
`;

export const SectionTitle = styled.div`
  font-size: 28px;
  margin-bottom: 6px;
  font-weight: 600;
`;

export const List = styled.ul`
  list-style: none;
  padding: 0 !important;
`;

export const ListItem = styled.li`
  margin: 0 !important;
  padding: 0 !important;
  margin-bottom: 12px !important;
`;

export const ItemTitle = styled.div`
  font-size: 18px;
  font-weight: 400;
`;

export const ItemDescription = styled.div`
  color: ${({ theme }) => theme.color.textSecondary};
  font-weight: 300;
  line-height: 1.4;
  font-size: 14px;
`;
