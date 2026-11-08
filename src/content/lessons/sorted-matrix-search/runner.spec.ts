import { defineSpec } from 'utils/shared/runner/spec';

const MATRIX = [
  [0, 2, 5, 8, 10],
  [1, 4, 9, 15, 20],
  [3, 7, 14, 19, 21],
  [17, 22, 23, 24, 25],
];

export default defineSpec({
  kind: 'function',
  entry: 'searchMatrix',
  params: [
    { name: 'matrix', type: 'int[][]' },
    { name: 'target', type: 'int' },
  ],
  // [row, column] of the target, or [-1, -1] when it isn't there
  returns: 'int[]',
  tests: [
    { description: 'empty', args: [[[]], 1], expected: [-1, -1] },
    { description: 'standard case', args: [MATRIX, 19], expected: [2, 3] },
    { description: 'search to top left', args: [MATRIX, 0], expected: [0, 0] },
    { description: 'search to top right', args: [MATRIX, 10], expected: [0, 4] },
    { description: 'item does not exist', args: [MATRIX, 6], expected: [-1, -1] },
  ],
});
