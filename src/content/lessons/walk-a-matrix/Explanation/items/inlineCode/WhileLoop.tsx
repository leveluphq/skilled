import { CodingLanguage } from 'utils/constants/lesson';
import generateInlineCode from 'content/blocks/InlineCode/generateInlineCode';

const CAMEL_CASE = 'while (endRow >= startRow && endColumn >=  startColumn)';
const PYTHON = 'while(end_row >= start_row and end_column >= start_column):';

const codeMap = {
  [CodingLanguage.Javascript]: CAMEL_CASE,
  [CodingLanguage.Typescript]: CAMEL_CASE,
  [CodingLanguage.Python]: PYTHON,
  [CodingLanguage.Java]: 'while (endRow >= startRow && endColumn >= startColumn)',
  [CodingLanguage.Cpp]: 'while (endRow >= startRow && endColumn >= startColumn)',
  [CodingLanguage.Csharp]: 'while (endRow >= startRow && endColumn >= startColumn)',
  [CodingLanguage.Go]: 'for endRow >= startRow && endColumn >= startColumn',
  [CodingLanguage.Kotlin]: 'while (endRow >= startRow && endColumn >= startColumn)',
  [CodingLanguage.Swift]: 'while endRow >= startRow && endColumn >= startColumn',
  [CodingLanguage.Rust]: 'while end_row >= start_row && end_column >= start_column',
};

const Code = generateInlineCode(codeMap);

export default Code;
