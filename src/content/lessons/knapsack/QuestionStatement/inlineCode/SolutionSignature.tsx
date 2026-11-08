import { CodingLanguage } from 'utils/constants/lesson';
import generateInlineCode from 'content/blocks/InlineCode/generateInlineCode';

const CAMEL_CASE = 'getMaxValueKnapsack';
const SNAKE_CASE = 'get_max_value_knapsack';

const codeMap = {
  [CodingLanguage.Javascript]: CAMEL_CASE,
  [CodingLanguage.Typescript]: CAMEL_CASE,
  [CodingLanguage.Python]: SNAKE_CASE,
  [CodingLanguage.Java]: 'getMaxValueKnapsack',
  [CodingLanguage.Cpp]: 'getMaxValueKnapsack',
  [CodingLanguage.Csharp]: 'GetMaxValueKnapsack',
  [CodingLanguage.Go]: 'getMaxValueKnapsack',
  [CodingLanguage.Kotlin]: 'getMaxValueKnapsack',
  [CodingLanguage.Swift]: 'getMaxValueKnapsack',
  [CodingLanguage.Rust]: 'get_max_value_knapsack',
};

const Code = generateInlineCode(codeMap);

export default Code;
