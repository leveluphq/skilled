import { CodingLanguage } from 'utils/constants/lesson';
import generateInlineCode from 'content/blocks/InlineCode/generateInlineCode';

const codeMap = {
  [CodingLanguage.Javascript]: 'maxProfit[i - 2]',
  [CodingLanguage.Typescript]: 'maxProfit[i - 2]',
  [CodingLanguage.Python]: 'max_profit[i - 2]',
  [CodingLanguage.Java]: 'maxProfit[i - 2]',
  [CodingLanguage.Cpp]: 'maxProfit[i - 2]',
  [CodingLanguage.Csharp]: 'maxProfit[i - 2]',
  [CodingLanguage.Go]: 'maxProfit[i-2]',
  [CodingLanguage.Kotlin]: 'maxProfit[i - 2]',
  [CodingLanguage.Swift]: 'maxProfit[i - 2]',
  [CodingLanguage.Rust]: 'max_profit[i - 2]',
};

const Code = generateInlineCode(codeMap);

export default Code;
