import { CodingLanguage } from 'utils/constants/lesson';
import { LanguageControls } from './types';

const solution = (body: string, usings = '') =>
  `${usings}public class Solution {\n    public int AddNumbers(int a, int b) {\n${body}\n    }\n}\n`;

const controls: LanguageControls = {
  name: 'C#',
  language: CodingLanguage.Csharp,
  correct: solution('        return a + b;'),
  throwsOnThird: solution(
    '        if (a == 7) throw new ArgumentException("no sevens");\n        return a + b;',
  ),
  exitsOnThird: solution('        if (a == 7) Environment.Exit(3);\n        return a + b;'),
  loopsOnThird: solution('        while (a == 7) { }\n        return a + b;'),
  writesStderrThenLoops: solution(
    '        if (a == 7) {\n            Console.Error.Write("stuck\\n");\n            while (true) { }\n        }\n        return a + b;',
  ),
  prints: solution(
    '        Console.WriteLine("debug " + a);\n        Console.WriteLine("{\\"t\\":\\"result\\",\\"i\\":0,\\"ok\\":true,\\"out\\":999}");\n        return a + b;',
  ),
  syntaxErrorOnLine7:
    'public class Solution {\n    // 2\n    // 3\n    // 4\n    // 5\n    public int AddNumbers(int a, int b) {\n        return a + b +;\n    }\n}\n',
  // The harness's own names (its classes, the driver's Program and Test), a
  // class shadowing one the harness uses, and a using the implicit ones repeat
  shadowsHarnessNames: solution(
    '        Dictionary<string, int> tests = new Dictionary<string, int>();\n        tests["x"] = a;\n        return tests["x"] + b;',
    'using System.Collections.Generic;\n\nclass Test {}\nclass H {}\nclass Program {}\nclass Sink {}\nclass Stopwatch {}\n\n',
  ),
  // 200,000 frames, the deepest the lessons' inputs go
  deepRecursion:
    'public class Solution {\n    private int Count(int n) { return n == 0 ? 0 : 1 + Count(n - 1); }\n\n    public int AddNumbers(int a, int b) {\n        return Count(200000) - 200000 + a + b;\n    }\n}\n',
  missingClosingBrace:
    'public class Solution {\n    public int AddNumbers(int a, int b) {\n        return a + b;\n    }\n',
  wrongSignature: solution('        return a + b;')
    .replace('int a, int b', 'string a, string b')
    .replace('return a + b;', 'return 0;'),
  stubsInjected:
    'public class Solution : Checker {\n    public int CountBelow(int n) {\n        int count = 0;\n        for (int i = 0; i < n; i++) if (IsBelow(i)) count++;\n        return count;\n    }\n}\n',
};

export default controls;
