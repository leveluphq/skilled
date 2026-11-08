import generateInlineCode from 'content/blocks/InlineCode/generateInlineCode';
import { CodingLanguage } from 'utils/constants/lesson';

const nullCode = 'null';
const noneCode = 'None';

const codeMap = {
  [CodingLanguage.Javascript]: nullCode,
  [CodingLanguage.Typescript]: nullCode,
  [CodingLanguage.Python]: noneCode,
  [CodingLanguage.Java]: 'null',
  [CodingLanguage.Cpp]: 'nullptr',
  [CodingLanguage.Csharp]: 'null',
  [CodingLanguage.Go]: 'nil',
  [CodingLanguage.Kotlin]: 'null',
  [CodingLanguage.Swift]: 'nil',
  [CodingLanguage.Rust]: 'None',
};

const Null = generateInlineCode(codeMap);

export default Null;
