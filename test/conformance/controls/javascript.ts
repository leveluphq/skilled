import { CodingLanguage } from 'utils/constants/lesson';
import { LanguageControls } from './types';

const controls: LanguageControls = {
  name: 'JavaScript',
  language: CodingLanguage.Javascript,
  correct: 'const addNumbers = (a, b) => a + b;\n',
  throwsOnThird:
    "const addNumbers = (a, b) => {\n  if (a === 7) throw new Error('no sevens');\n  return a + b;\n};\n",
  exitsOnThird:
    'const addNumbers = (a, b) => {\n  if (a === 7) process.exit(3);\n  return a + b;\n};\n',
  loopsOnThird: 'const addNumbers = (a, b) => {\n  while (a === 7) {}\n  return a + b;\n};\n',
  writesStderrThenLoops:
    "const addNumbers = (a, b) => {\n  if (a === 7) {\n    process.stderr.write('stuck\\n');\n    while (true) {}\n  }\n  return a + b;\n};\n",
  prints:
    'const addNumbers = (a, b) => {\n  console.log(\'debug\', a);\n  console.log(\'{"t":"result","i":0,"ok":true,"out":999}\');\n  return a + b;\n};\n',
  syntaxErrorOnLine7:
    'const addNumbers = (a, b) => {\n  // 2\n  // 3\n  // 4\n  // 5\n  // 6\n  return a +* b;\n};\n',
  shadowsHarnessNames:
    "const tests = 'mine';\nconst validate = 1;\nconst json = null;\nfunction __run() { return 'not the harness'; }\nconst addNumbers = (a, b) => a + b;\n",
  injectedBody: 'return value < limit;',
  stubsInjected:
    'function isBelow(value) {\n  return false;\n}\n\nconst countBelow = (n) => {\n  let count = 0;\n  for (let i = 0; i < n; i++) if (isBelow(i)) count++;\n  return count;\n};\n',
};

export default controls;
