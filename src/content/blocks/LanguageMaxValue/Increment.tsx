import { CodingLanguage } from 'utils/constants/lesson';
import generateInlineCode from 'content/blocks/InlineCode/generateInlineCode';

const JAVASCRIPT = 'Infinity + 1';
const PYTHON = "float('inf') + 1";

const codeMap = {
  [CodingLanguage.Javascript]: JAVASCRIPT,
  [CodingLanguage.Typescript]: JAVASCRIPT,
  [CodingLanguage.Python]: PYTHON,
  [CodingLanguage.Java]: 'Integer.MAX_VALUE + 1',
  [CodingLanguage.Cpp]: 'INT_MAX + 1',
  [CodingLanguage.Csharp]: 'int.MaxValue + 1',
  [CodingLanguage.Go]: 'infinity + 1',
  [CodingLanguage.Kotlin]: 'Int.MAX_VALUE + 1',
  [CodingLanguage.Swift]: 'Int.max + 1',
  [CodingLanguage.Rust]: 'i32::MAX.saturating_add(1)',
};

const Code = generateInlineCode(codeMap);

export default Code;
