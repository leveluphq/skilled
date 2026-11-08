import * as React from 'react';
import { CodingLanguage } from 'utils/constants/lesson';
import generateCodeBlock from 'content/blocks/CodeBlock/generateCodeBlock';
import JavaScriptCode from './javascript.mdx';
import TypeScriptCode from './typescript.mdx';
import PythonCode from './python.mdx';
import JavaCode from './java.mdx';
import SwiftCode from './swift.mdx';
import GoCode from './go.mdx';
import CSharpCode from './csharp.mdx';
import KotlinCode from './kotlin.mdx';
import RustCode from './rust.mdx';
import CppCode from './cpp.mdx';

const codeMap = {
  [CodingLanguage.Javascript]: <JavaScriptCode />,
  [CodingLanguage.Typescript]: <TypeScriptCode />,
  [CodingLanguage.Python]: <PythonCode />,
  [CodingLanguage.Java]: <JavaCode />,
  [CodingLanguage.Swift]: <SwiftCode />,
  [CodingLanguage.Go]: <GoCode />,
  [CodingLanguage.Csharp]: <CSharpCode />,
  [CodingLanguage.Kotlin]: <KotlinCode />,
  [CodingLanguage.Rust]: <RustCode />,
  [CodingLanguage.Cpp]: <CppCode />,
};

const Code = generateCodeBlock(codeMap);

export default Code;