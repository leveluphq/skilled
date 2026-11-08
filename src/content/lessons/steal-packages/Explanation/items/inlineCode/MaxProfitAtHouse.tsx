import { CodingLanguage } from 'utils/constants/lesson';
import generateInlineCode from 'content/blocks/InlineCode/generateInlineCode';

const codeMap = {
  [CodingLanguage.Javascript]: 'maxProfit[i]',
  [CodingLanguage.Typescript]: 'maxProfit[i]',
  [CodingLanguage.Python]: 'max_profit[i]',
  [CodingLanguage.Java]: 'maxProfit[i]',
  [CodingLanguage.Cpp]: 'maxProfit[i]',
  [CodingLanguage.Csharp]: 'maxProfit[i]',
  [CodingLanguage.Go]: 'maxProfit[i]',
  [CodingLanguage.Kotlin]: 'maxProfit[i]',
  [CodingLanguage.Swift]: 'maxProfit[i]',
  [CodingLanguage.Rust]: 'max_profit[i]',
};

const Code = generateInlineCode(codeMap);

export default Code;
