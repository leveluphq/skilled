import * as React from 'react';
import { CodingLanguage } from 'utils/constants/lesson';
import generateCodeBlock from 'content/blocks/CodeBlock/generateCodeBlock';
import JavaScriptCode from './javascript.mdx';

const codeMap = {
  [CodingLanguage.Javascript]: <JavaScriptCode />,
  [CodingLanguage.Typescript]: <JavaScriptCode />,
  [CodingLanguage.Python]: <JavaScriptCode />,
};

const Code = generateCodeBlock(codeMap, {
  default: CodingLanguage.Javascript,
  options: [CodingLanguage.Javascript, CodingLanguage.Typescript],
});

export default Code;
