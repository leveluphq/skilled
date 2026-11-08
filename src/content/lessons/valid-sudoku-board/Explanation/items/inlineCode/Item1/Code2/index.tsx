import { CodingLanguage } from 'utils/constants/lesson';
import generateInlineCode from 'content/blocks/InlineCode/generateInlineCode';

const codeMap = {
  [CodingLanguage.Javascript]: 'const columnCount = board[0].length',
  [CodingLanguage.Typescript]: 'const columnCount = board[0].length',
  [CodingLanguage.Python]: 'column_count = len(board[0])',
  [CodingLanguage.Java]: 'int columnCount = board[0].length',
  [CodingLanguage.Cpp]: 'int columnCount = board[0].size()',
  [CodingLanguage.Csharp]: 'int columnCount = board[0].Length',
  [CodingLanguage.Go]: 'columnCount := len(board[0])',
  [CodingLanguage.Kotlin]: 'val columnCount = board[0].size',
  [CodingLanguage.Swift]: 'let columnCount = board[0].count',
  [CodingLanguage.Rust]: 'let column_count = board[0].len()',
};

const Code = generateInlineCode(codeMap);

export default Code;
