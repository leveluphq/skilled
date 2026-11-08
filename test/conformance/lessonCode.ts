import fs from 'fs';
import path from 'path';
import { CodingLanguage } from 'utils/constants/lesson';

// The code blocks the lessons show, read from their MDX files

export const LESSONS_DIR = path.join(__dirname, '../../src/content/lessons');

// The file each language's code lives in, in a lesson's code folders
export const FILE_FOR_LANGUAGE: Record<CodingLanguage, string> = {
  [CodingLanguage.Javascript]: 'javascript.mdx',
  [CodingLanguage.Typescript]: 'typescript.mdx',
  [CodingLanguage.Python]: 'python.mdx',
  [CodingLanguage.Java]: 'java.mdx',
  [CodingLanguage.Cpp]: 'cpp.mdx',
  [CodingLanguage.Csharp]: 'csharp.mdx',
  [CodingLanguage.Go]: 'go.mdx',
  [CodingLanguage.Kotlin]: 'kotlin.mdx',
  [CodingLanguage.Swift]: 'swift.mdx',
  [CodingLanguage.Rust]: 'rust.mdx',
};

// Every fenced code block in an MDX file, joined, or null if there's no file
export const readCode = (file: string): string | null => {
  if (!fs.existsSync(file)) {
    return null;
  }

  const blocks = fs.readFileSync(file, 'utf8').match(/```[a-zA-Z0-9+#]*\n[\s\S]*?```/g);

  return blocks
    ? blocks
        .map((block) => block.replace(/^```[a-zA-Z0-9+#]*\n/, '').replace(/```$/, ''))
        .join('\n')
    : null;
};

// Solution variants that aren't a complete answer to the lesson's question
const NOT_RUNNABLE: Record<string, string> = {
  'sum-digits/RecursiveExpression': 'a one-line recurrence shown in the text, not a program',
  'product-array/Bonus': 'a variant under a different name, checked by check-lessons',
};

export interface LessonCode {
  label: string;
  code: string;
}

export const referenceSolutions = (slug: string, language: CodingLanguage): LessonCode[] => {
  const dir = path.join(LESSONS_DIR, slug, 'Solution/code');

  if (!fs.existsSync(dir)) {
    return [];
  }

  return fs
    .readdirSync(dir)
    .filter((variant) => !NOT_RUNNABLE[`${slug}/${variant}`])
    .sort()
    .map((variant) => ({
      label: variant,
      code: readCode(path.join(dir, variant, FILE_FOR_LANGUAGE[language])),
    }))
    .filter((solution): solution is LessonCode => solution.code !== null);
};

export const starterCode = (slug: string, language: CodingLanguage): string | null =>
  readCode(path.join(LESSONS_DIR, slug, 'UserAnswer', FILE_FOR_LANGUAGE[language]));
