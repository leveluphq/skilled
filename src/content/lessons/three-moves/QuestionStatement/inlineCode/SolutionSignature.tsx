import { CodingLanguage } from 'utils/constants/lesson';
import generateInlineCode from 'content/blocks/InlineCode/generateInlineCode';

const CAMEL_CASE = 'countTotalMoves';
const SNAKE_CASE = 'count_total_moves';

const codeMap = {
  [CodingLanguage.Javascript]: CAMEL_CASE,
  [CodingLanguage.Typescript]: CAMEL_CASE,
  [CodingLanguage.Python]: SNAKE_CASE,
  [CodingLanguage.Java]: 'countTotalMoves',
  [CodingLanguage.Cpp]: 'countTotalMoves',
  [CodingLanguage.Csharp]: 'CountTotalMoves',
  [CodingLanguage.Go]: 'countTotalMoves',
  [CodingLanguage.Kotlin]: 'countTotalMoves',
  [CodingLanguage.Swift]: 'countTotalMoves',
  [CodingLanguage.Rust]: 'count_total_moves',
};

const Code = generateInlineCode(codeMap);

export default Code;
