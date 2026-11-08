import { CodingLanguage } from 'utils/constants/lesson';
import generateInlineCode from 'content/blocks/InlineCode/generateInlineCode';

const CAMEL_CASE = 'countIslands';
const SNAKE_CASE = 'count_islands';

const codeMap = {
  [CodingLanguage.Javascript]: CAMEL_CASE,
  [CodingLanguage.Typescript]: CAMEL_CASE,
  [CodingLanguage.Python]: SNAKE_CASE,
  [CodingLanguage.Java]: 'countIslands',
  [CodingLanguage.Cpp]: 'countIslands',
  [CodingLanguage.Csharp]: 'CountIslands',
  [CodingLanguage.Go]: 'countIslands',
  [CodingLanguage.Kotlin]: 'countIslands',
  [CodingLanguage.Swift]: 'countIslands',
  [CodingLanguage.Rust]: 'count_islands',
};

const Code = generateInlineCode(codeMap);

export default Code;
