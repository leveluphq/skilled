/**
 * The C++ runtime's pure parts: normalizing, assembling, placing compiler
 * errors and starting code. Running the programs is the conformance suite's
 * job (test/conformance, in Docker).
 */
import { cppRuntime, cppStarter } from 'services/server/runner/runtimes/cpp';
import { CodingLanguage } from 'utils/constants/lesson';
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
    body: { [CodingLanguage.Javascript]: 'return version >= badVersion;' },
  },
  returns: 'int',
  tests: [{ description: 'first', args: [3], hidden: [1], expected: 1 }],
});

const stackSpec = defineSpec({
  kind: 'design',
  className: 'MinStack',
  ctor: [],
  methods: [
    { name: 'push', params: [{ name: 'item', type: 'int' }], returns: 'void' },
    { name: 'getMin', params: [], returns: 'int' },
  ],
  tests: [{ description: 'one', ops: [['push', 1], ['getMin']], expected: [null, 1] }],
});

const correct =
  'class Solution {\npublic:\n    int addNumbers(int a, int b) {\n        return a + b;\n    }\n};\n';

// The compiler's line for the learner's line N
const fileLine = (source: string, lineOffset: number, line: number) =>
  source.split('\n')[lineOffset + line - 1];

describe('C++ runtime', () => {
  describe('normalize', () => {
    it('strips a byte-order mark and CRLF endings, and adds a final newline', () => {
      const { code, errors } = cppRuntime.normalize(
        '﻿class Solution {\r\npublic:\r\n    int x() { return 1; }\r\n};',
      );

      expect(errors).toEqual([]);
      expect(code).toBe('class Solution {\npublic:\n    int x() { return 1; }\n};\n');
    });
  });

  describe('assemble', () => {
    it("puts the learner's code after #line 1, so their line N is solution.cpp:N", () => {
      const { source, userLines, lineOffset } = cppRuntime.assemble(correct, addSpec);
      const lines = source.split('\n');

      expect(userLines).toBe(6);
      expect(lines[lineOffset - 1]).toBe('#line 1 "solution.cpp"');
      expect(fileLine(source, lineOffset, 4)).toBe('        return a + b;');
    });

    it('numbers the driver by its own line in main.cpp', () => {
      const { source } = cppRuntime.assemble(correct, addSpec);
      const lines = source.split('\n');
      const directive = lines.findIndex((line) => line.endsWith('"main.cpp"'));

      expect(lines[directive]).toBe(`#line ${directive + 2} "main.cpp"`);
      // An empty line first, for a final backslash's line splice
      expect(lines[directive - 2]).toBe('');
    });

    it('adds a runner type only for lessons that use it', () => {
      expect(cppRuntime.assemble(correct, addSpec).source).not.toContain('struct ListNode {');
      expect(cppRuntime.assemble(correct, listSpec).source).toContain('struct ListNode {');
    });

    it("defines the tests' helper before the learner's code, reading the hidden values", () => {
      const { source, lineOffset } = cppRuntime.assemble(correct, injectedSpec);
      const before = source.split('\n').slice(0, lineOffset).join('\n');

      expect(before).toContain(
        'bool isBadVersion(int version) {\n    using namespace __skh_hidden;\n    return version >= badVersion;\n}',
      );
      expect(source).toContain('__skh_hidden::badVersion = __skh::from<int>(__hidden[0]);');
    });

    it('calls each method of a design lesson by name', () => {
      const { source } = cppRuntime.assemble(
        'class MinStack {\npublic:\n    void push(int item) {}\n    int getMin() { return 0; }\n};\n',
        stackSpec,
      );

      expect(source).toContain('std::unique_ptr<MinStack> __o(new MinStack());');
      expect(source).toContain('if (__name == "push") {');
      expect(source).toContain(
        '__o->push(__skh::from<int>(__op[1]));\n            __out += "null";',
      );
      expect(source).toContain('} else if (__name == "getMin") {');
    });
  });

  describe('diagnostics', () => {
    const assembled = cppRuntime.assemble(correct, addSpec);

    it("places errors in the learner's code", () => {
      const output =
        "solution.cpp: In member function 'int Solution::addNumbers(int, int)':\nsolution.cpp:4:20: error: expected ';' before '}' token\n";

      expect(cppRuntime.diagnostics(output, assembled, addSpec)).toEqual([
        { line: 4, column: 20, message: "expected ';' before '}' token" },
      ]);
    });

    it('counts columns in characters, where g++ counts bytes', () => {
      const code = correct.replace('return a + b;', 'string s = "é"; return s;');
      const output = `solution.cpp:4:33: error: cannot convert 'std::string' to 'int' in return\n`;

      expect(
        cppRuntime.diagnostics(output, cppRuntime.assemble(code, addSpec), addSpec)[0].column,
      ).toBe(32);
    });

    it("places an error in a library template on the learner's line that used it, once", () => {
      const error = [
        "/usr/local/include/c++/16.2.0/bits/stl_algo.h: In instantiation of 'void std::__insertion_sort()':",
        "/usr/local/include/c++/16.2.0/bits/stl_algo.h:1821:25:   required from 'void std::__final_insertion_sort()'",
        'solution.cpp:4:13:   required from here',
        "/usr/local/include/c++/16.2.0/bits/stl_algo.h:1781:14: error: no match for call to '(lambda) (int&, int&)'",
        'solution.cpp:4:35: note: there are 2 candidates',
      ];
      const output = [...error, ...error].join('\n');

      expect(cppRuntime.diagnostics(output, assembled, addSpec)).toEqual([
        { line: 4, column: 13, message: "no match for call to '(lambda) (int&, int&)'" },
      ]);
    });

    it('points at the brace that is never closed', () => {
      const missing = cppRuntime.assemble(
        'class Solution {\npublic:\n    int addNumbers(int a, int b) {\n        return a + b;\n    }\n',
        addSpec,
      );
      const output =
        "main.cpp:1062:50: error: expected '}' at end of input\nsolution.cpp:1:16: note: to match this '{'\n";

      expect(cppRuntime.diagnostics(output, missing, addSpec)).toEqual([
        {
          line: 1,
          column: null,
          message: 'A `}` is missing: the `{` on this line is never closed',
        },
      ]);
    });

    it('reads digit separators and raw strings as C++ does', () => {
      const missing = cppRuntime.assemble(
        'class Solution {\npublic:\n    int addNumbers(int a, int b) {\n        string s = R"({")";\n        return a + b + 1\'000 - 1\'000;\n    }\n',
        addSpec,
      );
      const output = "main.cpp:1062:50: error: expected '}' at end of input\n";

      expect(cppRuntime.diagnostics(output, missing, addSpec)[0]).toEqual({
        line: 1,
        column: null,
        message: 'A `}` is missing: the `{` on this line is never closed',
      });
    });

    it('explains redefining a type the runner provides', () => {
      const own = cppRuntime.assemble(
        'class ListNode { int val; };\nclass Solution {};\n',
        listSpec,
      );
      const output =
        "solution.cpp:1:7: error: redefinition of 'struct ListNode'\nmain.cpp:1039:8: note: previous definition of 'struct ListNode'\n";

      expect(cppRuntime.diagnostics(output, own, listSpec)).toEqual([
        {
          line: 1,
          column: 7,
          message: '`ListNode` is provided by the test runner, so remove your own `class ListNode`',
        },
      ]);
    });

    it("explains redefining the tests' helper", () => {
      const own = cppRuntime.assemble(
        'bool isBadVersion(int version) { return false; }\nclass Solution {};\n',
        injectedSpec,
      );
      const output = "solution.cpp:1:6: error: redefinition of 'bool isBadVersion(int)'\n";

      expect(cppRuntime.diagnostics(output, own, injectedSpec)[0].message).toBe(
        '`isBadVersion` is provided by the test runner, so remove your own `isBadVersion`',
      );
    });

    it('asks for the class the tests use', () => {
      const output =
        "main.cpp: In function 'std::string __skh_test(const __skh::JVal&)':\nmain.cpp:1052:21: error: 'Solution' was not declared in this scope\n";

      expect(cppRuntime.diagnostics(output, assembled, addSpec)[0].message).toBe(
        'Your code needs a `class Solution`, as in the starting code',
      );
    });

    it('asks for a public method', () => {
      const output =
        "main.cpp:1056:33: error: 'int Solution::addNumbers(int, int)' is private within this context\nsolution.cpp:2:9: note: declared private here\n";

      expect(cppRuntime.diagnostics(output, assembled, addSpec)[0].message).toBe(
        'Make `addNumbers` public: put it after `public:`, as in the starting code',
      );
    });

    it("explains a method the tests can't call", () => {
      const output =
        "main.cpp:1055:34: error: cannot convert 'int' to 'std::string' {aka 'std::__cxx11::basic_string<char>'}\n";

      expect(cppRuntime.diagnostics(output, assembled, addSpec)).toEqual([
        {
          line: null,
          column: null,
          message:
            "Your code doesn't match what the tests call. They expect:\nclass Solution {\npublic:\n    int addNumbers(int a, int b)\n};",
        },
      ]);
    });

    it('passes on output it cannot place', () => {
      expect(
        cppRuntime.diagnostics('g++: fatal error: Killed signal\n', assembled, addSpec),
      ).toEqual([{ line: null, column: null, message: 'g++: fatal error: Killed signal' }]);
    });
  });

  describe('starting code', () => {
    it('declares the method the tests call, returning a placeholder', () => {
      expect(cppStarter(addSpec)).toBe(
        'class Solution {\npublic:\n    int addNumbers(int a, int b) {\n        // Your solution here\n        return 0;\n    }\n};\n',
      );
    });

    it('takes containers by reference and returns null for a list', () => {
      expect(
        cppStarter(
          defineSpec({
            kind: 'function',
            entry: 'pilotRocket',
            params: [{ name: 'satellites', type: 'map<string,string[]>' }],
            returns: 'string[]?',
            tests: [{ description: 'one', args: [{}], expected: null }],
          }),
        ),
      ).toContain(
        'optional<vector<string>> pilotRocket(unordered_map<string, vector<string>>& satellites) {\n        // Your solution here\n        return nullopt;',
      );
      expect(cppStarter(listSpec)).toContain('ListNode* reverseLinkedList(ListNode* head) {');
    });

    it('describes the runner types a lesson uses', () => {
      expect(cppStarter(listSpec)).toMatch(/^\/\*\*\n \* The test runner provides ListNode:/);
    });

    it("describes the tests' helper", () => {
      expect(cppStarter(injectedSpec)).toMatch(
        /^\/\/ The test runner provides isBadVersion:\n\/\/ bool isBadVersion\(int version\);\n\nclass Solution \{/,
      );
    });

    it('declares a design lesson’s class, with no return for a void method', () => {
      expect(cppStarter(stackSpec)).toBe(
        'class MinStack {\npublic:\n    MinStack() {\n        // Set up your class here\n    }\n\n    void push(int item) {\n        // Your solution here\n    }\n\n    int getMin() {\n        // Your solution here\n        return 0;\n    }\n};\n',
      );
    });
  });
});
