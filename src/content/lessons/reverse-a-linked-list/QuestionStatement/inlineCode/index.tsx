import { CodingLanguage } from 'utils/constants/lesson';
import generateInlineCode from 'content/blocks/InlineCode/generateInlineCode';

const CAMEL_CASE = 'reverseLinkedList';
const SNAKE_CASE = 'reverse_linked_list';

const codeMap = {
  [CodingLanguage.Javascript]: CAMEL_CASE,
  [CodingLanguage.Typescript]: CAMEL_CASE,
  [CodingLanguage.Python]: SNAKE_CASE,
  [CodingLanguage.Java]: 'reverseLinkedList',
  [CodingLanguage.Cpp]: 'reverseLinkedList',
  [CodingLanguage.Csharp]: 'ReverseLinkedList',
  [CodingLanguage.Go]: 'reverseLinkedList',
  [CodingLanguage.Kotlin]: 'reverseLinkedList',
  [CodingLanguage.Swift]: 'reverseLinkedList',
  [CodingLanguage.Rust]: 'reverse_linked_list',
};

const Code = generateInlineCode(codeMap);

export default Code;
