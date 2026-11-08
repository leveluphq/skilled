import { CodingLanguage } from 'utils/constants/lesson';
import { LanguageControls } from './types';

const solution = (body: string, before = '') =>
  `${before}class Solution {\npublic:\n    int addNumbers(int a, int b) {\n${body}\n    }\n};\n`;

const controls: LanguageControls = {
  name: 'C++',
  language: CodingLanguage.Cpp,
  correct: solution('        return a + b;'),
  throwsOnThird: solution(
    '        if (a == 7) throw invalid_argument("no sevens");\n        return a + b;',
  ),
  exitsOnThird: solution('        if (a == 7) exit(3);\n        return a + b;'),
  // C++ lets the compiler remove a loop that has an exit but does nothing (g++
  // -O2 does), so this one counts
  loopsOnThird: solution(
    '        volatile long spins = 0;\n        while (a == 7) spins = spins + 1;\n        return a + b;',
  ),
  writesStderrThenLoops: solution(
    '        if (a == 7) {\n            cerr << "stuck\\n";\n            while (true) { }\n        }\n        return a + b;',
  ),
  prints: solution(
    '        cout << "debug " << a << endl;\n        printf("{\\"t\\":\\"result\\",\\"i\\":0,\\"ok\\":true,\\"out\\":999}\\n");\n        return a + b;',
  ),
  syntaxErrorOnLine7:
    'class Solution {\npublic:\n    // 3\n    // 4\n    // 5\n    int addNumbers(int a, int b) {\n        return a +* b;\n    }\n};\n',
  // The harness's own names, a contest-style macro, and a main() kept from
  // testing on the learner's machine
  shadowsHarnessNames: solution(
    '        tests.assign({a, b});\n        return run(accumulate(all(tests), 0LL));',
    '#define int long long\n#define all(x) (x).begin(), (x).end()\n\nstruct Test {};\nstruct Parser {};\nint run(int x) { return x; }\nvector<int> tests;\n\n',
  ).concat('\nint main() {\n    Solution s;\n    cout << s.addNumbers(1, 2) << endl;\n}\n'),
  // A recursion g++ can't turn into a loop: 200,000 frames
  deepRecursion:
    'class Solution {\n    int depth(vector<int>& below, int node) {\n        if (node == (int) below.size()) return 0;\n        int rest = depth(below, node + 1);\n        below[node] = rest;\n        return rest + 1;\n    }\n\npublic:\n    int addNumbers(int a, int b) {\n        vector<int> below(200000);\n        return depth(below, 0) - 200000 + a + b;\n    }\n};\n',
  missingClosingBrace:
    'class Solution {\npublic:\n    int addNumbers(int a, int b) {\n        return a + b;\n    }\n',
  wrongSignature: solution('        return 0;').replace('int a, int b', 'string a, string b'),
  // isBelow is a free function defined before the learner's code, so a stub
  // of it wouldn't compile (and is explained as provided by the runner)
  stubsInjected:
    'class Solution {\npublic:\n    int countBelow(int n) {\n        int count = 0;\n        for (int i = 0; i < n; i++) if (isBelow(i)) count++;\n        return count;\n    }\n};\n',
};

export default controls;
