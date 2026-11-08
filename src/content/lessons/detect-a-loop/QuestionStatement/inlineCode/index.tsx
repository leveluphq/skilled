import { CodingLanguage } from 'utils/constants/lesson';
import generateInlineCode from 'content/blocks/InlineCode/generateInlineCode';

const CAMEL_CASE = 'hasLoop';
const SNAKE_CASE = 'has_loop';

const codeMap = {
  [CodingLanguage.Javascript]: CAMEL_CASE,
  [CodingLanguage.Typescript]: CAMEL_CASE,
  [CodingLanguage.Python]: SNAKE_CASE,
  [CodingLanguage.Java]: 'hasLoop',
  [CodingLanguage.Cpp]: 'hasLoop',
  [CodingLanguage.Csharp]: 'HasLoop',
  [CodingLanguage.Go]: 'hasLoop',
  [CodingLanguage.Kotlin]: 'hasLoop',
  [CodingLanguage.Swift]: 'hasLoop',
  [CodingLanguage.Rust]: 'has_loop',
};

const Code = generateInlineCode(codeMap);

export default Code;
