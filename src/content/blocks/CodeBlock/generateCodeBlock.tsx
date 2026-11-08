import * as React from 'react';
import { CodingLanguage, EnforceLanguage } from 'utils/constants/lesson';
import CodeBlock from 'content/blocks/CodeBlock';

// Snippets are written per language. One that hasn't been ported to a
// language yet is shown in JavaScript.
type CodeMap = Partial<Record<CodingLanguage, React.ReactNode>>;

const getLanguage = (language: CodingLanguage, allowedLanguages: EnforceLanguage) => {
  if (allowedLanguages.options.includes(language)) {
    return language;
  } else {
    return allowedLanguages.default;
  }
};

const generateCodeBlock = (codeMap: CodeMap, allowedLanguages?: EnforceLanguage) => {
  const getLanguageUsed = (language: CodingLanguage) => {
    const used = allowedLanguages ? getLanguage(language, allowedLanguages) : language;
    return codeMap[used] === undefined ? CodingLanguage.Javascript : used;
  };
  const getCode = (language: CodingLanguage) => codeMap[getLanguageUsed(language)];

  return () => {
    return <CodeBlock code={getCode} getLanguageUsed={getLanguageUsed} />;
  };
};

export default generateCodeBlock;
