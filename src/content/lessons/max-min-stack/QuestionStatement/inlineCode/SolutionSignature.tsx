import { CodingLanguage } from 'utils/constants/lesson';
import generateInlineCode from 'content/blocks/InlineCode/generateInlineCode';

const CAMEL_CASE = 'MaxMinStack';

const codeMap = {
  [CodingLanguage.Javascript]: CAMEL_CASE,
  [CodingLanguage.Typescript]: CAMEL_CASE,
  [CodingLanguage.Python]: CAMEL_CASE,
  [CodingLanguage.Java]: 'MaxMinStack',
  [CodingLanguage.Cpp]: 'MaxMinStack',
  [CodingLanguage.Csharp]: 'MaxMinStack',
  [CodingLanguage.Go]: 'MaxMinStack',
  [CodingLanguage.Kotlin]: 'MaxMinStack',
  [CodingLanguage.Swift]: 'MaxMinStack',
  [CodingLanguage.Rust]: 'MaxMinStack',
};

const Code = generateInlineCode(codeMap);

export default Code;
