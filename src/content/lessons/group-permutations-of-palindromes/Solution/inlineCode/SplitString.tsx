import { CodingLanguage } from 'utils/constants/lesson';
import generateInlineCode from 'content/blocks/InlineCode/generateInlineCode';

const codeMap = {
  [CodingLanguage.Javascript]: ".split('')",
  [CodingLanguage.Typescript]: ".split('')",
  [CodingLanguage.Python]: "sorted",
  [CodingLanguage.Java]: '.toCharArray()',
  [CodingLanguage.Cpp]: 'copy',
  [CodingLanguage.Csharp]: '.ToCharArray()',
  [CodingLanguage.Go]: '[]byte(s)',
  [CodingLanguage.Kotlin]: '.toCharArray()',
  [CodingLanguage.Swift]: '.sorted()',
  [CodingLanguage.Rust]: '.chars()',
};

const Code = generateInlineCode(codeMap);

export default Code;
