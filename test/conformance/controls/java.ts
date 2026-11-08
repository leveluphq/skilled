import { CodingLanguage } from 'utils/constants/lesson';
import { LanguageControls } from './types';

const solution = (body: string, imports = '') =>
  `${imports}class Solution {\n    public int addNumbers(int a, int b) {\n${body}\n    }\n}\n`;

const controls: LanguageControls = {
  name: 'Java',
  language: CodingLanguage.Java,
  correct: solution('        return a + b;'),
  throwsOnThird: solution(
    '        if (a == 7) throw new IllegalArgumentException("no sevens");\n        return a + b;',
  ),
  exitsOnThird: solution('        if (a == 7) System.exit(3);\n        return a + b;'),
  loopsOnThird: solution('        while (a == 7) { }\n        return a + b;'),
  writesStderrThenLoops: solution(
    '        if (a == 7) {\n            System.err.print("stuck\\n");\n            while (true) { }\n        }\n        return a + b;',
  ),
  prints: solution(
    '        System.out.println("debug " + a);\n        System.out.println("{\\"t\\":\\"result\\",\\"i\\":0,\\"ok\\":true,\\"out\\":999}");\n        return a + b;',
  ),
  syntaxErrorOnLine7:
    'class Solution {\n    // 2\n    // 3\n    // 4\n    // 5\n    public int addNumbers(int a, int b) {\n        return a +* b;\n    }\n}\n',
  // The harness's own names, and an imported class shadowing nothing
  shadowsHarnessNames: solution(
    '        Map<String, Integer> tests = new HashMap<>();\n        tests.put("x", a);\n        return tests.get("x") + b;',
    'import java.util.*;\n\nclass Test {}\nclass Json {}\n\n',
  ),
  deepRecursion:
    'class Solution {\n    private int count(int n) { return n == 0 ? 0 : 1 + count(n - 1); }\n\n    public int addNumbers(int a, int b) {\n        return count(20000) - 20000 + a + b;\n    }\n}\n',
  missingClosingBrace:
    'class Solution {\n    public int addNumbers(int a, int b) {\n        return a + b;\n    }\n',
  wrongSignature: solution('        return a + b;')
    .replace('int a, int b', 'String a, String b')
    .replace('return a + b;', 'return 0;'),
  stubsInjected:
    'class Solution extends Checker {\n    public int countBelow(int n) {\n        int count = 0;\n        for (int i = 0; i < n; i++) if (isBelow(i)) count++;\n        return count;\n    }\n}\n',
};

export default controls;
