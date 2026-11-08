import { CodingLanguage } from 'utils/constants/lesson';
import generateInlineCode from 'content/blocks/InlineCode/generateInlineCode';

const CAMEL_CASE = 'sumDigits';
const SNAKE_CASE = 'sum_digits';

const codeMap = {
  [CodingLanguage.Javascript]: CAMEL_CASE,
  [CodingLanguage.Typescript]: CAMEL_CASE,
  [CodingLanguage.Python]: SNAKE_CASE,
  [CodingLanguage.Java]: 'sumDigits',
  [CodingLanguage.Cpp]: 'sumDigits',
  [CodingLanguage.Csharp]: 'SumDigits',
  [CodingLanguage.Go]: 'sumDigits',
  [CodingLanguage.Kotlin]: 'sumDigits',
  [CodingLanguage.Swift]: 'sumDigits',
  [CodingLanguage.Rust]: 'sum_digits',
};

const Code = generateInlineCode(codeMap);

export default Code;
