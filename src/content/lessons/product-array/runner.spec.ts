import { defineSpec } from 'utils/shared/runner/spec';

export default defineSpec({
  kind: 'function',
  entry: 'buildProductArray',
  // `nums` rather than `input`, which shadows a builtin in Python. `long`
  // because a product of several ints can pass 2^31.
  params: [{ name: 'nums', type: 'long[]' }],
  returns: 'long[]',
  tests: [
    { description: 'simple input', args: [[1, 2, 3, 4, 5]], expected: [120, 60, 40, 30, 24] },
    { description: 'with 0', args: [[0, 2, 3, 4, 5]], expected: [120, 0, 0, 0, 0] },
    {
      description: 'with negative int',
      args: [[-1, 2, 3, 4, 5]],
      expected: [120, -60, -40, -30, -24],
    },
  ],
});
