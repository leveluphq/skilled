import { parseType, validateSpec, defineSpec, checkValue } from 'utils/shared/runner/spec';

describe('parseType', () => {
  it('parses scalars, lists, maps and nullables', () => {
    expect(parseType('map<string, string[]>?')).toEqual({
      kind: 'nullable',
      of: { kind: 'map', of: { kind: 'array', of: { kind: 'scalar', name: 'string' } } },
    });
    expect(parseType('char[][]')).toEqual({
      kind: 'array',
      of: { kind: 'array', of: { kind: 'scalar', name: 'char' } },
    });
  });

  it('rejects unknown types', () => {
    expect(() => parseType('integer')).toThrow('Unknown type "integer"');
  });
});

describe('checkValue', () => {
  it.each([
    ['int', 2 ** 31 - 1, null],
    ['int', 2 ** 31, 'expected a 32-bit integer'],
    ['int', 1.5, 'expected a 32-bit integer'],
    ['long', 2 ** 53, 'expected a 64-bit integer (write integers beyond 2^53 as { $int: "..." })'],
    ['long', { $int: '9223372036854775807' }, null],
    ['long', { $int: '9223372036854775808' }, 'expected a 64-bit integer'],
    ['char', 'ab', 'expected a one-character string'],
    ['int[]', [1, 'a'], '[1]: expected a 32-bit integer'],
    ['map<string,int>', { a: 1 }, null],
    ['int?', null, null],
    ['Interval', { start: 1, end: 2.5 }, null],
    ['Interval', { start: 1 }, 'expected { start, end } with numbers'],
    ['Item', { weight: 2, value: 3 }, null],
    ['Item', { weight: 2.5, value: 3 }, 'expected { weight, value } with 32-bit integers'],
    ['Item', { weight: 2, value: 3, name: 'x' }, 'expected { weight, value } with 32-bit integers'],
  ])('%s %p -> %p', (type, value, problem) => {
    expect(checkValue(value, parseType(type), false)).toBe(problem);
  });

  it('accepts a list with a cycle only as an input', () => {
    const cyclic = { values: [1, 2, 3], cycleIndex: 1 };

    expect(checkValue(cyclic, parseType('ListNode'), true)).toBeNull();
    expect(checkValue(cyclic, parseType('ListNode'), false)).toBe('expected a list');
    expect(checkValue({ values: [1], cycleIndex: 1 }, parseType('ListNode'), true)).toBe(
      'cycleIndex must be null or the index of a node',
    );
  });

  it('checks trees are in level order with no trailing nulls in expected values', () => {
    expect(checkValue([1, null, 2], parseType('BinaryNode'), false)).toBeNull();
    expect(checkValue([null, 1], parseType('BinaryNode'), true)).toBe(
      'a tree in level order starts with its root, not null',
    );
    expect(checkValue([1, 2, null], parseType('BinaryNode'), false)).toBe(
      'trim trailing nulls from an expected tree',
    );
  });
});

describe('validateSpec', () => {
  const countIslands = defineSpec({
    kind: 'function',
    entry: 'countIslands',
    params: [{ name: 'grid', type: 'char[][]' }],
    returns: 'int',
    tests: [{ description: 'one island', args: [[['#']]], expected: 1 }],
  });

  it('accepts a valid function spec', () => {
    expect(validateSpec(countIslands)).toEqual([]);
  });

  it('reports wrong argument counts, bad arguments and bad expected values', () => {
    expect(
      validateSpec({
        ...countIslands,
        tests: [
          { description: 'too many', args: [[], []], expected: 1 },
          { description: 'bad grid', args: [[['##']]], expected: 1 },
          { description: 'bad expected', args: [[]], expected: 'one' },
        ],
      }),
    ).toEqual([
      'tests[0] "too many": has 2 args, but countIslands takes 1',
      'tests[1] "bad grid": argument grid: [0]: [0]: expected a one-character string',
      'tests[2] "bad expected": expected: expected a 32-bit integer',
    ]);
  });

  it('lets a custom comparator decide what an expected value looks like', () => {
    expect(
      validateSpec({
        ...countIslands,
        compare: () => true,
        tests: [{ description: 'any', args: [[]], expected: 'whatever' }],
      }),
    ).toEqual([]);
  });

  it('requires hidden values to come with an injected function', () => {
    expect(
      validateSpec({
        ...countIslands,
        hidden: [{ name: 'badVersion', type: 'int' }],
        tests: [{ description: 'x', args: [[]], hidden: [1], expected: 0 }],
      }),
    ).toEqual(['hidden values need an injected function to use them']);
  });

  it('checks a design spec calls only its methods, with the right arguments', () => {
    const stack = defineSpec({
      kind: 'design',
      className: 'MaxMinStack',
      ctor: [],
      methods: [
        { name: 'push', params: [{ name: 'item', type: 'int' }], returns: 'int' },
        { name: 'getStackMax', params: [], returns: 'int' },
      ],
      tests: [
        { description: 'ok', ops: [['push', 1], ['getStackMax']], expected: [1, 1] },
        { description: 'bad', ops: [['pop'], ['push'], ['push', 'x']], expected: [1, 1] },
      ],
    });

    expect(validateSpec(stack)).toEqual([
      'tests[1] "bad": 3 operations but 2 expected values',
      'tests[1] "bad": operation 0 calls unknown method pop',
      'tests[1] "bad": operation 1 passes 0 args to push, which takes 1',
      'tests[1] "bad": operation 2 push argument 0: expected a 32-bit integer',
    ]);
  });

  it('turns an unknown type into a message rather than throwing', () => {
    expect(validateSpec({ ...countIslands, returns: 'number' })).toEqual(['Unknown type "number"']);
  });
});
