import { defineSpec } from 'utils/shared/runner/spec';

// Lists are given and returned as arrays of their nodes' data. k counts back
// from the tail, which is k = 0.
export default defineSpec({
  kind: 'function',
  entry: 'mirrorDelete',
  params: [
    { name: 'head', type: 'ListNode?' },
    { name: 'k', type: 'int' },
  ],
  returns: 'ListNode?',
  tests: [
    {
      description: 'normal case',
      args: [[1, 3, 5, 7, 11, 13, 19, 23], 3],
      expected: [1, 3, 5, 7, 13, 19, 23],
    },
    { description: 'k > linked list length', args: [[1, 3, 5, 7], 10], expected: [1, 3, 5, 7] },
    { description: 'k === linked list length', args: [[1, 3, 5, 7], 4], expected: [1, 3, 5, 7] },
    { description: 'k corresponds to head', args: [[1, 3, 5, 7], 3], expected: [3, 5, 7] },
    { description: 'k corresponds to tail', args: [[1, 3, 5, 7], 0], expected: [1, 3, 5] },
  ],
});
