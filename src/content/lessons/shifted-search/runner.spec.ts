import { defineSpec } from 'utils/shared/runner/spec';

const ROTATED = [3, 4, 5, 6, 7, 8, 9, 0, 1, 2];

export default defineSpec({
  kind: 'function',
  entry: 'findTargetIndex',
  params: [
    { name: 'items', type: 'int[]' },
    { name: 'target', type: 'int' },
  ],
  // The index of the target, or -1 when it isn't there
  returns: 'int',
  tests: [
    { description: 'empty', args: [[], 5], expected: -1 },
    { description: 'one item found', args: [[5], 5], expected: 0 },
    { description: 'one item not found', args: [[5], 2], expected: -1 },
    { description: 'found larger array left', args: [ROTATED, 5], expected: 2 },
    { description: 'found larger array after rotation', args: [ROTATED, 9], expected: 6 },
    { description: 'found right array 1', args: [ROTATED, 1], expected: 8 },
    { description: 'not found larger array', args: [ROTATED, 10], expected: -1 },
    { description: 'first item found', args: [ROTATED, 3], expected: 0 },
    { description: 'last item found', args: [ROTATED, 2], expected: 9 },
  ],
});
