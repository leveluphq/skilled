/**
 * The Swift runtime's pure parts: normalizing, assembling, placing compiler
 * errors and starting code. Running the programs is the conformance suite's
 * job (test/conformance, in Docker).
 */
import { swiftRuntime, swiftStarter } from 'services/server/runner/runtimes/swift';
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
    body: { JAVASCRIPT: 'return version >= badVersion;' },
  },
  returns: 'int',
  tests: [{ description: 'one', args: [1], hidden: [1], expected: 1 }],
});

const stackSpec = defineSpec({
  kind: 'design',
  className: 'MinStack',
  ctor: [],
  methods: [
    { name: 'push', params: [{ name: 'item', type: 'int' }], returns: 'void' },
    { name: 'pop', params: [], returns: 'int' },
  ],
  tests: [{ description: 'push', ops: [['push', 1], ['pop']], expected: [null, 1] }],
});

const correct =
  'class Solution {\n    func addNumbers(_ a: Int, _ b: Int) -> Int {\n        return a + b\n    }\n}\n';

// The learner's part of an assembled program
const userPart = (source: string) => {
  const lines = source.split('\n');
  const start = lines.indexOf('#sourceLocation(file: "Main.swift", line: 1)');
  return { lines, start };
};

describe('Swift runtime', () => {
  describe('normalize', () => {
    it('blanks what the combined file can’t have, without moving anything', () => {
      const { code, errors } = swiftRuntime.normalize(
        '#!/usr/bin/swift\r\nimport Darwin\r\n#sourceLocation(file: "x.swift", line: 9)\r\n@main struct App {}\r\nclass Solution {}',
      );

      expect(errors).toEqual([]);
      expect(code.split('\n')).toEqual([
        '                ',
        'import Glibc ',
        '                                         ',
        '      struct App {}',
        'class Solution {}',
        '',
      ]);
    });

    it('leaves the same words inside strings and comments alone', () => {
      const source =
        '// import Darwin and @main\nlet s = "#sourceLocation(file: \\"a\\", line: 1)"\n/* @main /* nested */ */\n';

      expect(swiftRuntime.normalize(source).code).toBe(source);
    });
  });

  describe('assemble', () => {
    it('puts the harness first and numbers the learner’s lines from 1', () => {
      const { source, userLines, lineOffset } = swiftRuntime.assemble(correct, addSpec);
      const { lines, start } = userPart(source);

      expect(userLines).toBe(5);
      expect(lineOffset).toBe(0);
      expect(lines[0]).toBe('#sourceLocation(file: "harness.swift", line: 1)');
      expect(start).toBeGreaterThan(100);
      expect(lines.slice(start + 1, start + 6).join('\n')).toBe(correct.trimEnd());
      expect(lines.indexOf('#sourceLocation(file: "driver.swift", line: 1)')).toBeGreaterThan(
        start + 5,
      );
    });

    it('calls the method as a function value, so its labels don’t matter', () => {
      const { source } = swiftRuntime.assemble(correct, addSpec);

      expect(source).toContain('__H.run(userLines: 5) { __case in');
      expect(source).toContain('    let __a0: Int = try __in(__args[0])');
      expect(source).toContain('    let __r = try __call2(__s.addNumbers, __a0, __a1)');
      expect(source).toContain('    return try __json(__r)');
    });

    it('adds a runner type only for lessons that use it', () => {
      expect(swiftRuntime.assemble(correct, addSpec).source).not.toContain('class ListNode');
      expect(swiftRuntime.assemble(correct, listSpec).source).toContain('class ListNode');
    });

    it('defines the injected base class, with the hidden value read-only', () => {
      const { source } = swiftRuntime.assemble('', injectedSpec);

      expect(source).toContain(
        [
          'class VersionControl {',
          '    static var __badVersion: Int? = nil',
          '    var badVersion: Int { return VersionControl.__badVersion! }',
          '    final func isBadVersion(_ version: Int) -> Bool {',
          '        return version >= badVersion;',
          '    }',
          '}',
        ].join('\n'),
      );
      expect(source).toContain('    VersionControl.__badVersion = __h0');
    });

    it('drives a design class one operation at a time', () => {
      const { source } = swiftRuntime.assemble('', stackSpec);

      expect(source).toContain('    let __o = try __call0(MinStack.init)');
      expect(source).toContain(
        [
          '        case "push":',
          '            try __H.opArity(__op, 1)',
          '            let __p0: Int = try __in(__op.args[0])',
          '            _ = try __call1(__o.push, __p0)',
          '            __out.append(.null)',
          '        case "pop":',
          '            try __H.opArity(__op, 0)',
          '            __out.append(try __json(try __call0(__o.pop)))',
        ].join('\n'),
      );
    });
  });

  describe('diagnostics', () => {
    const assembled = swiftRuntime.assemble(correct, addSpec);

    it("places errors in the learner's code", () => {
      const output =
        "Main.swift:3:18: error: cannot find operator '+*' in scope\n        return a +* b\n                 ^~\n";

      expect(swiftRuntime.diagnostics(output, assembled, addSpec)).toEqual([
        { line: 3, column: 18, message: "cannot find operator '+*' in scope" },
      ]);
    });

    it("explains a method the tests can't call", () => {
      const output =
        "driver.swift:7:19: error: conflicting arguments to generic parameter 'A1' ('String' vs. 'Int')\n";

      expect(swiftRuntime.diagnostics(output, assembled, addSpec)).toEqual([
        {
          line: null,
          column: null,
          message:
            "Your code doesn't match what the tests call. They expect:\nclass Solution {\n    func addNumbers(_ a: Int, _ b: Int) -> Int\n}",
        },
      ]);
    });

    it('points at the brace that is never closed', () => {
      const missing = swiftRuntime.assemble(
        'class Solution {\n    func addNumbers(_ a: Int, _ b: Int) -> Int {\n        return a + b\n    }\n',
        addSpec,
      );
      // The end of the file is reported in the physical file, not Main.swift
      const output =
        "driver.swift:2:1: error: expected 'func' keyword in instance method declaration\nmain.swift:1155:1: error: expected '}' in class\n";

      expect(swiftRuntime.diagnostics(output, missing, addSpec)).toEqual([
        {
          line: 1,
          column: null,
          message: 'A `}` is missing: the `{` on this line is never closed',
        },
      ]);
    });

    it('points at a comment that is never closed', () => {
      const open = swiftRuntime.assemble('class Solution {}\n/* never /* closed */\n', addSpec);
      const output = "main.swift:1200:1: error: unterminated '/*' comment\n";

      expect(swiftRuntime.diagnostics(output, open, addSpec)[0]).toEqual({
        line: 2,
        column: null,
        message: 'This comment is never closed',
      });
    });

    it('explains redefining a type the runner provides, once', () => {
      const own = swiftRuntime.assemble(
        'class ListNode { var val = 0 }\nclass Solution {\n    func reverseLinkedList(_ head: ListNode?) -> ListNode? { head }\n}\n',
        listSpec,
      );
      const output = [
        "Main.swift:1:7: error: invalid redeclaration of 'ListNode'",
        "Main.swift:3:36: error: 'ListNode' is ambiguous for type lookup in this context",
        "Main.swift:3:50: error: 'ListNode' is ambiguous for type lookup in this context",
      ].join('\n');

      expect(swiftRuntime.diagnostics(output, own, listSpec)).toEqual([
        {
          line: 1,
          column: 7,
          message: '`ListNode` is provided by the test runner, so remove your own `class ListNode`',
        },
      ]);
    });

    it('explains redefining the injected base class', () => {
      const own = swiftRuntime.assemble('class VersionControl {}\n', injectedSpec);
      const output = "driver.swift:1:7: error: invalid redeclaration of 'VersionControl'\n";

      expect(swiftRuntime.diagnostics(output, own, injectedSpec)[0].message).toBe(
        '`VersionControl` is provided by the test runner, so remove your own `class VersionControl`',
      );
    });

    it('asks for the class the tests use', () => {
      const output = "driver.swift:6:15: error: cannot find 'Solution' in scope\n";

      expect(swiftRuntime.diagnostics(output, assembled, addSpec)[0].message).toBe(
        'Your code needs a `class Solution`, as in the starting code',
      );
    });

    it("reports a trap in the learner's top-level code without the backtracer's lines", () => {
      const stderr =
        'Swift/ContiguousArrayBuffer.swift:695: Fatal error: Index out of range\n\n*** Signal 5: Backtracing from 0xffffa36db32c... done ***\n\n';

      expect(swiftRuntime.diagnostics(stderr, assembled, addSpec)).toEqual([
        { line: null, column: null, message: 'Fatal error: Index out of range' },
      ]);
    });

    it('places a top-level trap the runtime names a line for', () => {
      const stderr =
        'main/Main.swift:2: Fatal error: Unexpectedly found nil while unwrapping an Optional value\n';

      expect(swiftRuntime.diagnostics(stderr, assembled, addSpec)).toEqual([
        {
          line: 2,
          column: null,
          message: 'Fatal error: Unexpectedly found nil while unwrapping an Optional value',
        },
      ]);
    });

    it('passes on output it can’t place, such as a linker error', () => {
      expect(
        swiftRuntime.diagnostics(
          'error: link command failed with exit code 1\n',
          assembled,
          addSpec,
        ),
      ).toEqual([
        { line: null, column: null, message: 'error: link command failed with exit code 1' },
      ]);
    });
  });

  describe('starting code', () => {
    it('declares the method the tests call, returning a placeholder', () => {
      expect(swiftStarter(addSpec)).toBe(
        'class Solution {\n    func addNumbers(_ a: Int, _ b: Int) -> Int {\n        // Your solution here\n        return 0\n    }\n}\n',
      );
    });

    it('describes the runner types a lesson uses', () => {
      expect(swiftStarter(listSpec)).toMatch(/^\/\*\*\n \* The test runner provides ListNode:/);
      expect(swiftStarter(listSpec)).toContain(
        '    func reverseLinkedList(_ head: ListNode?) -> ListNode? {\n        // Your solution here\n        return nil\n    }',
      );
    });

    it('extends the class that provides a helper', () => {
      expect(swiftStarter(injectedSpec)).toBe(
        '// isBadVersion(version) is provided by VersionControl\nclass Solution: VersionControl {\n    func firstBadVersion(_ n: Int) -> Int {\n        // Your solution here\n        return 0\n    }\n}\n',
      );
    });

    it('declares a design class with its initializer and methods', () => {
      expect(swiftStarter(stackSpec)).toBe(
        'class MinStack {\n    init() {\n        // Set up your class here\n    }\n\n    func push(_ item: Int) {\n        // Your solution here\n    }\n\n    func pop() -> Int {\n        // Your solution here\n        return 0\n    }\n}\n',
      );
    });
  });
});
