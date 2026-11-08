import { defineSpec } from 'utils/shared/runner/spec';

// 1, 2, ..., n
const range = (n: number) => Array.from({ length: n }, (_, i) => i + 1);

export default defineSpec({
  kind: 'function',
  entry: 'walkMatrix',
  // `[[]]` is a 1x0 matrix, whose walk is `[]`
  params: [{ name: 'matrix', type: 'int[][]' }],
  returns: 'int[]',
  tests: [
    { description: 'empty outer matrix', args: [[]], expected: [] },
    { description: 'empty matrix', args: [[[]]], expected: [] },
    { description: '1x1', args: [[[1]]], expected: [1] },
    { description: '1 x c matrix', args: [[[1, 2, 3]]], expected: [1, 2, 3] },
    { description: 'r x 1 matrix', args: [[[1], [2], [3]]], expected: [1, 2, 3] },
    {
      description: '2x2',
      args: [
        [
          [1, 2],
          [4, 3],
        ],
      ],
      expected: [1, 2, 3, 4],
    },
    {
      description: 'square matrix',
      args: [
        [
          [0, 1, 2, 3],
          [11, 12, 13, 4],
          [10, 15, 14, 5],
          [9, 8, 7, 6],
        ],
      ],
      expected: [0, ...range(15)],
    },
    {
      description: "numbers aren't explicitly increasing",
      args: [
        [
          [2, 4, 1, 3],
          [10, 50, 6, 5],
          [19, 20, 21, 22],
        ],
      ],
      expected: [2, 4, 1, 3, 5, 22, 21, 20, 19, 10, 50, 6],
    },
    {
      description: 'wide matrix',
      args: [
        [
          [1, 2, 3, 4],
          [10, 11, 12, 5],
          [9, 8, 7, 6],
        ],
      ],
      expected: range(12),
    },
    {
      description: 'tall matrix',
      args: [
        [
          [1, 2, 3],
          [12, 13, 4],
          [11, 14, 5],
          [10, 15, 6],
          [9, 8, 7],
        ],
      ],
      expected: range(15),
    },
    {
      description: 'large wide matrix',
      args: [
        [
          [1, 2, 3, 4, 5, 6, 7, 8, 9],
          [22, 23, 24, 25, 26, 27, 28, 29, 10],
          [21, 36, 35, 34, 33, 32, 31, 30, 11],
          [20, 19, 18, 17, 16, 15, 14, 13, 12],
        ],
      ],
      expected: range(36),
    },
    {
      description: 'large tall matrix',
      args: [
        [
          [1, 2, 3, 4],
          [22, 23, 24, 5],
          [21, 36, 25, 6],
          [20, 35, 26, 7],
          [19, 34, 27, 8],
          [18, 33, 28, 9],
          [17, 32, 29, 10],
          [16, 31, 30, 11],
          [15, 14, 13, 12],
        ],
      ],
      expected: range(36),
    },
  ],
});
