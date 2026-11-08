import * as React from 'react';
import { CodeSnippetGenerator } from 'utils/constants/lesson';
import useCodingLanguage from 'components/hooks/useCodingLanguage';

interface Props {
  inlineCode: CodeSnippetGenerator;
}

const InlineCode: React.FC<Props> = ({ inlineCode }) => {
  const { language } = useCodingLanguage();
  return <code>{inlineCode(language)}</code>;
};

export default InlineCode;
