import * as React from 'react';
import { CodingLanguage } from 'utils/constants/lesson';
import generateCodeBlock from 'content/blocks/CodeBlock/generateCodeBlock';
import JavaScriptCode from './javascript.mdx';
import PythonCode from './python.mdx';

const codeMap = {
  [CodingLanguage.Javascript]: <JavaScriptCode />,
  [CodingLanguage.Typescript]: <JavaScriptCode />,
  [CodingLanguage.Python]: <PythonCode />,
};

const Code = generateCodeBlock(codeMap);

export default Code;
