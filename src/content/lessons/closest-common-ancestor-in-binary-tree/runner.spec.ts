import { defineSpec } from 'utils/shared/runner/spec';

// Trees are in level order, with null for a missing child. The answer is a
// node of the input tree, reported as its data.
export default defineSpec({
  kind: 'function',
  entry: 'findClosestAncestor',
  params: [
    { name: 'root', type: 'BinaryNode' },
    { name: 'firstChildValue', type: 'int' },
    { name: 'secondChildValue', type: 'int' },
  ],
  returns: 'BinaryNodeRef',
  tests: [
    {
      description: 'basic case',
      args: [[42, 20, 50, 13, null, 70, null, 8, 17, null, null, null, null, null, 40], 8, 40],
      expected: 13,
    },
    {
      description: 'unbalanced and root case',
      args: [[42, 7, 50, null, null, null, 55, null, 65, null, 75, null, 85], 7, 85],
      expected: 42,
    },
    {
      description: 'ancestor is also a child',
      args: [[42, 20, 50, 17, 25, null, 70, 12, 18, 24, 27, null, 80, null, null, 100], 17, 100],
      expected: 17,
    },
  ],
});
