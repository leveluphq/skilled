import { defineSpec } from 'utils/shared/runner/spec';

export default defineSpec({
  kind: 'function',
  entry: 'sortByAge',
  // Ages are whole numbers from 0 to 100
  params: [{ name: 'ageList', type: 'int[]' }],
  returns: 'int[]',
  tests: [
    { description: 'empty', args: [[]], expected: [] },
    { description: 'one item', args: [[42]], expected: [42] },
    { description: 'two items', args: [[42, 1]], expected: [1, 42] },
    { description: 'unique sort', args: [[33, 25, 99, 50, 42]], expected: [25, 33, 42, 50, 99] },
    {
      description: 'sort with duplicates',
      args: [[1, 3, 1, 3, 1, 4, 6, 5, 6]],
      expected: [1, 1, 1, 3, 3, 4, 5, 6, 6],
    },
  ],
});
