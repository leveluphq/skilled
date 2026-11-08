import { CodingLanguage } from 'utils/constants/lesson';
import generateInlineCode from 'content/blocks/InlineCode/generateInlineCode';

const CAMEL_CASE = 'findMaxDepth';
const SNAKE_CASE = 'find_max_depth';

const codeMap = {
  [CodingLanguage.Javascript]: CAMEL_CASE,
  [CodingLanguage.Typescript]: CAMEL_CASE,
  [CodingLanguage.Python]: SNAKE_CASE,
  [CodingLanguage.Java]: 'findMaxDepth',
  [CodingLanguage.Cpp]: 'findMaxDepth',
  [CodingLanguage.Csharp]: 'FindMaxDepth',
  [CodingLanguage.Go]: 'findMaxDepth',
  [CodingLanguage.Kotlin]: 'findMaxDepth',
  [CodingLanguage.Swift]: 'findMaxDepth',
  [CodingLanguage.Rust]: 'find_max_depth',
};

const Code = generateInlineCode(codeMap);

export default Code;
