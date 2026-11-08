import { CodingLanguage } from 'utils/constants/lesson';
import generateInlineCode from 'content/blocks/InlineCode/generateInlineCode';

const CAMEL_CASE = 'isBST';
const SNAKE_CASE = 'is_bst';

const codeMap = {
  [CodingLanguage.Javascript]: CAMEL_CASE,
  [CodingLanguage.Typescript]: CAMEL_CASE,
  [CodingLanguage.Python]: SNAKE_CASE,
  [CodingLanguage.Java]: 'isBST',
  [CodingLanguage.Cpp]: 'isBST',
  [CodingLanguage.Csharp]: 'IsBST',
  [CodingLanguage.Go]: 'isBST',
  [CodingLanguage.Kotlin]: 'isBST',
  [CodingLanguage.Swift]: 'isBST',
  [CodingLanguage.Rust]: 'is_bst',
};

const Code = generateInlineCode(codeMap);

export default Code;
