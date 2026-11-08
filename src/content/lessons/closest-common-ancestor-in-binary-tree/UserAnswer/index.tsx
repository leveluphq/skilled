import * as React from 'react';
import { CodingLanguage } from 'utils/constants/lesson';
import JavaScriptCode from './javascript.mdx';
import TypeScriptCode from './typescript.mdx';
import PythonCode from './python.mdx';
import JavaCode from './java.mdx';
import GoCode from './go.mdx';
import RustCode from './rust.mdx';
import CSharpCode from './csharp.mdx';
import CppCode from './cpp.mdx';
import SwiftCode from './swift.mdx';
import KotlinCode from './kotlin.mdx';

const codeMap: Partial<Record<CodingLanguage, JSX.Element>> = {
  [CodingLanguage.Javascript]: <JavaScriptCode />,
  [CodingLanguage.Typescript]: <TypeScriptCode />,
  [CodingLanguage.Python]: <PythonCode />,
  [CodingLanguage.Java]: <JavaCode />,
  [CodingLanguage.Go]: <GoCode />,
  [CodingLanguage.Rust]: <RustCode />,
  [CodingLanguage.Csharp]: <CSharpCode />,
  [CodingLanguage.Cpp]: <CppCode />,
  [CodingLanguage.Swift]: <SwiftCode />,
  [CodingLanguage.Kotlin]: <KotlinCode />,
};

const code = (language: CodingLanguage) => {
  return codeMap[language];
};

export default code;
