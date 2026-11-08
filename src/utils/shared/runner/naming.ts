import { CodingLanguage } from 'utils/constants/lesson';

// Specs name functions and methods in camelCase; each language uses its own
// convention (LeetCode-style, docs/adding-a-language.md).
const toSnakeCase = (name: string) => name.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
const toPascalCase = (name: string) => name.charAt(0).toUpperCase() + name.slice(1);

export const functionName = (language: CodingLanguage, name: string) => {
  switch (language) {
    case CodingLanguage.Python:
    case CodingLanguage.Rust:
      return toSnakeCase(name);
    case CodingLanguage.Csharp:
      return toPascalCase(name);
    default:
      return name;
  }
};

// Parameter names follow the same convention, except that C# keeps camelCase
export const parameterName = (language: CodingLanguage, name: string) =>
  language === CodingLanguage.Python || language === CodingLanguage.Rust ? toSnakeCase(name) : name;

// The name to use for a spec's function or method in a language, honouring the
// spec's overrides
export const nameIn = (
  language: CodingLanguage,
  name: string,
  overrides?: Partial<Record<CodingLanguage, string>>,
) => (overrides && overrides[language]) || functionName(language, name);
