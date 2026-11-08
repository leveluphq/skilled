import { CodingLanguage } from 'utils/constants/lesson';
import generateInlineCode from 'content/blocks/InlineCode/generateInlineCode';

const JAVASCRIPT = 'minCoinsForAmount[target]';
const PYTHON = 'min_coins_for_amount[target]';

const codeMap = {
  [CodingLanguage.Javascript]: JAVASCRIPT,
  [CodingLanguage.Typescript]: JAVASCRIPT,
  [CodingLanguage.Python]: PYTHON,
  [CodingLanguage.Java]: 'minCoinsForAmount[target]',
  [CodingLanguage.Cpp]: 'minCoinsForAmount[target]',
  [CodingLanguage.Csharp]: 'minCoinsForAmount[target]',
  [CodingLanguage.Go]: 'minCoinsForAmount[target]',
  [CodingLanguage.Kotlin]: 'minCoinsForAmount[target]',
  [CodingLanguage.Swift]: 'minCoinsForAmount[target]',
  [CodingLanguage.Rust]: 'min_coins_for_amount[target]',
};


const Code = generateInlineCode(codeMap);

export default Code;
