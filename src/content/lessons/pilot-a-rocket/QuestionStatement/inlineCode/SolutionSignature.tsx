import { CodingLanguage } from 'utils/constants/lesson';
import generateInlineCode from 'content/blocks/InlineCode/generateInlineCode';

const CAMEL_CASE = 'pilotRocket';
const SNAKE_CASE = 'pilot_rocket';

const codeMap = {
  [CodingLanguage.Javascript]: CAMEL_CASE,
  [CodingLanguage.Typescript]: CAMEL_CASE,
  [CodingLanguage.Python]: SNAKE_CASE,
  [CodingLanguage.Java]: 'pilotRocket',
  [CodingLanguage.Cpp]: 'pilotRocket',
  [CodingLanguage.Csharp]: 'PilotRocket',
  [CodingLanguage.Go]: 'pilotRocket',
  [CodingLanguage.Kotlin]: 'pilotRocket',
  [CodingLanguage.Swift]: 'pilotRocket',
  [CodingLanguage.Rust]: 'pilot_rocket',
};

const Code = generateInlineCode(codeMap);

export default Code;
