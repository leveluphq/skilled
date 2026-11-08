import { CodingLanguage } from 'utils/constants/lesson';
import generateInlineCode from 'content/blocks/InlineCode/generateInlineCode';

const CAMEL_CASE = 'firstBadVersion';
const SNAKE_CASE = 'first_bad_version';

const codeMap = {
  [CodingLanguage.Javascript]: CAMEL_CASE,
  [CodingLanguage.Typescript]: CAMEL_CASE,
  [CodingLanguage.Python]: SNAKE_CASE,
  [CodingLanguage.Java]: 'firstBadVersion',
  [CodingLanguage.Cpp]: 'firstBadVersion',
  [CodingLanguage.Csharp]: 'FirstBadVersion',
  [CodingLanguage.Go]: 'firstBadVersion',
  [CodingLanguage.Kotlin]: 'firstBadVersion',
  [CodingLanguage.Swift]: 'firstBadVersion',
  [CodingLanguage.Rust]: 'first_bad_version',
};

const Code = generateInlineCode(codeMap);

export default Code;
