import { CodingLanguage } from 'utils/constants/lesson';
import generateInlineCode from 'content/blocks/InlineCode/generateInlineCode';

const CAMEL_CASE = 'combineBlockchains';
const SNAKE_CASE = 'combine_blockchains';

const codeMap = {
  [CodingLanguage.Javascript]: CAMEL_CASE,
  [CodingLanguage.Typescript]: CAMEL_CASE,
  [CodingLanguage.Python]: SNAKE_CASE,
  [CodingLanguage.Java]: 'combineBlockchains',
  [CodingLanguage.Cpp]: 'combineBlockchains',
  [CodingLanguage.Csharp]: 'CombineBlockchains',
  [CodingLanguage.Go]: 'combineBlockchains',
  [CodingLanguage.Kotlin]: 'combineBlockchains',
  [CodingLanguage.Swift]: 'combineBlockchains',
  [CodingLanguage.Rust]: 'combine_blockchains',
};

const Code = generateInlineCode(codeMap);

export default Code;
