import { CodingLanguage } from 'utils/constants/lesson';
import generateInlineCode from 'content/blocks/InlineCode/generateInlineCode';

const CAMEL_CASE = 'buildProductArray';
const SNAKE_CASE = 'build_product_array';

const codeMap = {
  [CodingLanguage.Javascript]: CAMEL_CASE,
  [CodingLanguage.Typescript]: CAMEL_CASE,
  [CodingLanguage.Python]: SNAKE_CASE,
  [CodingLanguage.Java]: 'buildProductArray',
  [CodingLanguage.Cpp]: 'buildProductArray',
  [CodingLanguage.Csharp]: 'BuildProductArray',
  [CodingLanguage.Go]: 'buildProductArray',
  [CodingLanguage.Kotlin]: 'buildProductArray',
  [CodingLanguage.Swift]: 'buildProductArray',
  [CodingLanguage.Rust]: 'build_product_array',
};

const Code = generateInlineCode(codeMap);

export default Code;
