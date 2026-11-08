import { CodingLanguage } from 'utils/constants/lesson';
import generateInlineCode from 'content/blocks/InlineCode/generateInlineCode';

const CAMEL_CASE = 'getStackMax';
const SNAKE_CASE = 'get_stack_max';

const codeMap = {
  [CodingLanguage.Javascript]: CAMEL_CASE,
  [CodingLanguage.Typescript]: CAMEL_CASE,
  [CodingLanguage.Python]: SNAKE_CASE,
  [CodingLanguage.Java]: 'getStackMax',
  [CodingLanguage.Cpp]: 'getStackMax',
  [CodingLanguage.Csharp]: 'GetStackMax',
  [CodingLanguage.Go]: 'GetStackMax',
  [CodingLanguage.Kotlin]: 'getStackMax',
  [CodingLanguage.Swift]: 'getStackMax',
  [CodingLanguage.Rust]: 'get_stack_max',
};

const Code = generateInlineCode(codeMap);

export default Code;
