import * as React from 'react';
import { CodingLanguage } from 'utils/constants/lesson';
import JavaScriptCode from './javascript.mdx';
import PythonCode from './python.mdx';

const codeMap: Partial<Record<CodingLanguage, JSX.Element>> = {
  [CodingLanguage.Javascript]: <JavaScriptCode />,
  [CodingLanguage.Typescript]: <JavaScriptCode />,
  [CodingLanguage.Python]: <PythonCode />,
};

const code = (language: CodingLanguage) => {
  return codeMap[language];
};

export default code;
