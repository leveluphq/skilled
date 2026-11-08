import { CodingLanguage } from 'utils/constants/lesson';
import generateInlineCode from 'content/blocks/InlineCode/generateInlineCode';

const codeMap = {
  [CodingLanguage.Javascript]: 'const hasSubsquares = Math.sqrt(rowCount) % 1 === 0;',
  [CodingLanguage.Typescript]: 'const hasSubsquares = Math.sqrt(rowCount) % 1 === 0;',
  [CodingLanguage.Python]: 'has_subsquares = math.sqrt(row_count) % 1 == 0',
  [CodingLanguage.Java]: 'boolean hasSubsquares = Math.sqrt(rowCount) % 1 == 0;',
  [CodingLanguage.Cpp]: 'bool hasSubsquares = fmod(sqrt(rowCount), 1.0) == 0;',
  [CodingLanguage.Csharp]: 'bool hasSubsquares = Math.Sqrt(rowCount) % 1 == 0;',
  [CodingLanguage.Go]: 'hasSubsquares := math.Mod(math.Sqrt(float64(rowCount)), 1) == 0',
  [CodingLanguage.Kotlin]: 'val hasSubsquares = sqrt(rowCount.toDouble()) % 1 == 0.0',
  [CodingLanguage.Swift]: 'let hasSubsquares = Double(rowCount).squareRoot().truncatingRemainder(dividingBy: 1) == 0',
  [CodingLanguage.Rust]: 'let has_subsquares = (row_count as f64).sqrt() % 1.0 == 0.0;',
};

const Code = generateInlineCode(codeMap);

export default Code;
