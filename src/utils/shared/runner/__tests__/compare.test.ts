import { compareOutput, canonical } from 'utils/shared/runner/compare';

describe('canonical', () => {
  it('ignores object key order and treats -0 as 0', () => {
    expect(canonical({ b: 1, a: -0 })).toBe(canonical({ a: 0, b: 1 }));
  });

  it('compares big integers by their digits', () => {
    expect(canonical({ $int: '9223372036854775807' })).toBe('9223372036854775807');
    expect(canonical({ $int: '9007199254740993' })).not.toBe(canonical(9007199254740992));
  });
});

describe('compareOutput', () => {
  it('exact: deep equality, with order mattering in lists', () => {
    expect(compareOutput('exact', [1, [2, 3]], [1, [2, 3]], [])).toBe(true);
    expect(compareOutput('exact', [1, 2], [2, 1], [])).toBe(false);
    expect(compareOutput(undefined, null, [], [])).toBe(false);
    expect(compareOutput('exact', '1', 1, [])).toBe(false);
  });

  it('float: numbers within the tolerance, anywhere in the value', () => {
    expect(compareOutput({ float: 1e-9 }, [0.1 + 0.2, { x: 1 }], [0.3, { x: 1 }], [])).toBe(true);
    expect(compareOutput({ float: 1e-9 }, [0.31], [0.3], [])).toBe(false);
  });

  it('unorderedList: the same elements, any order, duplicates counted', () => {
    expect(compareOutput('unorderedList', ['ab', 'ba'], ['ba', 'ab'], [])).toBe(true);
    expect(compareOutput('unorderedList', ['ab', 'ab'], ['ab', 'ba'], [])).toBe(false);
    expect(compareOutput('unorderedList', 'ab', ['ab'], [])).toBe(false);
  });

  it('unorderedNested: neither the groups nor their members are ordered', () => {
    expect(compareOutput('unorderedNested', [['b', 'a'], ['c']], [['c'], ['a', 'b']], [])).toBe(
      true,
    );
    // A group missing a member
    expect(compareOutput('unorderedNested', [['a'], ['c']], [['c'], ['a', 'b']], [])).toBe(false);
    expect(compareOutput('unorderedNested', ['a'], [['a']], [])).toBe(false);
  });

  it('unorderedPairs: neither the pairs nor their two elements are ordered', () => {
    expect(
      compareOutput(
        'unorderedPairs',
        [
          [3, 1],
          [2, 0],
        ],
        [
          [0, 2],
          [1, 3],
        ],
        [],
      ),
    ).toBe(true);
    expect(
      compareOutput(
        'unorderedPairs',
        [[3, 1]],
        [
          [0, 2],
          [1, 3],
        ],
        [],
      ),
    ).toBe(false);
    expect(compareOutput('unorderedPairs', [[1, 2, 3]], [[1, 2]], [])).toBe(false);
  });

  it('a function decides validity itself, and an exception fails the test', () => {
    const anyEven = (actual: unknown) => typeof actual === 'number' && actual % 2 === 0;

    expect(compareOutput(anyEven, 4, 0, [])).toBe(true);
    expect(compareOutput(anyEven, 3, 0, [])).toBe(false);
    expect(
      compareOutput(
        () => {
          throw new Error('bad');
        },
        1,
        1,
        [],
      ),
    ).toBe(false);
  });
});
