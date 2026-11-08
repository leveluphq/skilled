import { CodingLanguage } from 'utils/constants/lesson';
import { LanguageControls } from './types';

const controls: LanguageControls = {
  name: 'TypeScript',
  language: CodingLanguage.Typescript,
  correct: 'const addNumbers = (a: number, b: number): number => a + b;\n',
  throwsOnThird:
    "const addNumbers = (a: number, b: number): number => {\n  if (a === 7) throw new Error('no sevens');\n  return a + b;\n};\n",
  exitsOnThird:
    'const addNumbers = (a: number, b: number): number => {\n  if (a === 7) process.exit(3);\n  return a + b;\n};\n',
  loopsOnThird:
    'const addNumbers = (a: number, b: number): number => {\n  while (a === 7) {}\n  return a + b;\n};\n',
  writesStderrThenLoops:
    "const addNumbers = (a: number, b: number): number => {\n  if (a === 7) {\n    process.stderr.write('stuck\\n');\n    while (true) {}\n  }\n  return a + b;\n};\n",
  prints:
    "const addNumbers = (a: number, b: number): number => {\n  console.log('debug', a);\n  return a + b;\n};\n",
  syntaxErrorOnLine7:
    'const addNumbers = (a: number, b: number): number => {\n  // 2\n  // 3\n  // 4\n  // 5\n  // 6\n  return a +* b;\n};\n',
  // Under tsc's default ES3 target these loops run zero times
  iteratesSetsAndMaps:
    'const addNumbers = (a: number, b: number): number => {\n  let total = 0;\n  for (const n of new Set([a, b])) total += n;\n  for (const [, n] of new Map([[1, 0]])) total += n;\n  return a === b ? total * 2 : total;\n};\n',
  stubsInjected:
    'function isBelow(value: number): boolean {\n  return false;\n}\n\nconst countBelow = (n: number): number => {\n  let count = 0;\n  for (let i = 0; i < n; i++) if (isBelow(i)) count++;\n  return count;\n};\n',
};

export default controls;
