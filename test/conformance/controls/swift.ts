import { CodingLanguage } from 'utils/constants/lesson';
import { LanguageControls } from './types';

const solution = (body: string, before = '') =>
  `${before}class Solution {\n    func addNumbers(_ a: Int, _ b: Int) -> Int {\n${body}\n    }\n}\n`;

const controls: LanguageControls = {
  name: 'Swift',
  language: CodingLanguage.Swift,
  correct: solution('        return a + b'),
  // A trap, which Swift can't catch: only this test may fail
  throwsOnThird: solution('        precondition(a != 7, "no sevens")\n        return a + b'),
  exitsOnThird: solution('        if a == 7 { exit(3) }\n        return a + b'),
  loopsOnThird: solution('        while a == 7 {}\n        return a + b'),
  writesStderrThenLoops: solution(
    '        if a == 7 {\n            fputs("stuck\\n", stderr)\n            while true {}\n        }\n        return a + b',
  ),
  prints: solution(
    '        print("debug \\(a)")\n        print("{\\"t\\":\\"result\\",\\"i\\":0,\\"ok\\":true,\\"out\\":999}")\n        return a + b',
  ),
  syntaxErrorOnLine7:
    'class Solution {\n    // 2\n    // 3\n    // 4\n    // 5\n    func addNumbers(_ a: Int, _ b: Int) -> Int {\n        return a +* b\n    }\n}\n',
  // Names the harness uses, or libc and the standard library have, declared
  // at the top level where they shadow what was imported
  shadowsHarnessNames: solution(
    '        var tests: [String: Int] = [:]\n        tests["x"] = a\n        return max(tests["x"]!, Int.min) + b',
    'import Foundation\n\nstruct Error {}\nstruct Set {}\nclass Test {}\nenum Json {}\nvar errno = 0\nfunc write(_ x: Int) -> Int { return x }\nfunc fork() -> Int { return -1 }\nfunc max(_ a: Int, _ b: Int) -> Int { return a > b ? a : b }\nfunc min(_ s: String) -> String { return s }\nfunc abs(_ s: String) -> String { return s }\n\n',
  ),
  deepRecursion:
    'class Solution {\n    private func count(_ n: Int) -> Int { return n == 0 ? 0 : 1 + count(n - 1) }\n\n    func addNumbers(_ a: Int, _ b: Int) -> Int {\n        return count(200000) - 200000 + a + b\n    }\n}\n',
  missingClosingBrace:
    'class Solution {\n    func addNumbers(_ a: Int, _ b: Int) -> Int {\n        return a + b\n    }\n',
  wrongSignature: solution('        return 0').replace(
    '_ a: Int, _ b: Int',
    '_ a: String, _ b: String',
  ),
  stubsInjected:
    'class Solution: Checker {\n    func countBelow(_ n: Int) -> Int {\n        var count = 0\n        for i in 0..<n where isBelow(i) { count += 1 }\n        return count\n    }\n}\n',
};

export default controls;
