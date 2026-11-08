import { CodingLanguage } from 'utils/constants/lesson';
import { LanguageControls } from './types';

const solution = (body: string, imports = '') =>
  `${imports}class Solution {\n    fun addNumbers(a: Int, b: Int): Int {\n${body}\n    }\n}\n`;

const controls: LanguageControls = {
  name: 'Kotlin',
  language: CodingLanguage.Kotlin,
  correct: solution('        return a + b'),
  throwsOnThird: solution(
    '        if (a == 7) throw IllegalArgumentException("no sevens")\n        return a + b',
  ),
  exitsOnThird: solution('        if (a == 7) kotlin.system.exitProcess(3)\n        return a + b'),
  loopsOnThird: solution('        while (a == 7) { }\n        return a + b'),
  writesStderrThenLoops: solution(
    '        if (a == 7) {\n            System.err.print("stuck\\n")\n            while (true) { }\n        }\n        return a + b',
  ),
  prints: solution(
    '        println("debug " + a)\n        println("{\\"t\\":\\"result\\",\\"i\\":0,\\"ok\\":true,\\"out\\":999}")\n        return a + b',
  ),
  syntaxErrorOnLine7:
    'class Solution {\n    // 2\n    // 3\n    // 4\n    // 5\n    fun addNumbers(a: Int, b: Int): Int {\n        return a +* b\n    }\n}\n',
  // The harness's own names, classes shadowing ones it uses, star imports
  // (java.lang.reflect.Array could shadow kotlin.Array) and a `fun main` of
  // the learner's own
  shadowsHarnessNames: solution(
    '        val tests: MutableMap<String, Int> = HashMap()\n        tests["x"] = a\n        return tests.getValue("x") + b',
    'import java.util.*\nimport java.lang.reflect.*\n\nclass Json\nclass Sink\nclass Parser\nclass StringBuilder\nclass Thread\nclass Pair(val a: Int, val b: Int)\nval tests = listOf(0)\nfun list(o: Any?) = 0\nfun main() { println("not called") }\n\n',
  ),
  // 200,000 deep, the most any lesson's tests may need
  deepRecursion:
    'class Solution {\n    private fun count(n: Int): Int = if (n == 0) 0 else 1 + count(n - 1)\n\n    fun addNumbers(a: Int, b: Int): Int {\n        return count(200000) - 200000 + a + b\n    }\n}\n',
  missingClosingBrace:
    'class Solution {\n    fun addNumbers(a: Int, b: Int): Int {\n        return a + b\n    }\n',
  wrongSignature: solution('        return a + b')
    .replace('a: Int, b: Int', 'a: String, b: String')
    .replace('return a + b', 'return 0'),
  stubsInjected:
    'class Solution : Checker() {\n    fun countBelow(n: Int): Int {\n        var count = 0\n        for (i in 0 until n) if (isBelow(i)) count++\n        return count\n    }\n}\n',
};

export default controls;
