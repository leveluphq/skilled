import styled from 'styled-components';
import { mobile, tablet } from 'style/breakpoints';

export const Wrapper = styled.div`
  width: ${100 / 3}%;
  display: inline-flex;
  padding: 24px;
  line-height: 1;

  ${tablet()} {
    width: 50%;
    padding: 16px;
  }

  ${mobile()} {
    width: 100%;
    padding: 12px;
  }
`;

export const Content = styled.div`
  width: 100%;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.color.backgroundPrimary};
  border-left: 4px solid ${({ theme }) => theme.color.brand};
  padding: 1.5rem 1.75rem;
  box-shadow: ${({ theme }) => `${theme.shadow.stroke}, ${theme.shadow.high}`};
  display: inline-flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  line-height: 1;
  font-size: 1.1em;
`;
