import * as React from 'react';
import { Container } from 'style/elements';

import { Wrapper, Header, Board, PieceWrapper, Piece, Square, Index } from './styles';

interface Props {
  board: number;
}

const BoardExample: React.FC<Props> = ({ board }) => {
  const items = new Array(board).fill(0);

  return (
    <Container>
      <Wrapper>
        <Header>Board Length: {board}</Header>
        <Board>
          <div>
            <PieceWrapper>
              <Piece />
            </PieceWrapper>
            <Index>0</Index>
          </div>
          {items.map((_item, i) => (
            <div key={i}>
              <PieceWrapper>
                <Square />
              </PieceWrapper>
              <Index>{i + 1}</Index>
            </div>
          ))}
        </Board>
      </Wrapper>
    </Container>
  );
};

export default BoardExample;
