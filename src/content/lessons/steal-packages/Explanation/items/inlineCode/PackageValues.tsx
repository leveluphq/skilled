import { CodingLanguage } from 'utils/constants/lesson';
import generateInlineCode from 'content/blocks/InlineCode/generateInlineCode';

const codeMap = {
  [CodingLanguage.Javascript]: 'packageValues[i]',
  [CodingLanguage.Typescript]: 'packageValues[i]',
  [CodingLanguage.Python]: 'package_values[i]',
  [CodingLanguage.Java]: 'packageValues[i]',
  [CodingLanguage.Cpp]: 'packageValues[i]',
  [CodingLanguage.Csharp]: 'packageValues[i]',
  [CodingLanguage.Go]: 'packageValues[i]',
  [CodingLanguage.Kotlin]: 'packageValues[i]',
  [CodingLanguage.Swift]: 'packageValues[i]',
  [CodingLanguage.Rust]: 'package_values[i]',
};

const Code = generateInlineCode(codeMap);

export default Code;
