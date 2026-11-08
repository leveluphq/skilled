import { CodingLanguage } from 'utils/constants/lesson';
import generateInlineCode from 'content/blocks/InlineCode/generateInlineCode';

const CAMEL_CASE = 'currentNode1';
const SNAKE_CASE = 'current_node1';

const codeMap = {
  [CodingLanguage.Javascript]: CAMEL_CASE,
  [CodingLanguage.Typescript]: CAMEL_CASE,
  [CodingLanguage.Python]: SNAKE_CASE,
  [CodingLanguage.Java]: 'currentNode1',
  [CodingLanguage.Cpp]: 'currentNode1',
  [CodingLanguage.Csharp]: 'currentNode1',
  [CodingLanguage.Go]: 'currentNode1',
  [CodingLanguage.Kotlin]: 'currentNode1',
  [CodingLanguage.Swift]: 'currentNode1',
  [CodingLanguage.Rust]: 'current_node1',
};

const Code = generateInlineCode(codeMap);

export default Code;
