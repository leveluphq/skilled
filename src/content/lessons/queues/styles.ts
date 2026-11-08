import styled from 'styled-components';
import { mobile } from 'style/breakpoints';

export const SideBySide = styled.div`
  display: flex;

  ${mobile()} {
    flex-direction: column;
  }
`;

export const SideBySideText = styled.div`
  padding-right: 32px;

  ${mobile()} {
    padding-right: 0;
  }
`;
