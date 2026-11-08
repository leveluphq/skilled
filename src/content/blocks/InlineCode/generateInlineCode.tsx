import * as React from 'react';
import { CodingLanguage } from 'utils/constants/lesson';
import InlineCode from 'content/blocks/InlineCode';

// Inline code not written for a language yet falls back to the JavaScript version
type CodeMap = Partial<Record<CodingLanguage, React.ReactNode>>;

const generateInlineCode = (codeMap: CodeMap) => {
  const getCode = (language: CodingLanguage) =>
    codeMap[language] === undefined ? codeMap[CodingLanguage.Javascript] : codeMap[language];

  return () => <InlineCode inlineCode={getCode} />;
};

export default generateInlineCode;
