import { defineSpec } from 'utils/shared/runner/spec';

// Each item is an Item: { weight, value }, an object in JavaScript (item.weight),
// a dict in Python (item["weight"]) and a class elsewhere.
const item = (weight: number, value: number) => ({ weight, value });

const PROMPT_ITEMS = [item(1, 3), item(2, 4), item(3, 7), item(4, 10), item(5, 5), item(6, 20)];

export default defineSpec({
  kind: 'function',
  entry: 'getMaxValueKnapsack',
  params: [
    { name: 'items', type: 'Item[]' },
    { name: 'capacity', type: 'int' },
  ],
  returns: 'int',
  tests: [
    { description: 'example from the prompt', args: [PROMPT_ITEMS, 5], expected: 13 },
    { description: 'capacity is 0', args: [PROMPT_ITEMS, 0], expected: 0 },
    { description: 'no items', args: [[], 10], expected: 0 },
    {
      description: 'every item is too heavy',
      args: [[item(6, 10), item(8, 20), item(7, 15)], 5],
      expected: 0,
    },
    { description: 'each item can only be used once', args: [[item(2, 5)], 10], expected: 5 },
    {
      description: 'exact fit',
      args: [[item(2, 3), item(3, 4), item(4, 5), item(5, 6)], 5],
      expected: 7,
    },
    {
      description: 'capacity larger than all items combined',
      args: [[item(1, 4), item(2, 5), item(3, 6)], 100],
      expected: 15,
    },
    {
      description: 'greedy by value fails',
      args: [[item(5, 10), item(3, 7), item(2, 6)], 5],
      expected: 13,
    },
    {
      description: 'greedy by value-to-weight ratio fails',
      args: [[item(10, 60), item(20, 100), item(30, 120)], 50],
      expected: 220,
    },
    {
      description: 'example from the dynamic programming lesson',
      args: [[item(5, 60), item(3, 50), item(4, 70), item(2, 30)], 5],
      expected: 80,
    },
    {
      description: 'larger case',
      args: [
        [
          item(4, 38),
          item(9, 9),
          item(6, 39),
          item(8, 38),
          item(2, 39),
          item(1, 31),
          item(5, 36),
          item(4, 13),
          item(12, 31),
          item(9, 36),
          item(8, 26),
          item(11, 10),
          item(4, 10),
          item(14, 34),
          item(7, 1),
          item(11, 5),
          item(3, 38),
          item(1, 20),
        ],
        50,
      ],
      expected: 341,
    },
  ],
});
