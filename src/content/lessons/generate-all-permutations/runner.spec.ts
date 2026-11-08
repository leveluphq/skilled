import { defineSpec } from 'utils/shared/runner/spec';

export default defineSpec({
  kind: 'function',
  entry: 'generatePermutations',
  // `s` rather than `string`, which is a type name in most languages
  params: [{ name: 's', type: 'string' }],
  returns: 'string[]',
  // Permutations in any order; a repeated letter gives repeated permutations,
  // and each must appear as many times as expected
  compare: 'unorderedList',
  tests: [
    // The empty string has one permutation, itself
    { description: '0 characters', args: [''], expected: [''] },
    { description: '1 character', args: ['a'], expected: ['a'] },
    { description: '2 characters', args: ['ab'], expected: ['ab', 'ba'] },
    {
      description: '3 characters',
      args: ['dev'],
      expected: ['dev', 'dve', 'edv', 'evd', 'vde', 'ved'],
    },
    {
      description: 'repeated letters',
      args: ['bob'],
      expected: ['bob', 'bbo', 'bob', 'bbo', 'obb', 'obb'],
    },
  ],
});
