import { CodingLanguage } from 'utils/constants/lesson';
import generateInlineCode from 'content/blocks/InlineCode/generateInlineCode';

const CAMEL_CASE = 'walkMatrix';
const SNAKE_CASE = 'walk_matrix';

const codeMap = {
  [CodingLanguage.Javascript]: CAMEL_CASE,
  [CodingLanguage.Typescript]: CAMEL_CASE,
  [CodingLanguage.Python]: SNAKE_CASE,
  [CodingLanguage.Java]: 'walkMatrix',
  [CodingLanguage.Cpp]: 'walkMatrix',
  [CodingLanguage.Csharp]: 'WalkMatrix',
  [CodingLanguage.Go]: 'walkMatrix',
  [CodingLanguage.Kotlin]: 'walkMatrix',
  [CodingLanguage.Swift]: 'walkMatrix',
  [CodingLanguage.Rust]: 'walk_matrix',
};

const Code = generateInlineCode(codeMap);

export default Code;
