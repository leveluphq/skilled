import React from 'react';

import { Container, Wrapper, Column } from './styles';

interface Props {
  table: JSX.Element;
  dataStructure: JSX.Element;
}

const CheatSheetTables: React.FC<Props> = ({ table, dataStructure }) => {
  return (
    <Container>
      <Wrapper>
        <Column>{dataStructure}</Column>
        <Column>{table}</Column>
      </Wrapper>
    </Container>
  );
};

export default CheatSheetTables;
