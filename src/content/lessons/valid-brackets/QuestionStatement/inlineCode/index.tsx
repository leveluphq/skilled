import { CodingLanguage } from 'utils/constants/lesson';
import generateInlineCode from 'content/blocks/InlineCode/generateInlineCode';

const CAMEL_CASE = 'hasValidBrackets';
const SNAKE_CASE = 'has_valid_brackets';

const codeMap = {
  [CodingLanguage.Javascript]: CAMEL_CASE,
  [CodingLanguage.Typescript]: CAMEL_CASE,
  [CodingLanguage.Python]: SNAKE_CASE,
  [CodingLanguage.Java]: 'hasValidBrackets',
  [CodingLanguage.Cpp]: 'hasValidBrackets',
  [CodingLanguage.Csharp]: 'HasValidBrackets',
  [CodingLanguage.Go]: 'hasValidBrackets',
  [CodingLanguage.Kotlin]: 'hasValidBrackets',
  [CodingLanguage.Swift]: 'hasValidBrackets',
  [CodingLanguage.Rust]: 'has_valid_brackets',
};

const Code = generateInlineCode(codeMap);

export default Code;
