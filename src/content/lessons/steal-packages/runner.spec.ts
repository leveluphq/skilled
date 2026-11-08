import { defineSpec } from 'utils/shared/runner/spec';

export default defineSpec({
  kind: 'function',
  entry: 'stealPackages',
  params: [{ name: 'packageValues', type: 'int[]' }],
  returns: 'int',
  tests: [
    { description: 'empty', args: [[]], expected: 0 },
    { description: 'one item', args: [[5]], expected: 5 },
    { description: 'alternating values', args: [[2, 3, 5, 1]], expected: 7 },
    { description: 'skip two houses', args: [[1, 10, 3, 2, 5]], expected: 15 },
    { description: 'all same value', args: [[1, 1, 1, 1, 1]], expected: 3 },
    { description: 'always increasing', args: [[1, 2, 3, 4, 5]], expected: 9 },
    { description: 'always decreasing', args: [[5, 4, 3, 2, 1]], expected: 9 },
  ],
});
