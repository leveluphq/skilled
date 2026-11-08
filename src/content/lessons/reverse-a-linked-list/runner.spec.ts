import { defineSpec } from 'utils/shared/runner/spec';

// Lists are given and returned as arrays of their nodes' data, so the empty
// list [] is a null head, given or returned.
export default defineSpec({
  kind: 'function',
  entry: 'reverseLinkedList',
  params: [{ name: 'head', type: 'ListNode?' }],
  returns: 'ListNode?',
  tests: [
    { description: 'empty', args: [[]], expected: [] },
    { description: 'one item', args: [[1]], expected: [1] },
    {
      description: 'multiple items',
      args: [[1, 3, 5, 7, 11, 13, 19, 23]],
      expected: [23, 19, 13, 11, 7, 5, 3, 1],
    },
  ],
});
