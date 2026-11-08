import { defineSpec } from 'utils/shared/runner/spec';

export default defineSpec({
  kind: 'function',
  entry: 'groupPermutationsOfPalindromes',
  params: [{ name: 'strings', type: 'string[]' }],
  returns: 'string[][]',
  // The groups in any order, and the strings within a group in any order
  compare: 'unorderedNested',
  tests: [
    { description: 'empty input', args: [[]], expected: [] },
    {
      description: 'input only palindromes',
      args: [['racecar', 'acerrac', 'aaccerr', 'naa', 'aan', 'bob']],
      expected: [['aaccerr', 'acerrac', 'racecar'], ['aan', 'naa'], ['bob']],
    },
    {
      description: 'input single item groups',
      args: [['racecar', 'naa', 'obb']],
      expected: [['racecar'], ['naa'], ['obb']],
    },
    {
      description: 'input palindromes and non-palindromes',
      args: [['racecar', 'acerrac', 'aaccerr', 'naa', 'aan', 'todo', 'doto', 'code', 'bob']],
      expected: [['aaccerr', 'acerrac', 'racecar'], ['aan', 'naa'], ['bob']],
    },
  ],
});
