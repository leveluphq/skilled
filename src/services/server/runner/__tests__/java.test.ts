/**
 * The Java runtime's pure parts: normalizing, assembling, placing compiler
 * errors and starting code. Running the programs is the conformance suite's
 * job (test/conformance, in Docker).
 */
import { javaRuntime, javaStarter } from 'services/server/runner/runtimes/java';
import { defineSpec } from 'utils/shared/runner/spec';

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

const correct =
  'class Solution {\n    public int addNumbers(int a, int b) {\n        return a + b;\n    }\n}\n';

describe('Java runtime', () => {
  describe('normalize', () => {
    it('blanks package lines and top-level public modifiers without moving anything', () => {
      const { code, errors } = javaRuntime.normalize(
        'package com.example;\r\npublic class Solution {\r\n    public int x() { return 1; }\r\n}',
      );

      expect(errors).toEqual([]);
      expect(code.split('\n')).toEqual([
        '                    ',
        '       class Solution {',
        '    public int x() { return 1; }',
        '}',
        '',
      ]);
    });

    it('leaves `public` inside strings and comments alone', () => {
      const { code } = javaRuntime.normalize(
        '// public class\nclass Solution { String s = "public"; }\n',
      );

      expect(code).toBe('// public class\nclass Solution { String s = "public"; }\n');
    });
  });

  describe('assemble', () => {
    it("keeps the learner's line N at line N", () => {
      const { source, userLines } = javaRuntime.assemble(correct, addSpec);
      const lines = source.split('\n');

      expect(userLines).toBe(5);
      expect(lines[0]).toMatch(/^import java\.util\.\*;.*class Solution \{$/);
      expect(lines[2]).toBe('        return a + b;');
    });

    it('adds a runner type only for lessons that use it', () => {
      expect(javaRuntime.assemble(correct, addSpec).source).not.toContain('class ListNode');
      expect(javaRuntime.assemble(correct, listSpec).source).toContain('class ListNode');
    });
  });

  describe('diagnostics', () => {
    const assembled = javaRuntime.assemble(correct, addSpec);

    it("places errors in the learner's code", () => {
      const output =
        "Main.java:3: error: ';' expected\n        return a + b\n                    ^\n1 error\n";

      expect(javaRuntime.diagnostics(output, assembled, addSpec)).toEqual([
        { line: 3, column: 21, message: "';' expected" },
      ]);
    });

    it('measures columns on line 1 from the start of the learner’s code', () => {
      const prefix = assembled.source.split('\n')[0].indexOf('class');
      const output = `Main.java:1: error: '{' expected\n${' '.repeat(prefix)}class Solution\n${' '.repeat(prefix + 6)}^\n`;

      expect(javaRuntime.diagnostics(output, assembled, addSpec)[0]).toMatchObject({
        line: 1,
        column: 7,
      });
    });

    it('adds what a missing symbol is', () => {
      const output =
        'Main.java:3: error: cannot find symbol\n        return c;\n               ^\n  symbol:   variable c\n  location: class Solution\n';

      expect(javaRuntime.diagnostics(output, assembled, addSpec)[0].message).toBe(
        'cannot find symbol: variable c',
      );
    });

    it("explains a method the tests can't call", () => {
      const output =
        'Main.java:900: error: method addNumbers in class Solution cannot be applied to given types;\n';

      expect(javaRuntime.diagnostics(output, assembled, addSpec)).toEqual([
        {
          line: null,
          column: null,
          message:
            "Your code doesn't match what the tests call. They expect:\nclass Solution {\n    public int addNumbers(int a, int b)\n}",
        },
      ]);
    });

    it('points at the brace that is never closed', () => {
      const missing = javaRuntime.assemble(
        'class Solution {\n    public int addNumbers(int a, int b) {\n        return a + b;\n    }\n',
        addSpec,
      );
      const output = 'Main.java:900: error: reached end of file while parsing\n';

      expect(javaRuntime.diagnostics(output, missing, addSpec)).toEqual([
        {
          line: 1,
          column: null,
          message: 'A `}` is missing: the `{` on this line is never closed',
        },
      ]);
    });

    it('explains redefining a type the runner provides', () => {
      const own = javaRuntime.assemble(
        'class ListNode { int val; }\nclass Solution {}\n',
        listSpec,
      );
      const output = 'Main.java:200: error: duplicate class: ListNode\n';

      expect(javaRuntime.diagnostics(output, own, listSpec)[0].message).toBe(
        '`ListNode` is provided by the test runner, so remove your own `class ListNode`',
      );
    });

    it('asks for the class the tests use', () => {
      const output =
        'Main.java:900: error: cannot find symbol\n  symbol:   class Solution\n  location: class Main\n';

      expect(javaRuntime.diagnostics(output, assembled, addSpec)[0].message).toBe(
        'Your code needs a `class Solution`, as in the starting code',
      );
    });
  });

  describe('starting code', () => {
    it('declares the method the tests call, returning a placeholder', () => {
      expect(javaStarter(addSpec)).toBe(
        'class Solution {\n    public int addNumbers(int a, int b) {\n        // Your solution here\n        return 0;\n    }\n}\n',
      );
    });

    it('describes the runner types a lesson uses', () => {
      expect(javaStarter(listSpec)).toMatch(/^\/\*\*\n \* The test runner provides ListNode:/);
    });
  });
});
