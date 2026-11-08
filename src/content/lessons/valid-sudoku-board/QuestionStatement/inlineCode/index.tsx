import { CodingLanguage } from 'utils/constants/lesson';
import generateInlineCode from 'content/blocks/InlineCode/generateInlineCode';

const CAMEL_CASE = 'isValidSudokuBoard';
const SNAKE_CASE = 'is_valid_sudoku_board';

const codeMap = {
  [CodingLanguage.Javascript]: CAMEL_CASE,
  [CodingLanguage.Typescript]: CAMEL_CASE,
  [CodingLanguage.Python]: SNAKE_CASE,
  [CodingLanguage.Java]: 'isValidSudokuBoard',
  [CodingLanguage.Cpp]: 'isValidSudokuBoard',
  [CodingLanguage.Csharp]: 'IsValidSudokuBoard',
  [CodingLanguage.Go]: 'isValidSudokuBoard',
  [CodingLanguage.Kotlin]: 'isValidSudokuBoard',
  [CodingLanguage.Swift]: 'isValidSudokuBoard',
  [CodingLanguage.Rust]: 'is_valid_sudoku_board',
};

const Code = generateInlineCode(codeMap);

export default Code;
