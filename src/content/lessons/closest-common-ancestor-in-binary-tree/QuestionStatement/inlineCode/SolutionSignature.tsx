import { CodingLanguage } from 'utils/constants/lesson';
import generateInlineCode from 'content/blocks/InlineCode/generateInlineCode';

const CAMEL_CASE = 'findClosestAncestor';
const SNAKE_CASE = 'find_closest_ancestor';

const codeMap = {
  [CodingLanguage.Javascript]: CAMEL_CASE,
  [CodingLanguage.Typescript]: CAMEL_CASE,
  [CodingLanguage.Python]: SNAKE_CASE,
  [CodingLanguage.Java]: 'findClosestAncestor',
  [CodingLanguage.Cpp]: 'findClosestAncestor',
  [CodingLanguage.Csharp]: 'FindClosestAncestor',
  [CodingLanguage.Go]: 'findClosestAncestor',
  [CodingLanguage.Kotlin]: 'findClosestAncestor',
  [CodingLanguage.Swift]: 'findClosestAncestor',
  [CodingLanguage.Rust]: 'find_closest_ancestor',
};

const Code = generateInlineCode(codeMap);

export default Code;
