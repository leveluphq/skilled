import { defineSpec } from 'utils/shared/runner/spec';

export default defineSpec({
  kind: 'function',
  entry: 'minCoinsForChange',
  params: [
    { name: 'denominations', type: 'int[]' },
    { name: 'target', type: 'int' },
  ],
  // The fewest coins that make the target, or -1 when no combination does
  returns: 'int',
  tests: [
    { description: 'empty', args: [[], 5], expected: -1 },
    { description: 'simple case two coins', args: [[2, 3], 8], expected: 3 },
    { description: 'simple case three coins', args: [[1, 5, 10], 12], expected: 3 },
    { description: 'multiple options', args: [[5, 10], 30], expected: 3 },
    { description: 'multiple options combined', args: [[5, 10], 35], expected: 4 },
    { description: 'unreachable small', args: [[3, 6, 11], 13], expected: -1 },
    { description: 'below minimum denomination', args: [[5, 10], 2], expected: -1 },
    { description: 'three coin options', args: [[5, 10, 25], 65], expected: 4 },
    { description: 'four coin options', args: [[1, 5, 10, 25], 67], expected: 6 },
    { description: 'five coin options', args: [[5, 10, 25, 50, 100], 190], expected: 5 },
    { description: 'unreachable large', args: [[5, 10, 25], 53], expected: -1 },
    { description: 'change from top-down explanation', args: [[2, 3, 7], 11], expected: 3 },
    { description: 'target is 0', args: [[2, 3, 7], 0], expected: 0 },
    { description: 'target is 1', args: [[2, 3, 7], 1], expected: -1 },
  ],
});
