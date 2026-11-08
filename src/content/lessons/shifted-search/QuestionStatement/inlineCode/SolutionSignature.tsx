import { CodingLanguage } from 'utils/constants/lesson';
import generateInlineCode from 'content/blocks/InlineCode/generateInlineCode';

const CAMEL_CASE = 'findTargetIndex';
const SNAKE_CASE = 'find_target_index';

const codeMap = {
  [CodingLanguage.Javascript]: CAMEL_CASE,
  [CodingLanguage.Typescript]: CAMEL_CASE,
  [CodingLanguage.Python]: SNAKE_CASE,
  [CodingLanguage.Java]: 'findTargetIndex',
  [CodingLanguage.Cpp]: 'findTargetIndex',
  [CodingLanguage.Csharp]: 'FindTargetIndex',
  [CodingLanguage.Go]: 'findTargetIndex',
  [CodingLanguage.Kotlin]: 'findTargetIndex',
  [CodingLanguage.Swift]: 'findTargetIndex',
  [CodingLanguage.Rust]: 'find_target_index',
};

const Code = generateInlineCode(codeMap);

export default Code;
