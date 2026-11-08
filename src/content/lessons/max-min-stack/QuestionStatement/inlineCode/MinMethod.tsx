import { CodingLanguage } from 'utils/constants/lesson';
import generateInlineCode from 'content/blocks/InlineCode/generateInlineCode';

const CAMEL_CASE = 'getStackMin';
const SNAKE_CASE = 'get_stack_min';

const codeMap = {
  [CodingLanguage.Javascript]: CAMEL_CASE,
  [CodingLanguage.Typescript]: CAMEL_CASE,
  [CodingLanguage.Python]: SNAKE_CASE,
  [CodingLanguage.Java]: 'getStackMin',
  [CodingLanguage.Cpp]: 'getStackMin',
  [CodingLanguage.Csharp]: 'GetStackMin',
  [CodingLanguage.Go]: 'GetStackMin',
  [CodingLanguage.Kotlin]: 'getStackMin',
  [CodingLanguage.Swift]: 'getStackMin',
  [CodingLanguage.Rust]: 'get_stack_min',
};

const Code = generateInlineCode(codeMap);

export default Code;
