import styled from 'styled-components';
import { mobile } from 'style/breakpoints';

export const ImageColumns = styled.div`
  display: flex;
  justify-content: space-between;

  ${mobile()} {
    flex-direction: column;
  }

  img {
    width: 48%;
    height: auto;
    border-radius: 8px;

    ${mobile()} {
      width: 100%;
      margin-top: 8px;
      margin-bottom: 8px;
    }
  }
`;
