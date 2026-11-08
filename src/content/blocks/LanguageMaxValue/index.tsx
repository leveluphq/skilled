import { CodingLanguage } from 'utils/constants/lesson';
import generateInlineCode from 'content/blocks/InlineCode/generateInlineCode';

const JAVASCRIPT = 'Infinity';
const PYTHON = "float('inf')";

const codeMap = {
  [CodingLanguage.Javascript]: JAVASCRIPT,
  [CodingLanguage.Typescript]: JAVASCRIPT,
  [CodingLanguage.Python]: PYTHON,
  [CodingLanguage.Java]: 'Integer.MAX_VALUE',
  [CodingLanguage.Cpp]: 'INT_MAX',
  [CodingLanguage.Csharp]: 'int.MaxValue',
  [CodingLanguage.Go]: 'infinity',
  [CodingLanguage.Kotlin]: 'Int.MAX_VALUE',
  [CodingLanguage.Swift]: 'Int.max',
  [CodingLanguage.Rust]: 'i32::MAX',
};

const Code = generateInlineCode(codeMap);

export default Code;
