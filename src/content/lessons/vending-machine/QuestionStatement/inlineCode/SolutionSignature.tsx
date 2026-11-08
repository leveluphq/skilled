import { CodingLanguage } from 'utils/constants/lesson';
import generateInlineCode from 'content/blocks/InlineCode/generateInlineCode';

const CAMEL_CASE = 'minCoinsForChange';
const SNAKE_CASE = 'min_coins_for_change';

const codeMap = {
  [CodingLanguage.Javascript]: CAMEL_CASE,
  [CodingLanguage.Typescript]: CAMEL_CASE,
  [CodingLanguage.Python]: SNAKE_CASE,
  [CodingLanguage.Java]: 'minCoinsForChange',
  [CodingLanguage.Cpp]: 'minCoinsForChange',
  [CodingLanguage.Csharp]: 'MinCoinsForChange',
  [CodingLanguage.Go]: 'minCoinsForChange',
  [CodingLanguage.Kotlin]: 'minCoinsForChange',
  [CodingLanguage.Swift]: 'minCoinsForChange',
  [CodingLanguage.Rust]: 'min_coins_for_change',
};

const Code = generateInlineCode(codeMap);

export default Code;
