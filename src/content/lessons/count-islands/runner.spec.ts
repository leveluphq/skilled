import { defineSpec } from 'utils/shared/runner/spec';

export default defineSpec({
  kind: 'function',
  entry: 'countIslands',
  // `grid` rather than `map`: map is a keyword in Go and clashes with std::map in C++
  params: [{ name: 'grid', type: 'char[][]' }],
  returns: 'int',
  tests: [
    { description: 'empty', args: [[[]]], expected: 0 },
    { description: 'one land', args: [[['#']]], expected: 1 },
    { description: 'one water', args: [[['~']]], expected: 0 },
    {
      description: 'two islands',
      args: [
        [
          ['~', '~', '~', '~', '~', '~', '#', '#', '#', '#', '~', '~', '~', '~'],
          ['~', '~', '~', '#', '#', '#', '#', '~', '~', '~', '~', '~', '~', '~'],
          ['~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '#', '#', '#', '#'],
          ['~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '#', '#', '#'],
          ['~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '#', '#', '#'],
        ],
      ],
      expected: 2,
    },
    {
      description: 'four islands',
      args: [
        [
          ['~', '~', '~', '#', '#'],
          ['~', '~', '~', '#', '#'],
          ['~', '#', '~', '~', '~'],
          ['~', '~', '#', '~', '~'],
          ['~', '~', '~', '~', '#'],
        ],
      ],
      expected: 4,
    },
  ],
});
