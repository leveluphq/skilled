import { CodingLanguage } from 'utils/constants/lesson';
import generateInlineCode from 'content/blocks/InlineCode/generateInlineCode';

const CAMEL_CASE = 'mirrorDelete';
const SNAKE_CASE = 'mirror_delete';

const codeMap = {
  [CodingLanguage.Javascript]: CAMEL_CASE,
  [CodingLanguage.Typescript]: CAMEL_CASE,
  [CodingLanguage.Python]: SNAKE_CASE,
  [CodingLanguage.Java]: 'mirrorDelete',
  [CodingLanguage.Cpp]: 'mirrorDelete',
  [CodingLanguage.Csharp]: 'MirrorDelete',
  [CodingLanguage.Go]: 'mirrorDelete',
  [CodingLanguage.Kotlin]: 'mirrorDelete',
  [CodingLanguage.Swift]: 'mirrorDelete',
  [CodingLanguage.Rust]: 'mirror_delete',
};

const Code = generateInlineCode(codeMap);

export default Code;
