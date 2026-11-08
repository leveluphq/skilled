import { CodingLanguage } from 'utils/constants/lesson';
import generateInlineCode from 'content/blocks/InlineCode/generateInlineCode';

const JAVASCRIPT = '-Infinity';
const PYTHON = "float('-inf')";

const codeMap = {
  [CodingLanguage.Javascript]: JAVASCRIPT,
  [CodingLanguage.Typescript]: JAVASCRIPT,
  [CodingLanguage.Python]: PYTHON,
  [CodingLanguage.Java]: 'Integer.MIN_VALUE',
  [CodingLanguage.Cpp]: 'INT_MIN',
  [CodingLanguage.Csharp]: 'int.MinValue',
  [CodingLanguage.Go]: 'math.MinInt',
  [CodingLanguage.Kotlin]: 'Int.MIN_VALUE',
  [CodingLanguage.Swift]: 'Int.min',
  [CodingLanguage.Rust]: 'i32::MIN',
};

const Code = generateInlineCode(codeMap);

export default Code;
