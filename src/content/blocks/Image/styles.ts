import styled from 'styled-components';
import { MarginContainer } from 'content/blocks/styles';
import { mobile } from 'style/breakpoints';

export const Container = styled(MarginContainer)`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

export const Img = styled.img<{ maxWidth?: string }>`
  border-radius: 6px;
  height: auto;
  max-width: ${({ maxWidth }) => (maxWidth ? `${maxWidth} !important` : '100%')};

  ${mobile()} {
    max-width: 100% !important;
  }
`;

export const Credit = styled.div`
  margin-top: 4px;
  font-size: 12px;
  color: ${({ theme }) => theme.color.textSecondary};
  text-align: center;
  width: 100%;

  a,
  a:hover,
  a:visited {
    color: ${({ theme }) => theme.color.textSecondary};
    text-decoration: underline;
  }
`;
