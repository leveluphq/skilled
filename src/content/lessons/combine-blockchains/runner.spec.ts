import { defineSpec } from 'utils/shared/runner/spec';

// Each chain is given as an array of its blocks' timestamps (the nodes' data).
// The prompt promises neither chain is empty, so no test passes an empty one.
export default defineSpec({
  kind: 'function',
  entry: 'combineBlockchains',
  params: [
    { name: 'chainHead1', type: 'ListNode?' },
    { name: 'chainHead2', type: 'ListNode?' },
  ],
  returns: 'ListNode?',
  tests: [
    {
      description: 'standard case',
      args: [
        [1, 3, 10],
        [2, 4, 5, 6],
      ],
      expected: [1, 2, 3, 4, 5, 6, 10],
    },
    {
      description: 'second chain has the earliest block',
      args: [
        [2, 4, 5, 6],
        [1, 3, 10],
      ],
      expected: [1, 2, 3, 4, 5, 6, 10],
    },
    { description: 'one block in each chain', args: [[5], [1]], expected: [1, 5] },
    {
      description: 'duplicate timestamps',
      args: [
        [1, 1, 3],
        [1, 2],
      ],
      expected: [1, 1, 1, 2, 3],
    },
    {
      description: 'second chain runs out before the first chain starts',
      args: [
        [10, 20],
        [1, 2, 3],
      ],
      expected: [1, 2, 3, 10, 20],
    },
  ],
});
