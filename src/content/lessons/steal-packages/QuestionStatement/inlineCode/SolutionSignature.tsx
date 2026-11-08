import { CodingLanguage } from 'utils/constants/lesson';
import generateInlineCode from 'content/blocks/InlineCode/generateInlineCode';

const CAMEL_CASE = 'stealPackages';
const SNAKE_CASE = 'steal_packages';

const codeMap = {
  [CodingLanguage.Javascript]: CAMEL_CASE,
  [CodingLanguage.Typescript]: CAMEL_CASE,
  [CodingLanguage.Python]: SNAKE_CASE,
  [CodingLanguage.Java]: 'stealPackages',
  [CodingLanguage.Cpp]: 'stealPackages',
  [CodingLanguage.Csharp]: 'StealPackages',
  [CodingLanguage.Go]: 'stealPackages',
  [CodingLanguage.Kotlin]: 'stealPackages',
  [CodingLanguage.Swift]: 'stealPackages',
  [CodingLanguage.Rust]: 'steal_packages',
};

const Code = generateInlineCode(codeMap);

export default Code;
