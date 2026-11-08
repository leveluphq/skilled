import { CodingLanguage } from 'utils/constants/lesson';
import generateInlineCode from 'content/blocks/InlineCode/generateInlineCode';

const CAMEL_CASE = 'minPrice';
const SNAKE_CASE = 'min_price';

const codeMap = {
  [CodingLanguage.Javascript]: CAMEL_CASE,
  [CodingLanguage.Typescript]: CAMEL_CASE,
  [CodingLanguage.Python]: SNAKE_CASE,
  [CodingLanguage.Java]: 'minPrice',
  [CodingLanguage.Cpp]: 'minPrice',
  [CodingLanguage.Csharp]: 'minPrice',
  [CodingLanguage.Go]: 'minPrice',
  [CodingLanguage.Kotlin]: 'minPrice',
  [CodingLanguage.Swift]: 'minPrice',
  [CodingLanguage.Rust]: 'min_price',
};

const Code = generateInlineCode(codeMap);

export default Code;
