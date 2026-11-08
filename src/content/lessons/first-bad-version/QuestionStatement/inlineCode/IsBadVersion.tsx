import { CodingLanguage } from 'utils/constants/lesson';
import generateInlineCode from 'content/blocks/InlineCode/generateInlineCode';

const CAMEL_CASE = 'isBadVersion';
const SNAKE_CASE = 'is_bad_version';

const codeMap = {
  [CodingLanguage.Javascript]: CAMEL_CASE,
  [CodingLanguage.Typescript]: CAMEL_CASE,
  [CodingLanguage.Python]: SNAKE_CASE,
  [CodingLanguage.Java]: 'isBadVersion',
  [CodingLanguage.Cpp]: 'isBadVersion',
  [CodingLanguage.Csharp]: 'IsBadVersion',
  [CodingLanguage.Go]: 'isBadVersion',
  [CodingLanguage.Kotlin]: 'isBadVersion',
  [CodingLanguage.Swift]: 'isBadVersion',
  [CodingLanguage.Rust]: 'self.is_bad_version',
};

const Code = generateInlineCode(codeMap);

export default Code;
