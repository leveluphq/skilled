import { CodingLanguage } from 'utils/constants/lesson';
import generateInlineCode from 'content/blocks/InlineCode/generateInlineCode';

const codeMap = {
  [CodingLanguage.Javascript]: 'const rowCount = board.length',
  [CodingLanguage.Typescript]: 'const rowCount = board.length',
  [CodingLanguage.Python]: 'row_count = len(board)',
  [CodingLanguage.Java]: 'int rowCount = board.length',
  [CodingLanguage.Cpp]: 'int rowCount = board.size()',
  [CodingLanguage.Csharp]: 'int rowCount = board.Length',
  [CodingLanguage.Go]: 'rowCount := len(board)',
  [CodingLanguage.Kotlin]: 'val rowCount = board.size',
  [CodingLanguage.Swift]: 'let rowCount = board.count',
  [CodingLanguage.Rust]: 'let row_count = board.len()',
};

const Code = generateInlineCode(codeMap);

export default Code;
