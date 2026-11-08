import * as React from 'react';
import styled from 'styled-components';
import { Props } from './props';

const Header = styled.h2`
  outline: none;
  margin-bottom: 0 !important;
  padding-bottom: 0 !important;

  &:focus {
    outline: none;
  }
`;

const SectionWithHeader: React.FC<Props> = ({ header, children }) => (
  <>
    <Header>{header}</Header>
    {children}
  </>
);

export default SectionWithHeader;
