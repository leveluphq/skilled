import { defineSpec } from 'utils/shared/runner/spec';

// Precondition: no test calls pop, peek, getStackMax or getStackMin on an empty
// stack. What happens then differs by language and isn't part of the lesson.
export default defineSpec({
  kind: 'design',
  className: 'MaxMinStack',
  ctor: [],
  methods: [
    // push returns the item pushed, as in the starter
    { name: 'push', params: [{ name: 'item', type: 'int' }], returns: 'int' },
    { name: 'pop', params: [], returns: 'int' },
    { name: 'peek', params: [], returns: 'int' },
    { name: 'getStackMax', params: [], returns: 'int' },
    { name: 'getStackMin', params: [], returns: 'int' },
  ],
  tests: [
    {
      description: 'simple min max',
      ops: [['push', 1], ['push', 42], ['getStackMax'], ['getStackMin']],
      expected: [1, 42, 42, 1],
    },
    {
      description: 'change min/max',
      ops: [
        ['push', 1],
        ['push', 42],
        ['getStackMax'],
        ['getStackMin'],
        ['push', -10],
        ['push', 100],
        ['getStackMax'],
        ['getStackMin'],
      ],
      expected: [1, 42, 42, 1, -10, 100, 100, -10],
    },
    {
      description: 'push and pop',
      ops: [
        ['push', 1],
        ['push', 42],
        ['push', -10],
        ['push', 100],
        ['pop'],
        ['getStackMax'],
        ['getStackMin'],
        ['pop'],
        ['getStackMax'],
        ['getStackMin'],
        ['pop'],
        ['peek'],
        ['getStackMax'],
        ['getStackMin'],
      ],
      expected: [1, 42, -10, 100, 100, 42, -10, -10, 42, 1, 42, 1, 1, 1],
    },
    {
      // The question's example, where the max and min values repeat
      description: 'repeated values',
      ops: [
        ['push', 4],
        ['getStackMax'],
        ['getStackMin'],
        ['push', 17],
        ['push', 4],
        ['push', 42],
        ['push', 0],
        ['push', 1],
        ['getStackMax'],
        ['getStackMin'],
        ['pop'],
        ['pop'],
        ['pop'],
        ['getStackMax'],
        ['getStackMin'],
        ['pop'],
        ['pop'],
        ['getStackMax'],
        ['getStackMin'],
        ['push', -10],
        ['push', -5],
        ['getStackMax'],
        ['getStackMin'],
        ['peek'],
      ],
      expected: [
        4, 4, 4, 17, 4, 42, 0, 1, 42, 0, 1, 0, 42, 17, 4, 4, 17, 4, 4, -10, -5, 4, -10, -5,
      ],
    },
  ],
});
