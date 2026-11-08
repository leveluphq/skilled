import styled from 'styled-components';
import { mobile } from 'style/breakpoints';
import { SIDEBAR_WIDTH } from 'components/blocks/Sidebar/styles';
import { PageContent as BasePageContent } from '../styles';

export const PageContent = styled(BasePageContent)<{ right?: boolean }>`
  margin-left: ${({ right }) => (right ? 0 : SIDEBAR_WIDTH)}px;
  margin-right: ${({ right }) => (right ? SIDEBAR_WIDTH : 0)}px;

  &:focus {
    outline: none;
  }

  ${mobile()} {
    margin-left: 0;
    margin-right: 0;
  }
`;
