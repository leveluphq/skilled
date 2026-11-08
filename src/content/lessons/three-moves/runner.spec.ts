import { defineSpec } from 'utils/shared/runner/spec';

export default defineSpec({
  kind: 'function',
  entry: 'countTotalMoves',
  // A negative length has no ways to finish: the answer is 0
  params: [{ name: 'boardLength', type: 'int' }],
  returns: 'int',
  tests: [
    { description: 'invalid', args: [-1], expected: 0 },
    { description: 'empty', args: [0], expected: 1 },
    { description: '1', args: [1], expected: 1 },
    { description: '2', args: [2], expected: 2 },
    { description: '3', args: [3], expected: 4 },
    { description: '4', args: [4], expected: 7 },
    { description: '5', args: [5], expected: 13 },
    { description: '10', args: [10], expected: 274 },
    { description: 'invalid (more negative)', args: [-5], expected: 0 },
  ],
});
