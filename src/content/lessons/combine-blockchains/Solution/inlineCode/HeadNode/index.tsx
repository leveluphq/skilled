import { CodingLanguage } from 'utils/constants/lesson';
import generateInlineCode from 'content/blocks/InlineCode/generateInlineCode';

const CAMEL_CASE = 'resultHead';
const SNAKE_CASE = 'result_head';

const codeMap = {
  [CodingLanguage.Javascript]: CAMEL_CASE,
  [CodingLanguage.Typescript]: CAMEL_CASE,
  [CodingLanguage.Python]: SNAKE_CASE,
  [CodingLanguage.Java]: 'resultHead',
  [CodingLanguage.Cpp]: 'resultHead',
  [CodingLanguage.Csharp]: 'resultHead',
  [CodingLanguage.Go]: 'resultHead',
  [CodingLanguage.Kotlin]: 'resultHead',
  [CodingLanguage.Swift]: 'resultHead',
  [CodingLanguage.Rust]: 'result_head',
};

const Code = generateInlineCode(codeMap);

export default Code;
