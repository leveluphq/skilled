import { CodingLanguage } from 'utils/constants/lesson';
import generateInlineCode from 'content/blocks/InlineCode/generateInlineCode';

const CAMEL_CASE = 'generatePermutations';
const SNAKE_CASE = 'generate_permutations';

const codeMap = {
  [CodingLanguage.Javascript]: CAMEL_CASE,
  [CodingLanguage.Typescript]: CAMEL_CASE,
  [CodingLanguage.Python]: SNAKE_CASE,
  [CodingLanguage.Java]: 'generatePermutations',
  [CodingLanguage.Cpp]: 'generatePermutations',
  [CodingLanguage.Csharp]: 'GeneratePermutations',
  [CodingLanguage.Go]: 'generatePermutations',
  [CodingLanguage.Kotlin]: 'generatePermutations',
  [CodingLanguage.Swift]: 'generatePermutations',
  [CodingLanguage.Rust]: 'generate_permutations',
};

const Code = generateInlineCode(codeMap);

export default Code;
