import { CodingLanguage } from 'utils/constants/lesson';
import generateInlineCode from 'content/blocks/InlineCode/generateInlineCode';

const codeMap = {
  [CodingLanguage.Javascript]: 'maxProfit[i - 1]',
  [CodingLanguage.Typescript]: 'maxProfit[i - 1]',
  [CodingLanguage.Python]: 'max_profit[i - 1]',
  [CodingLanguage.Java]: 'maxProfit[i - 1]',
  [CodingLanguage.Cpp]: 'maxProfit[i - 1]',
  [CodingLanguage.Csharp]: 'maxProfit[i - 1]',
  [CodingLanguage.Go]: 'maxProfit[i-1]',
  [CodingLanguage.Kotlin]: 'maxProfit[i - 1]',
  [CodingLanguage.Swift]: 'maxProfit[i - 1]',
  [CodingLanguage.Rust]: 'max_profit[i - 1]',
};

const Code = generateInlineCode(codeMap);

export default Code;
