import { CodingLanguage } from 'utils/constants/lesson';
import generateInlineCode from 'content/blocks/InlineCode/generateInlineCode';

const CAMEL_CASE = 'mergeOverlappingIntervals';
const SNAKE_CASE = 'merge_overlapping_intervals';

const codeMap = {
  [CodingLanguage.Javascript]: CAMEL_CASE,
  [CodingLanguage.Typescript]: CAMEL_CASE,
  [CodingLanguage.Python]: SNAKE_CASE,
  [CodingLanguage.Java]: 'mergeOverlappingIntervals',
  [CodingLanguage.Cpp]: 'mergeOverlappingIntervals',
  [CodingLanguage.Csharp]: 'MergeOverlappingIntervals',
  [CodingLanguage.Go]: 'mergeOverlappingIntervals',
  [CodingLanguage.Kotlin]: 'mergeOverlappingIntervals',
  [CodingLanguage.Swift]: 'mergeOverlappingIntervals',
  [CodingLanguage.Rust]: 'merge_overlapping_intervals',
};

const Code = generateInlineCode(codeMap);

export default Code;
