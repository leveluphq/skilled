import { CodingLanguage } from 'utils/constants/lesson';
import generateInlineCode from 'content/blocks/InlineCode/generateInlineCode';

const CAMEL_CASE = 'searchMatrix';
const SNAKE_CASE = 'search_matrix';

const codeMap = {
  [CodingLanguage.Javascript]: CAMEL_CASE,
  [CodingLanguage.Typescript]: CAMEL_CASE,
  [CodingLanguage.Python]: SNAKE_CASE,
  [CodingLanguage.Java]: 'searchMatrix',
  [CodingLanguage.Cpp]: 'searchMatrix',
  [CodingLanguage.Csharp]: 'SearchMatrix',
  [CodingLanguage.Go]: 'searchMatrix',
  [CodingLanguage.Kotlin]: 'searchMatrix',
  [CodingLanguage.Swift]: 'searchMatrix',
  [CodingLanguage.Rust]: 'search_matrix',
};

const Code = generateInlineCode(codeMap);

export default Code;
