import { defineSpec } from 'utils/shared/runner/spec';

// Trees are in level order, with null for a missing child
export default defineSpec({
  kind: 'function',
  entry: 'isBST',
  params: [{ name: 'root', type: 'BinaryNode' }],
  returns: 'bool',
  tests: [
    { description: 'handles only a root', args: [[42]], expected: true },
    {
      description: 'false case with duplicate node',
      args: [[42, 20, 50, 20, null, 70, null, null, 17]],
      expected: false,
    },
    {
      description: 'unbalanced true case',
      args: [[42, null, 50, null, 55, null, 65, null, 75, null, 85]],
      expected: true,
    },
    {
      description: 'unbalanced false case',
      args: [[42, null, 50, null, 55, null, 65, null, 95, null, 85]],
      expected: false,
    },
    {
      description: 'multiple nodes at the same level true case',
      args: [[42, 20, 50, 17, 25, null, 70, 12, 18, 24, 27, null, 80]],
      expected: true,
    },
    {
      description: 'false case where a left descendant is larger than an ancestor',
      args: [[9, 5, 22, 1, 10, null, 30]],
      expected: false,
    },
    {
      description: 'false case where a right descendant is smaller than an ancestor',
      args: [[9, 5, 22, 1, 7, 8, 30]],
      expected: false,
    },
  ],
});
