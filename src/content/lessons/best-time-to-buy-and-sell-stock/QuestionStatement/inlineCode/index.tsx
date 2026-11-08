import { CodingLanguage } from 'utils/constants/lesson';
import generateInlineCode from 'content/blocks/InlineCode/generateInlineCode';

const CAMEL_CASE = 'getMaxProfit';
const SNAKE_CASE = 'get_max_profit';

const codeMap = {
  [CodingLanguage.Javascript]: CAMEL_CASE,
  [CodingLanguage.Typescript]: CAMEL_CASE,
  [CodingLanguage.Python]: SNAKE_CASE,
  [CodingLanguage.Java]: 'getMaxProfit',
  [CodingLanguage.Cpp]: 'getMaxProfit',
  [CodingLanguage.Csharp]: 'GetMaxProfit',
  [CodingLanguage.Go]: 'getMaxProfit',
  [CodingLanguage.Kotlin]: 'getMaxProfit',
  [CodingLanguage.Swift]: 'getMaxProfit',
  [CodingLanguage.Rust]: 'get_max_profit',
};

const Code = generateInlineCode(codeMap);

export default Code;
