import { CodingLanguage } from 'utils/constants/lesson';
import generateInlineCode from 'content/blocks/InlineCode/generateInlineCode';

const CAMEL_CASE = 'groupPermutationsOfPalindromes';
const SNAKE_CASE = 'group_permutations_of_palindromes';

const codeMap = {
  [CodingLanguage.Javascript]: CAMEL_CASE,
  [CodingLanguage.Typescript]: CAMEL_CASE,
  [CodingLanguage.Python]: SNAKE_CASE,
  [CodingLanguage.Java]: 'groupPermutationsOfPalindromes',
  [CodingLanguage.Cpp]: 'groupPermutationsOfPalindromes',
  [CodingLanguage.Csharp]: 'GroupPermutationsOfPalindromes',
  [CodingLanguage.Go]: 'groupPermutationsOfPalindromes',
  [CodingLanguage.Kotlin]: 'groupPermutationsOfPalindromes',
  [CodingLanguage.Swift]: 'groupPermutationsOfPalindromes',
  [CodingLanguage.Rust]: 'group_permutations_of_palindromes',
};

const Code = generateInlineCode(codeMap);

export default Code;
