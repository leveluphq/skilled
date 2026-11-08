import { CodingLanguage } from 'utils/constants/lesson';
import generateInlineCode from 'content/blocks/InlineCode/generateInlineCode';

const CAMEL_CASE = 'hasExitPath';
const SNAKE_CASE = 'has_exit_path';

const codeMap = {
  [CodingLanguage.Javascript]: CAMEL_CASE,
  [CodingLanguage.Typescript]: CAMEL_CASE,
  [CodingLanguage.Python]: SNAKE_CASE,
  [CodingLanguage.Java]: 'hasExitPath',
  [CodingLanguage.Cpp]: 'hasExitPath',
  [CodingLanguage.Csharp]: 'HasExitPath',
  [CodingLanguage.Go]: 'hasExitPath',
  [CodingLanguage.Kotlin]: 'hasExitPath',
  [CodingLanguage.Swift]: 'hasExitPath',
  [CodingLanguage.Rust]: 'has_exit_path',
};

const Code = generateInlineCode(codeMap);

export default Code;
