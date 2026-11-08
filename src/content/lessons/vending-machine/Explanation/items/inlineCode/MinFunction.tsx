import { CodingLanguage } from 'utils/constants/lesson';
import generateInlineCode from 'content/blocks/InlineCode/generateInlineCode';

const JAVASCRIPT = 'Math.min';
const PYTHON = 'min';

const codeMap = {
  [CodingLanguage.Javascript]: JAVASCRIPT,
  [CodingLanguage.Typescript]: JAVASCRIPT,
  [CodingLanguage.Python]: PYTHON,
  [CodingLanguage.Java]: 'Math.min',
  [CodingLanguage.Cpp]: 'min',
  [CodingLanguage.Csharp]: 'Math.Min',
  [CodingLanguage.Go]: 'min',
  [CodingLanguage.Kotlin]: 'minOf',
  [CodingLanguage.Swift]: 'min',
  [CodingLanguage.Rust]: '.min()',
};

const Code = generateInlineCode(codeMap);

export default Code;
