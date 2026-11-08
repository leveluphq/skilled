import { CodingLanguage } from 'utils/constants/lesson';
import generateInlineCode from 'content/blocks/InlineCode/generateInlineCode';

const CAMEL_CASE = 'findHackerEmail';
const SNAKE_CASE = 'find_hacker_email';

const codeMap = {
  [CodingLanguage.Javascript]: CAMEL_CASE,
  [CodingLanguage.Typescript]: CAMEL_CASE,
  [CodingLanguage.Python]: SNAKE_CASE,
  [CodingLanguage.Java]: 'findHackerEmail',
  [CodingLanguage.Cpp]: 'findHackerEmail',
  [CodingLanguage.Csharp]: 'FindHackerEmail',
  [CodingLanguage.Go]: 'findHackerEmail',
  [CodingLanguage.Kotlin]: 'findHackerEmail',
  [CodingLanguage.Swift]: 'findHackerEmail',
  [CodingLanguage.Rust]: 'find_hacker_email',
};

const Code = generateInlineCode(codeMap);

export default Code;
