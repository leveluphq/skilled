import styled from 'styled-components';
import { Container } from 'style/elements';
import { mobile } from 'style/breakpoints';

export const ButtonWrapper = styled(Container)`
  margin-top: 40px;
  margin-bottom: 40px;
`;

export const PageContainer = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;

  ${mobile()} {
    height: auto;
  }
`;

export const Wrapper = styled.div`
  display: flex;
  height: 100%;
  max-width: 100vw;
  flex: 1;
  overflow-y: auto;

  ${mobile()} {
    width: 100vw;
    overflow: visible;
  }
`;

export const ArticleSection = styled.div<{ width: number }>`
  overflow: auto;
  width: ${({ width }) => width}%;
  max-width: ${({ width }) => width}%;
  padding-top: 32px;

  ${mobile()} {
    width: 100vw;
    max-width: 100vw;
    overflow: visible;
  }
`;

export const VideoSection = styled.div<{ width: number }>`
  border-left: 1px solid ${({ theme }) => theme.color.border};
  width: ${({ width }) => width}%;
  max-width: ${({ width }) => width}%;
  display: flex;
  flex-direction: column;

  ${mobile()} {
    display: none;
  }
`;

export const VisibleMobile = styled.div`
  display: none;
  width: 100%;
  margin: 0 auto;
  max-width: 736px;
  padding: 0 16px;
  margin-bottom: 0;
  margin-top: 48px;

  ${mobile()} {
    display: block;
  }
`;
