import { defineSpec } from 'utils/shared/runner/spec';

// A list without a loop is an array of its nodes' data. A list with a loop is
// { values, cycleIndex }: the tail points back to the node at cycleIndex.
const loop = (values: number[], cycleIndex: number) => ({ values, cycleIndex });

// 0, 1, ..., n - 1
const range = (n: number) => Array.from({ length: n }, (_, i) => i);

export default defineSpec({
  kind: 'function',
  entry: 'hasLoop',
  params: [{ name: 'head', type: 'ListNode?' }],
  returns: 'bool',
  tests: [
    { description: 'empty list', args: [[]], expected: false },
    { description: 'one node', args: [[1]], expected: false },
    { description: 'one node that points to itself', args: [loop([1], 0)], expected: true },
    { description: 'two nodes', args: [[1, 2]], expected: false },
    { description: 'two nodes in a loop', args: [loop([1, 2], 0)], expected: true },
    { description: 'odd number of nodes', args: [[1, 2, 3]], expected: false },
    { description: 'no loop (example 1)', args: [[42, 100, 4, 7]], expected: false },
    {
      description: 'loop starts in the middle (example 2)',
      args: [loop([0, 1, 2, 3, 4, 5, 6, 7], 2)],
      expected: true,
    },
    {
      description: 'tail points back to the head',
      args: [loop([42, 100, 4, 7], 0)],
      expected: true,
    },
    { description: 'tail points to itself', args: [loop([42, 100, 4, 7], 3)], expected: true },
    { description: 'every node has the same data', args: [[5, 5, 5, 5, 5]], expected: false },
    { description: 'repeated data', args: [[7, 3, 7, 3, 7, 3]], expected: false },
    { description: 'loop with repeated data', args: [loop([5, 5, 5, 5, 5], 2)], expected: true },
    { description: 'long list with no loop', args: [range(1000)], expected: false },
    { description: 'long list with a loop', args: [loop(range(1000), 500)], expected: true },
  ],
});
