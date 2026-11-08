import { defineSpec } from 'utils/shared/runner/spec';

export default defineSpec({
  kind: 'function',
  entry: 'getTargetIndexes',
  params: [
    { name: 'array', type: 'int[]' },
    { name: 'target', type: 'int' },
  ],
  returns: 'int[][]',
  // The pairs in any order, and the two indexes of a pair in either order
  compare: 'unorderedPairs',
  tests: [
    { description: 'simple input', args: [[1, 2], 3], expected: [[0, 1]] },
    {
      description: 'multiple results',
      args: [[3, 4, 1, 8, 9, 2, 10], 11],
      expected: [
        [0, 3],
        [2, 6],
        [4, 5],
      ],
    },
    {
      description: 'neg and pos matches',
      args: [[4, -1, 2, 80, 9, 10, 7], 9],
      expected: [
        [1, 5],
        [2, 6],
      ],
    },
    { description: 'sums with 0', args: [[4, 8, 0], 8], expected: [[1, 2]] },
    {
      description: "won't match with itself",
      args: [[4, -3, 80, 2, 9, 13, 5, 8], 10],
      expected: [
        [1, 5],
        [3, 7],
      ],
    },
    { description: 'empty input', args: [[], 1], expected: [] },
    { description: 'no result input', args: [[-5, 10], 1], expected: [] },
  ],
});
