import { defineSpec } from 'utils/shared/runner/spec';

// Times are in half-hour blocks (10.5 is 10:30), so every value is a multiple
// of 0.5 and compares exactly as a double
export default defineSpec({
  kind: 'function',
  entry: 'mergeOverlappingIntervals',
  params: [{ name: 'intervals', type: 'Interval[]' }],
  returns: 'Interval[]',
  tests: [
    { description: 'empty', args: [[]], expected: [] },
    { description: 'one item', args: [[{ start: 2, end: 5 }]], expected: [{ start: 2, end: 5 }] },
    {
      description: 'non-overlapping items',
      args: [
        [
          { start: 2, end: 5 },
          { start: 10, end: 11 },
        ],
      ],
      expected: [
        { start: 2, end: 5 },
        { start: 10, end: 11 },
      ],
    },
    {
      description: 'overlapping items',
      args: [
        [
          { start: 9, end: 10.5 },
          { start: 9.5, end: 10 },
          { start: 10, end: 11 },
          { start: 10.5, end: 11.5 },
          { start: 13, end: 14 },
          { start: 13.5, end: 15 },
        ],
      ],
      expected: [
        { start: 9, end: 11.5 },
        { start: 13, end: 15 },
      ],
    },
    {
      description: 'unsorted items',
      args: [
        [
          { start: 0, end: 3 },
          { start: 7, end: 10 },
          { start: 2, end: 5 },
        ],
      ],
      expected: [
        { start: 0, end: 5 },
        { start: 7, end: 10 },
      ],
    },
    {
      description: 'touching items',
      args: [
        [
          { start: 0, end: 5 },
          { start: 5, end: 10 },
        ],
      ],
      expected: [{ start: 0, end: 10 }],
    },
    {
      description: 'meeting inside another meeting',
      args: [
        [
          { start: 0, end: 10 },
          { start: 3, end: 6 },
        ],
      ],
      expected: [{ start: 0, end: 10 }],
    },
  ],
});
