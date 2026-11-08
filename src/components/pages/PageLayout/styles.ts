import styled from 'styled-components';

export const Page = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  max-width: 100vw;
`;

export const PageContent = styled.main`
  flex-grow: 1;

  &:focus {
    outline: none;
  }
`;
