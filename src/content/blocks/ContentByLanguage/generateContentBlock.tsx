import * as React from 'react';
import { CodingLanguage } from 'utils/constants/lesson';
import ContentByLanguage from 'content/blocks/ContentByLanguage';

// Content not written for a language yet falls back to the JavaScript version
type ContentMapMap = Partial<Record<CodingLanguage, React.ReactNode>>;

const generateContentBlock = (contentMap: ContentMapMap) => {
  const getContent = (language: CodingLanguage) =>
    contentMap[language] === undefined ? contentMap[CodingLanguage.Javascript] : contentMap[language];

  return () => <ContentByLanguage content={getContent} />;
};

export default generateContentBlock;
