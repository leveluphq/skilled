import { defineSpec } from 'utils/shared/runner/spec';

export default defineSpec({
  kind: 'function',
  entry: 'getMaxProfit',
  params: [{ name: 'prices', type: 'int[]' }],
  // 0 when no trade makes a profit, including fewer than two prices
  returns: 'int',
  tests: [
    { description: 'empty prices', args: [[]], expected: 0 },
    { description: 'one price', args: [[42]], expected: 0 },
    { description: 'question prompt example', args: [[9, 2, 4, 3, 8, 5]], expected: 6 },
    { description: 'price decrease then increase', args: [[10, 7, 3, 4, 6]], expected: 3 },
    { description: 'price increase then decrease', args: [[3, 4, 5, 10, 7]], expected: 7 },
    { description: 'replace previous max', args: [[3, 4, 5, 10, 2, 20]], expected: 18 },
    { description: 'always increasing', args: [[1, 2, 3, 4, 5, 6]], expected: 5 },
    { description: 'always decreasing', args: [[6, 5, 4, 3, 2, 1]], expected: 0 },
    { description: 'repeated numbers', args: [[1, 5, 1, 5, 2, 5]], expected: 4 },
    { description: 'price never changes', args: [[42, 42, 42, 42]], expected: 0 },
  ],
});
