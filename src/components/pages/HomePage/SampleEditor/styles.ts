import styled from 'styled-components';
import { mobile } from 'style/breakpoints';

export const Wrapper = styled.div`
  height: 96vh;
  max-height: 880px;

  ${mobile()} {
    height: auto;
  }
`;
