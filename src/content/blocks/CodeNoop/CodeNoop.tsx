import * as React from 'react';
import { CodeSnippetGenerator } from 'utils/constants/lesson';
import useCodingLanguage from 'components/hooks/useCodingLanguage';

interface Props {
  code: CodeSnippetGenerator;
}

const CodeNoop: React.FC<Props> = ({ code }) => {
  const { language } = useCodingLanguage();
  return <>{code(language)}</>;
};

export default CodeNoop;
