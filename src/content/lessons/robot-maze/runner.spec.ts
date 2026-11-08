import { defineSpec } from 'utils/shared/runner/spec';

export default defineSpec({
  kind: 'function',
  entry: 'hasExitPath',
  // 0 is open, 1 is blocked and 2 is an exit. The room is always a matrix, so
  // the legacy "no board" (null) case is dropped; `[]` covers an empty room.
  params: [{ name: 'roomMatrix', type: 'int[][]' }],
  returns: 'bool',
  tests: [
    { description: 'invalid board', args: [[]], expected: false },
    { description: 'no items', args: [[[]]], expected: false },
    {
      description: 'one way through',
      args: [
        [
          [0, 0, 0],
          [0, 0, 1],
          [0, 0, 1],
          [1, 0, 2],
        ],
      ],
      expected: true,
    },
    {
      description: 'small board',
      args: [
        [
          [0, 0, 0],
          [0, 0, 1],
          [0, 0, 1],
          [1, 0, 2],
        ],
      ],
      expected: true,
    },
    {
      description: 'random exit location',
      args: [
        [
          [0, 1, 1, 0, 0],
          [0, 1, 1, 1, 0],
          [0, 0, 0, 0, 0],
          [1, 1, 0, 1, 0],
          [0, 0, 2, 1, 0],
          [0, 0, 0, 1, 0],
        ],
      ],
      expected: true,
    },
    {
      description: 'many paths',
      args: [
        [
          [0, 0, 1, 1],
          [0, 0, 0, 1],
          [0, 0, 0, 1],
          [0, 0, 0, 2],
        ],
      ],
      expected: true,
    },
    {
      description: 'open board',
      args: [
        [
          [0, 0, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 2],
        ],
      ],
      expected: true,
    },
    {
      description: 'all right',
      args: [
        [
          [0, 0, 0, 2],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
        ],
      ],
      expected: true,
    },
    {
      description: 'all down',
      args: [
        [
          [0, 0, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
          [2, 0, 0, 0],
        ],
      ],
      expected: true,
    },
    {
      description: 'open board, blocked exit',
      args: [
        [
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 1],
          [0, 0, 0, 1, 2],
        ],
      ],
      expected: false,
    },
    {
      description: 'blocked path',
      args: [
        [
          [0, 0, 0, 0],
          [1, 0, 0, 1],
          [2, 1, 0, 0],
        ],
      ],
      expected: false,
    },
  ],
});
