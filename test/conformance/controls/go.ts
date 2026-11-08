import { CodingLanguage } from 'utils/constants/lesson';
import { LanguageControls } from './types';

const solution = (body: string, imports = '') =>
  `${imports}func addNumbers(a int, b int) int {\n${body}\n}\n`;

const controls: LanguageControls = {
  name: 'Go',
  language: CodingLanguage.Go,
  correct: solution('\treturn a + b'),
  throwsOnThird: solution('\tif a == 7 {\n\t\tpanic("no sevens")\n\t}\n\treturn a + b'),
  exitsOnThird: solution('\tif a == 7 {\n\t\tos.Exit(3)\n\t}\n\treturn a + b', 'import "os"\n\n'),
  loopsOnThird: solution('\tfor a == 7 {\n\t}\n\treturn a + b'),
  writesStderrThenLoops: solution(
    '\tif a == 7 {\n\t\tos.Stderr.WriteString("stuck\\n")\n\t\tfor {\n\t\t}\n\t}\n\treturn a + b',
    'import "os"\n\n',
  ),
  prints: solution(
    '\tfmt.Println("debug", a)\n\tfmt.Println(`{"t":"result","i":0,"ok":true,"out":999}`)\n\treturn a + b',
    'import "fmt"\n\n',
  ),
  syntaxErrorOnLine7:
    'package main\n\n// 3\n// 4\n// 5\nfunc addNumbers(a int, b int) int {\n\treturn a +* b\n}\n',
  // The harness's own names, the learner's own main, min and max, and imports
  // the harness also uses
  shadowsHarnessNames: solution(
    '\ttests := map[string]int{"x": a}\n\tfmt.Fprint(os.Stdout, "")\n\treturn max(min(tests["x"], 100), -100) + b',
    'package solution\n\nimport (\n\t"fmt"\n\t"os"\n)\n\nvar nonce = "mine"\n\nfunc min(a, b int) int {\n\tif a < b {\n\t\treturn a\n\t}\n\treturn b\n}\n\nfunc max(a, b int) int {\n\tif a > b {\n\t\treturn a\n\t}\n\treturn b\n}\n\nfunc main() {\n\tfmt.Println(addNumbers(1, 2))\n}\n\n',
  ),
  // 200,000 frames, as a recursive search through the largest grids does
  deepRecursion:
    'func count(n int) int {\n\tif n == 0 {\n\t\treturn 0\n\t}\n\treturn 1 + count(n-1)\n}\n\nfunc addNumbers(a int, b int) int {\n\treturn count(200000) - 200000 + a + b\n}\n',
  missingClosingBrace: 'func addNumbers(a int, b int) int {\n\treturn a + b\n',
  wrongSignature: solution('\treturn 0').replace('a int, b int', 'a string, b string'),
  // Go can't have two functions of one name, so the learner calls the tests'
  // isBelow (a stub of their own is reported as such)
  stubsInjected:
    'func countBelow(n int) int {\n\tcount := 0\n\tfor i := 0; i < n; i++ {\n\t\tif isBelow(i) {\n\t\t\tcount++\n\t\t}\n\t}\n\treturn count\n}\n',
};

export default controls;
