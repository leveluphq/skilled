import { CodingLanguage } from 'utils/constants/lesson';
import generateInlineCode from 'content/blocks/InlineCode/generateInlineCode';

const codeMap = {
  [CodingLanguage.Javascript]: 'const firstRow = board[0]',
  [CodingLanguage.Typescript]: 'const firstRow = board[0]',
  [CodingLanguage.Python]: 'first_row = board[0]',
  [CodingLanguage.Java]: 'int[] firstRow = board[0]',
  [CodingLanguage.Cpp]: 'vector<int>& firstRow = board[0]',
  [CodingLanguage.Csharp]: 'int[] firstRow = board[0]',
  [CodingLanguage.Go]: 'firstRow := board[0]',
  [CodingLanguage.Kotlin]: 'val firstRow = board[0]',
  [CodingLanguage.Swift]: 'let firstRow = board[0]',
  [CodingLanguage.Rust]: 'let first_row = &board[0]',
};

const Code = generateInlineCode(codeMap);

export default Code;
