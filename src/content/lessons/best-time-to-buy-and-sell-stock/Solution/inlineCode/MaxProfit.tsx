import { CodingLanguage } from 'utils/constants/lesson';
import generateInlineCode from 'content/blocks/InlineCode/generateInlineCode';

const CAMEL_CASE = 'maxProfit';
const SNAKE_CASE = 'max_profit';

const codeMap = {
  [CodingLanguage.Javascript]: CAMEL_CASE,
  [CodingLanguage.Typescript]: CAMEL_CASE,
  [CodingLanguage.Python]: SNAKE_CASE,
  [CodingLanguage.Java]: 'maxProfit',
  [CodingLanguage.Cpp]: 'maxProfit',
  [CodingLanguage.Csharp]: 'maxProfit',
  [CodingLanguage.Go]: 'maxProfit',
  [CodingLanguage.Kotlin]: 'maxProfit',
  [CodingLanguage.Swift]: 'maxProfit',
  [CodingLanguage.Rust]: 'max_profit',
};

const Code = generateInlineCode(codeMap);

export default Code;
