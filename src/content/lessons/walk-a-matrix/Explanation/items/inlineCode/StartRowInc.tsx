import { CodingLanguage } from 'utils/constants/lesson';
import generateInlineCode from 'content/blocks/InlineCode/generateInlineCode';

const CAMEL_CASE = 'startRow++';
const SNAKE_CASE = 'start_row++';

const codeMap = {
  [CodingLanguage.Javascript]: CAMEL_CASE,
  [CodingLanguage.Typescript]: CAMEL_CASE,
  [CodingLanguage.Python]: SNAKE_CASE,
  [CodingLanguage.Java]: 'startRow++',
  [CodingLanguage.Cpp]: 'startRow++',
  [CodingLanguage.Csharp]: 'startRow++',
  [CodingLanguage.Go]: 'startRow++',
  [CodingLanguage.Kotlin]: 'startRow++',
  [CodingLanguage.Swift]: 'startRow += 1',
  [CodingLanguage.Rust]: 'start_row += 1',
};

const Code = generateInlineCode(codeMap);

export default Code;
