import * as React from 'react';

import { Container, Table, Row, Cell } from './styles';

type SudokuBoard = number[][];

interface Props {
  board?: SudokuBoard;
}

const MIN_VALUE = 1;
const DEFAULT_BOARD_SIZE = 9;
const PROBABILITY_TO_FILL_SQUARE = 0.2;

const DEFAULT_BOARD = [
  [0, 0, 6, 0, 0, 4, 0, 0, 0],
  [5, 0, 0, 1, 0, 0, 0, 0, 8],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 4, 0, 0, 0, 3, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 2, 0, 0, 0, 0, 0, 0],
  [4, 1, 0, 8, 0, 0, 9, 0, 0],
  [7, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 6, 0, 0, 1],
];

const isEmptySquare = () => Math.random() > PROBABILITY_TO_FILL_SQUARE;

const getRandomInt = (max: number) => Math.floor(Math.random() * max + MIN_VALUE);

const generateRow = (size: number) => {
  const row = [];

  for (let i = 0; i < size; i++) {
    const cell = isEmptySquare() ? 0 : getRandomInt(size);
    row.push(cell);
  }

  return row;
};

const generateBoard = (size = DEFAULT_BOARD_SIZE) => {
  const board = [];

  for (let i = 0; i < size; i++) {
    board.push(generateRow(size));
  }

  return board;
};

const SudokuBoard: React.FC<Props> = ({ board = DEFAULT_BOARD }) => {
  const [generatedBoard] = React.useState(DEFAULT_BOARD || generateBoard());

  return (
    <Container style={{ marginTop: '32px' }}>
      <Table>
        <tbody>
          {(board || generatedBoard).map((row, i) => {
            return (
              <Row key={i}>
                {row.map((cell, j) => {
                  return <Cell key={j}>{!!cell ? cell : ' '}</Cell>;
                })}
              </Row>
            );
          })}
        </tbody>
      </Table>
    </Container>
  );
};

export default SudokuBoard;
