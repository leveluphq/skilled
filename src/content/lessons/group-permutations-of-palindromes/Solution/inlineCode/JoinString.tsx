import { CodingLanguage } from 'utils/constants/lesson';
import generateInlineCode from 'content/blocks/InlineCode/generateInlineCode';

const codeMap = {
  [CodingLanguage.Javascript]: ".join('')",
  [CodingLanguage.Typescript]: ".join('')",
  [CodingLanguage.Python]: "join",
  [CodingLanguage.Java]: 'new String(characters)',
  [CodingLanguage.Cpp]: 'sort',
  [CodingLanguage.Csharp]: 'new string(characters)',
  [CodingLanguage.Go]: 'string(characters)',
  [CodingLanguage.Kotlin]: '.joinToString("")',
  [CodingLanguage.Swift]: 'String(...)',
  [CodingLanguage.Rust]: '.collect()',
};

const Code = generateInlineCode(codeMap);

export default Code;
