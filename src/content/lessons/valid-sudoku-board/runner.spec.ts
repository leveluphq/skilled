import { defineSpec } from 'utils/shared/runner/spec';

export default defineSpec({
  kind: 'function',
  entry: 'isValidSudokuBoard',
  // 0 is an empty cell
  params: [{ name: 'board', type: 'int[][]' }],
  returns: 'bool',
  tests: [
    {
      description: 'valid standard 9x9',
      args: [
        [
          [0, 0, 6, 0, 0, 4, 0, 0, 0],
          [5, 0, 0, 1, 0, 0, 0, 0, 8],
          [0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 4, 0, 0, 0, 3, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 2, 0, 0, 0, 0, 0, 0],
          [4, 1, 0, 8, 0, 0, 9, 0, 0],
          [7, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 6, 0, 0, 1],
        ],
      ],
      expected: true,
    },
    {
      description: 'invalid (col) standard 9x9',
      args: [
        [
          [0, 0, 6, 0, 0, 4, 0, 0, 0],
          [5, 0, 0, 1, 0, 0, 0, 0, 8],
          [0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 4, 0, 0, 0, 3, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 2, 0, 0, 0, 0, 0, 0],
          [4, 1, 0, 8, 0, 0, 9, 0, 0],
          [7, 0, 0, 0, 0, 0, 0, 0, 0],
          [5, 0, 0, 0, 0, 6, 0, 0, 1],
        ],
      ],
      expected: false,
    },
    {
      description: 'invalid (row) standard 9x9',
      args: [
        [
          [0, 0, 6, 0, 0, 4, 0, 0, 0],
          [5, 0, 0, 1, 0, 0, 0, 0, 8],
          [0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 4, 0, 0, 0, 3, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 2, 0, 0, 0, 0, 0, 0],
          [4, 1, 0, 8, 0, 0, 9, 0, 0],
          [7, 0, 0, 0, 0, 7, 0, 0, 0],
          [0, 0, 0, 0, 0, 6, 0, 0, 1],
        ],
      ],
      expected: false,
    },
    {
      description: 'invalid (sub-squares) standard 9x9',
      args: [
        [
          [0, 0, 6, 0, 0, 4, 0, 0, 0],
          [5, 0, 0, 1, 0, 0, 0, 0, 8],
          [0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 4, 0, 0, 0, 3, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 2, 0, 0, 0, 0, 0, 0],
          [4, 1, 0, 8, 0, 0, 9, 0, 0],
          [7, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 6, 0, 9, 1],
        ],
      ],
      expected: false,
    },
    { description: 'valid 1x1', args: [[[1]]], expected: true },
    // One row with no cells
    { description: 'empty', args: [[[]]], expected: false },
    {
      description: '2x2 is invalid',
      args: [
        [
          [1, 2],
          [0, 1],
        ],
      ],
      expected: false,
    },
    {
      description: 'valid 4x4',
      args: [
        [
          [0, 0, 3, 0],
          [2, 0, 0, 1],
          [0, 0, 0, 0],
          [0, 4, 0, 0],
        ],
      ],
      expected: true,
    },
    {
      description: 'invalid 4x4',
      args: [
        [
          [0, 4, 2, 0],
          [4, 0, 0, 1],
          [0, 0, 0, 0],
          [0, 2, 0, 0],
        ],
      ],
      expected: false,
    },
    {
      description: 'invalid shape',
      args: [
        [
          [0, 0, 3, 0],
          [2, 0, 0, 1],
          [0, 0, 0, 0],
        ],
      ],
      expected: false,
    },
  ],
});
