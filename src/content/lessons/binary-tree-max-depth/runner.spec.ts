import { defineSpec } from 'utils/shared/runner/spec';

// Depth counts edges: an empty tree is -1 and a lone root is 0.
// Trees are in level order, with null for a missing child.
export default defineSpec({
  kind: 'function',
  entry: 'findMaxDepth',
  params: [{ name: 'root', type: 'BinaryNode?' }],
  returns: 'int',
  tests: [
    { description: 'handles an empty tree', args: [null], expected: -1 },
    { description: 'handles only a root', args: [[42]], expected: 0 },
    { description: 'normal case', args: [[42, 20, 50, 20, null, 70, null, null, 17]], expected: 3 },
    {
      description: 'unbalanced case',
      args: [[42, null, 50, null, 55, null, 65, null, 75, null, 85]],
      expected: 5,
    },
    {
      description: 'multiple nodes at the same level',
      args: [[42, 20, 50, 17, 25, null, 70, 12, 18, 24, 27, null, 80]],
      expected: 3,
    },
  ],
});
