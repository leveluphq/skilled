import { CodingLanguage } from 'utils/constants/lesson';
import generateInlineCode from 'content/blocks/InlineCode/generateInlineCode';

const codeMap = {
  [CodingLanguage.Javascript]: 'board.length === 0',
  [CodingLanguage.Typescript]: 'board.length === 0',
  [CodingLanguage.Python]: 'len(board) == 0',
  [CodingLanguage.Java]: 'board.length == 0',
  [CodingLanguage.Cpp]: 'board.empty()',
  [CodingLanguage.Csharp]: 'board.Length == 0',
  [CodingLanguage.Go]: 'len(board) == 0',
  [CodingLanguage.Kotlin]: 'board.isEmpty()',
  [CodingLanguage.Swift]: 'board.isEmpty',
  [CodingLanguage.Rust]: 'board.is_empty()',
};

const Code = generateInlineCode(codeMap);

export default Code;
