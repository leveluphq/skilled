import { CodingLanguage } from 'utils/constants/lesson';
import { cppRuntime } from './cpp';
import { csharpRuntime } from './csharp';
import { goRuntime } from './go';
import { javaRuntime } from './java';
import { javascriptRuntime, typescriptRuntime } from './javascript';
import { kotlinRuntime } from './kotlin';
import { pythonRuntime } from './python';
import { rustRuntime } from './rust';
import { swiftRuntime } from './swift';
import { LanguageRuntime } from './types';

// The languages the new runner can build programs for
export const runtimes: Partial<Record<CodingLanguage, LanguageRuntime>> = {
  [CodingLanguage.Javascript]: javascriptRuntime,
  [CodingLanguage.Typescript]: typescriptRuntime,
  [CodingLanguage.Python]: pythonRuntime,
  [CodingLanguage.Java]: javaRuntime,
  [CodingLanguage.Cpp]: cppRuntime,
  [CodingLanguage.Csharp]: csharpRuntime,
  [CodingLanguage.Go]: goRuntime,
  [CodingLanguage.Kotlin]: kotlinRuntime,
  [CodingLanguage.Swift]: swiftRuntime,
  [CodingLanguage.Rust]: rustRuntime,
};

export const runtimeFor = (language: CodingLanguage): LanguageRuntime | null =>
  Object.prototype.hasOwnProperty.call(runtimes, language) ? runtimes[language] || null : null;
