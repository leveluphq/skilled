import { CodingLanguage } from 'utils/constants/lesson';
import generateInlineCode from 'content/blocks/InlineCode/generateInlineCode';

const CAMEL_CASE = 'currentNode2';
const SNAKE_CASE = 'current_node2';

const codeMap = {
  [CodingLanguage.Javascript]: CAMEL_CASE,
  [CodingLanguage.Typescript]: CAMEL_CASE,
  [CodingLanguage.Python]: SNAKE_CASE,
  [CodingLanguage.Java]: 'currentNode2',
  [CodingLanguage.Cpp]: 'currentNode2',
  [CodingLanguage.Csharp]: 'currentNode2',
  [CodingLanguage.Go]: 'currentNode2',
  [CodingLanguage.Kotlin]: 'currentNode2',
  [CodingLanguage.Swift]: 'currentNode2',
  [CodingLanguage.Rust]: 'current_node2',
};

const Code = generateInlineCode(codeMap);

export default Code;
