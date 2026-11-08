import { CodingLanguage } from 'utils/constants/lesson';
import generateInlineCode from 'content/blocks/InlineCode/generateInlineCode';

const CAMEL_CASE = 'sortByAge';
const SNAKE_CASE = 'sort_by_age';

const codeMap = {
  [CodingLanguage.Javascript]: CAMEL_CASE,
  [CodingLanguage.Typescript]: CAMEL_CASE,
  [CodingLanguage.Python]: SNAKE_CASE,
  [CodingLanguage.Java]: 'sortByAge',
  [CodingLanguage.Cpp]: 'sortByAge',
  [CodingLanguage.Csharp]: 'SortByAge',
  [CodingLanguage.Go]: 'sortByAge',
  [CodingLanguage.Kotlin]: 'sortByAge',
  [CodingLanguage.Swift]: 'sortByAge',
  [CodingLanguage.Rust]: 'sort_by_age',
};

const Code = generateInlineCode(codeMap);

export default Code;
