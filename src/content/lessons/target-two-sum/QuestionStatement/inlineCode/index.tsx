import { CodingLanguage } from 'utils/constants/lesson';
import generateInlineCode from 'content/blocks/InlineCode/generateInlineCode';

const CAMEL_CASE = 'getTargetIndexes';

const SNAKE_CASE = 'get_target_indexes';

const codeMap = {
  [CodingLanguage.Javascript]: CAMEL_CASE,
  [CodingLanguage.Typescript]: CAMEL_CASE,
  [CodingLanguage.Python]: SNAKE_CASE,
  [CodingLanguage.Java]: 'getTargetIndexes',
  [CodingLanguage.Cpp]: 'getTargetIndexes',
  [CodingLanguage.Csharp]: 'GetTargetIndexes',
  [CodingLanguage.Go]: 'getTargetIndexes',
  [CodingLanguage.Kotlin]: 'getTargetIndexes',
  [CodingLanguage.Swift]: 'getTargetIndexes',
  [CodingLanguage.Rust]: 'get_target_indexes',
};

const Code = generateInlineCode(codeMap);

export default Code;
