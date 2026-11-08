/**
 * The Kotlin runtime's pure parts: normalizing, assembling, placing compiler
 * errors and starting code. Running the programs is the conformance suite's
 * job (test/conformance, in Docker).
 */
import { kotlinRuntime, kotlinStarter, kotlinType } from 'services/server/runner/runtimes/kotlin';
import { CodingLanguage } from 'utils/constants/lesson';
import { defineSpec, parseType } from 'utils/shared/runner/spec';

const addSpec = defineSpec({
  kind: 'function',
  entry: 'addNumbers',
  params: [
    { name: 'a', type: 'int' },
    { name: 'b', type: 'int' },
  ],
  returns: 'int',
  tests: [{ description: 'adds', args: [1, 2], expected: 3 }],
});

const listSpec = defineSpec({
  kind: 'function',
  entry: 'reverseLinkedList',
  params: [{ name: 'head', type: 'ListNode?' }],
  returns: 'ListNode?',
  tests: [{ description: 'one', args: [[1]], expected: [1] }],
});

const injectedSpec = defineSpec({
  kind: 'function',
  entry: 'firstBadVersion',
  params: [{ name: 'n', type: 'int' }],
  hidden: [{ name: 'badVersion', type: 'int' }],
  injected: {
    name: 'isBadVersion',
    baseClass: 'VersionControl',
    params: [{ name: 'version', type: 'int' }],
    returns: 'bool',
    body: { [CodingLanguage.Javascript]: 'return version >= badVersion;' },
  },
  returns: 'int',
  tests: [{ description: 'one', args: [1], hidden: [1], expected: 1 }],
});

const designSpec = defineSpec({
  kind: 'design',
  className: 'Cache',
  ctor: [{ name: 'capacity', type: 'int' }],
  methods: [
    { name: 'put', params: [{ name: 'key', type: 'string' }], returns: 'void' },
    { name: 'size', params: [], returns: 'int' },
  ],
  tests: [{ description: 'one', ctorArgs: [1], ops: [['size']], expected: [0] }],
});

const correct =
  'class Solution {\n    fun addNumbers(a: Int, b: Int): Int {\n        return a + b\n    }\n}\n';

describe('Kotlin runtime', () => {
  describe('types', () => {
    it.each([
      ['int', 'Int'],
      ['long[]', 'LongArray'],
      ['char[][]', 'Array<CharArray>'],
      ['string[]', 'Array<String>'],
      ['string[]?', 'Array<String>?'],
      ['map<string,string[]>', 'Map<String, Array<String>>'],
      ['ListNode', 'ListNode?'],
      ['BinaryNode?', 'BinaryNode?'],
      ['BinaryNodeRef', 'BinaryNode?'],
      ['Interval[]', 'Array<Interval>'],
    ])('%s is %s', (neutral, kotlin) => {
      expect(kotlinType(parseType(neutral))).toBe(kotlin);
    });

    it('spells out the kotlin package for the harness', () => {
      expect(kotlinType(parseType('map<string,int[]>'), true)).toBe(
        'kotlin.collections.Map<kotlin.String, kotlin.IntArray>',
      );
    });
  });

  describe('normalize', () => {
    it('blanks package lines and @file:JvmName without moving anything', () => {
      const { code, errors } = kotlinRuntime.normalize(
        '@file:JvmName("Islands")\r\npackage com.example\r\n\r\nclass Solution {\r\n    fun x() = 1\r\n}',
      );

      expect(errors).toEqual([]);
      expect(code.split('\n')).toEqual([
        '                        ',
        '                   ',
        '',
        'class Solution {',
        '    fun x() = 1',
        '}',
        '',
      ]);
    });

    it("renames a top-level `fun main`, but not a method's", () => {
      const { code } = kotlinRuntime.normalize(
        'class A { fun main() = 1 }\nfun main(args: Array<String>) {\n    println("fun main()")\n}\n',
      );

      expect(code).toBe(
        'class A { fun main() = 1 }\nfun __userMain(args: Array<String>) {\n    println("fun main()")\n}\n',
      );
    });

    it('leaves `package` inside strings and comments alone', () => {
      const source = '// package x\nclass Solution { val s = "package y" }\n';

      expect(kotlinRuntime.normalize(source).code).toBe(source);
    });
  });

  describe('assemble', () => {
    it("keeps the learner's line N at line N", () => {
      const { source, userLines, lineOffset } = kotlinRuntime.assemble(correct, addSpec);
      const lines = source.split('\n');

      expect(userLines).toBe(5);
      expect(lineOffset).toBe(0);
      expect(lines[0]).toBe('class Solution {');
      expect(lines[2]).toBe('        return a + b');
      expect(source).toContain('fun main(__argv: kotlin.Array<kotlin.String>) {');
    });

    it('adds a runner type only for lessons that use it', () => {
      expect(kotlinRuntime.assemble(correct, addSpec).source).not.toContain('class ListNode');
      expect(kotlinRuntime.assemble(correct, listSpec).source).toContain('class ListNode');
    });

    it("defines the injected helper in a base class the learner can't override", () => {
      const { source } = kotlinRuntime.assemble(
        'class Solution : VersionControl()\n',
        injectedSpec,
      );

      expect(source).toContain('open class VersionControl {');
      expect(source).toContain('    fun isBadVersion(version: kotlin.Int): kotlin.Boolean {');
      expect(source).toContain('        var badVersion: kotlin.Int = 0');
      expect(source).toContain('    VersionControl.badVersion = __H.toInt(__hidden[0])');
    });

    it('calls a design class one operation at a time', () => {
      const { source } = kotlinRuntime.assemble('class Cache(capacity: Int)\n', designSpec);

      expect(source).toContain('    val __o = Cache(__c0)');
      expect(source).toContain('            "put" -> {');
      expect(source).toContain('                __o.put(__H.toStr(__op[1]))');
    });
  });

  describe('diagnostics', () => {
    const assembled = kotlinRuntime.assemble(correct, addSpec);

    it("places errors in the learner's code", () => {
      const output =
        "Main.kt:3:20: error: unresolved reference 'c'.\n        return a + c\n                   ^\n";

      expect(kotlinRuntime.diagnostics(output, assembled, addSpec)).toEqual([
        { line: 3, column: 20, message: "unresolved reference 'c'." },
      ]);
    });

    it('keeps one of the errors kotlinc gives for each token on a line', () => {
      const output = [1, 8, 9]
        .map(
          (column) =>
            `Main.kt:2:${column}: error: syntax error: Expecting a top level declaration.\nprintln("hi")\n${' '.repeat(column - 1)}^`,
        )
        .join('\n');

      expect(kotlinRuntime.diagnostics(output, assembled, addSpec)).toEqual([
        { line: 2, column: 1, message: 'syntax error: Expecting a top level declaration.' },
      ]);
    });

    it("measures columns on a renamed `fun main`'s line as the learner wrote it", () => {
      const code = kotlinRuntime.normalize('fun main() { val x: Int = "s" }\n').code;
      const renamed = kotlinRuntime.assemble(code, addSpec);
      const output = `Main.kt:1:31: error: initializer type mismatch: expected 'Int', actual 'String'.\n${code}${' '.repeat(30)}^\n`;

      expect(kotlinRuntime.diagnostics(output, renamed, addSpec)[0]).toMatchObject({
        line: 1,
        column: 25,
      });
    });

    it("explains a method the tests can't call", () => {
      const output =
        "Main.kt:900:38: error: argument type mismatch: actual type is 'Int', but 'String' was expected.\n    val __r: Any? = __s.addNumbers(__a0, __a1)\n                                     ^^^^\n";

      expect(kotlinRuntime.diagnostics(output, assembled, addSpec)).toEqual([
        {
          line: null,
          column: null,
          message:
            "Your code doesn't match what the tests call. They expect:\nclass Solution {\n    fun addNumbers(a: Int, b: Int): Int\n}",
        },
      ]);
    });

    it('points at the brace that is never closed', () => {
      const missing = kotlinRuntime.assemble(
        'class Solution {\n    fun addNumbers(a: Int, b: Int): Int {\n        return a + b\n    }\n',
        addSpec,
      );
      const output = "Main.kt:900:2: error: syntax error: Missing '}.\n}\n ^\n";

      expect(kotlinRuntime.diagnostics(output, missing, addSpec)).toEqual([
        {
          line: 1,
          column: null,
          message: 'A `}` is missing: the `{` on this line is never closed',
        },
      ]);
    });

    it("blames a comment that's never closed, not the brace it swallowed", () => {
      const unclosed = kotlinRuntime.assemble('class Solution {\n    /* note\n}\n', addSpec);
      const output =
        "Main.kt:1:17: error: syntax error: Missing '}.\nclass Solution {\n                ^\nMain.kt:900:1: error: syntax error: Unclosed comment.\n\n^\n";

      expect(kotlinRuntime.diagnostics(output, unclosed, addSpec)).toEqual([
        { line: 2, column: null, message: 'This comment is never closed' },
      ]);
    });

    it('explains redefining a type the runner provides', () => {
      const own = kotlinRuntime.assemble(
        'class ListNode(var data: Int)\nclass Solution\n',
        listSpec,
      );
      const output =
        'Main.kt:1:7: error: redeclaration:\nclass ListNode : __H.Json\nclass ListNode(var data: Int)\n      ^^^^^^^^\nMain.kt:900:7: error: redeclaration:\nclass ListNode : Any\nclass ListNode(var data: Int = 0, var next: ListNode? = null) : __H.Json {\n      ^^^^^^^^\n';

      expect(kotlinRuntime.diagnostics(output, own, listSpec)).toEqual([
        {
          line: 1,
          column: 7,
          message: '`ListNode` is provided by the test runner, so remove your own `class ListNode`',
        },
      ]);
    });

    it('asks for the class the tests use', () => {
      const output =
        "Main.kt:900:15: error: unresolved reference 'Solution'.\n    val __s = Solution()\n              ^^^^^^^^\n";

      expect(kotlinRuntime.diagnostics(output, assembled, addSpec)[0].message).toBe(
        'Your code needs a `class Solution`, as in the starting code',
      );
    });

    it('explains a missing method as not matching, not as a missing class', () => {
      const output =
        "Main.kt:900:25: error: unresolved reference 'addNumbers' on receiver of type 'Solution'.\n    val __r: Any? = __s.addNumbers(__a0, __a1)\n                        ^^^^^^^^^^\n";

      expect(kotlinRuntime.diagnostics(output, assembled, addSpec)[0].message).toMatch(
        /^Your code doesn't match what the tests call/,
      );
    });

    it("shows output it can't place as it is", () => {
      expect(
        kotlinRuntime.diagnostics('exception: java.lang.OutOfMemoryError\n', assembled, addSpec),
      ).toEqual([{ line: null, column: null, message: 'exception: java.lang.OutOfMemoryError' }]);
    });
  });

  describe('starting code', () => {
    it('declares the method the tests call, returning a placeholder', () => {
      expect(kotlinStarter(addSpec)).toBe(
        'class Solution {\n    fun addNumbers(a: Int, b: Int): Int {\n        // Your solution here\n        return 0\n    }\n}\n',
      );
    });

    it('describes the runner types a lesson uses', () => {
      expect(kotlinStarter(listSpec)).toMatch(
        /^\/\*\*\n \* The test runner provides ListNode:\n \* class ListNode\(var data: Int = 0, var next: ListNode\? = null\)/,
      );
    });

    it('extends the class that provides a helper', () => {
      expect(kotlinStarter(injectedSpec)).toBe(
        '// isBadVersion(version) is provided by VersionControl\nclass Solution : VersionControl() {\n    fun firstBadVersion(n: Int): Int {\n        // Your solution here\n        return 0\n    }\n}\n',
      );
    });

    it('declares a design class with its constructor parameters', () => {
      expect(kotlinStarter(designSpec)).toBe(
        'class Cache(capacity: Int) {\n    // Set up your class here\n\n    fun put(key: String) {\n        // Your solution here\n    }\n\n    fun size(): Int {\n        // Your solution here\n        return 0\n    }\n}\n',
      );
    });
  });
});
