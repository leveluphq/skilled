/**
 * The Rust runtime's pure parts: lexing, normalizing, assembling, placing
 * compiler errors and starting code. Running the programs is the conformance
 * suite's job (test/conformance, in Docker).
 */
import {
  lexRust,
  loopedParams,
  rustRuntime,
  rustStarter,
  rustType,
} from 'services/server/runner/runtimes/rust';
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

const loopSpec = defineSpec({
  kind: 'function',
  entry: 'hasLoop',
  params: [{ name: 'head', type: 'ListNode?' }],
  returns: 'bool',
  tests: [
    { description: 'no loop', args: [[1, 2]], expected: false },
    { description: 'loop', args: [{ values: [1, 2], cycleIndex: 0 }], expected: true },
  ],
});

const helperSpec = defineSpec({
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
  ctor: [{ name: 'capacity', type: 'int' }],
  methods: [
    { name: 'push', params: [{ name: 'item', type: 'int' }], returns: 'void' },
    { name: 'getMin', params: [], returns: 'int' },
  ],
  tests: [
    { description: 'one', ctorArgs: [1], ops: [['push', 1], ['getMin']], expected: [null, 1] },
  ],
});

const correct =
  'impl Solution {\n    pub fn add_numbers(a: i32, b: i32) -> i32 {\n        a + b\n    }\n}\n';

describe('Rust runtime', () => {
  describe('types', () => {
    it('maps lists and trees to options, never options of options', () => {
      expect(rustType(parseType('ListNode?'))).toBe('Option<Box<ListNode>>');
      expect(rustType(parseType('BinaryNode'))).toBe('Option<Rc<RefCell<BinaryNode>>>');
      expect(rustType(parseType('map<string,string[]>'))).toBe('HashMap<String, Vec<String>>');
      expect(rustType(parseType('string[]?'))).toBe('Option<Vec<String>>');
    });

    it("spells out std's paths for the driver", () => {
      expect(rustType(parseType('string[]?'), true)).toBe(
        '::std::option::Option<::std::vec::Vec<::std::string::String>>',
      );
    });

    it('lends a list that some test gives a loop', () => {
      expect([...loopedParams(loopSpec)]).toEqual([0]);
      expect([...loopedParams(listSpec)]).toEqual([]);
    });
  });

  describe('lexing', () => {
    it("doesn't count braces in character literals, strings or comments", () => {
      const lexed = lexRust(
        'fn f(c: char) -> bool {\n    // {\n    /* { /* nested } */ { */\n    c == \'{\' || c == \'\\\'\' || "{\n}" == r#""{"#\n}\n',
      );

      expect(lexed.depth).toBe(0);
      expect(lexed.unterminated).toBeNull();
    });

    it('tells lifetimes and labels from character literals', () => {
      const lexed = lexRust("fn f<'a>(s: &'a str) {\n    'outer: loop { break 'outer; }\n}\n");

      expect(lexed.depth).toBe(0);
      expect(lexed.identifiers.map((token) => token.text)).toContain('outer');
    });

    it('finds what is never closed', () => {
      expect(lexRust('fn f() {\n    /* /* */\n}\n').unterminated).toEqual({
        what: 'comment',
        line: 2,
      });
      expect(lexRust('let s = "abc;\n').unterminated).toEqual({ what: 'string', line: 1 });
      expect(lexRust('impl Solution {\n    fn f() {\n    }\n').openLines).toEqual([1]);
    });
  });

  describe('normalize', () => {
    it("renames the learner's own fn main on its line, and only at the crate root", () => {
      const { code, errors } = rustRuntime.normalize(
        'fn main() {\r\n    println!("fn main");\r\n}\r\nimpl Solution {\r\n    fn main() {}\r\n}',
      );

      expect(errors).toEqual([]);
      expect(code.split('\n')).toEqual([
        'fn __user_main() {',
        '    println!("fn main");',
        '}',
        'impl Solution {',
        '    fn main() {}',
        '}',
        '',
      ]);
    });

    it('softens #![forbid(...)], which the harness could not override', () => {
      expect(rustRuntime.normalize('#![forbid(unsafe_code)]\n').code).toBe(
        '#![deny  (unsafe_code)]\n',
      );
    });
  });

  describe('assemble', () => {
    it("keeps the learner's line N at line N", () => {
      const { source, userLines } = rustRuntime.assemble(correct, addSpec);
      const lines = source.split('\n');

      expect(userLines).toBe(5);
      expect(lines[0]).toBe('impl Solution {');
      expect(lines[2]).toBe('        a + b');
      expect(source).toContain('    let __r = Solution::add_numbers(__a0, __a1);');
      expect(source).toContain('__harness::run(__test, 5);');
    });

    it('adds a runner type only for lessons that use it', () => {
      expect(rustRuntime.assemble(correct, addSpec).source).not.toContain('pub struct ListNode');
      expect(rustRuntime.assemble(correct, listSpec).source).toContain('pub struct ListNode');
    });

    it("declares Solution unless the learner's code does", () => {
      const count = (source: string) => source.split('pub struct Solution;').length - 1;

      expect(count(rustRuntime.assemble(correct, addSpec).source)).toBe(1);
      expect(
        count(
          rustRuntime.assemble(`#[derive(Default)]\npub struct Solution;\n${correct}`, addSpec)
            .source,
        ),
      ).toBe(1);
    });

    it('lends a list with a loop and never drops it', () => {
      const { source } = rustRuntime.assemble('', loopSpec);

      expect(source).toContain('let __a0 = __hlist::with_loop(&__args[0]);');
      expect(source).toContain('Solution::has_loop(&__a0)');
    });

    it("adds the tests' helper as a method of Solution, with the hidden values", () => {
      const { source } = rustRuntime.assemble('', helperSpec);

      expect(source).toContain('    pub fn is_bad_version(&self, version: i32) -> bool {');
      expect(source).toContain(
        '        let bad_version: i32 = __harness::hidden(&__HIDDEN_0);\n        return version >= badVersion;',
      );
      expect(source).toContain('    let __r = __s.first_bad_version(__a0);');
    });

    it('drives a design lesson through its methods', () => {
      const { source } = rustRuntime.assemble('', stackSpec);

      expect(source).toContain('    let mut __o = MinStack::new(__c0);');
      expect(source).toContain('            "getMin" => {');
      expect(source).toContain('                let __v = __o.get_min();');
    });
  });

  describe('diagnostics', () => {
    const assembled = rustRuntime.assemble(correct, addSpec);
    const harnessLine = assembled.userLines + 200;

    it("places errors in the learner's code", () => {
      const output =
        'main.rs:3:13: error[E0308]: mismatched types: expected `i32`, found `&str`\nerror: aborting due to 1 previous error\n';

      expect(rustRuntime.diagnostics(output, assembled, addSpec)).toEqual([
        { line: 3, column: 13, message: 'mismatched types: expected `i32`, found `&str`' },
      ]);
    });

    it("explains a learner's own copy of the tests' helper", () => {
      const code =
        'impl Solution {\n    pub fn is_bad_version(&self, v: i32) -> bool { false }\n}\n';
      const own = rustRuntime.assemble(code, helperSpec);
      const output = [
        'main.rs:2:5: error[E0592]: duplicate definitions with name `is_bad_version`: duplicate definitions for `is_bad_version`',
        'main.rs:9:21: error[E0034]: multiple applicable items in scope: multiple `is_bad_version` found',
      ].join('\n');

      expect(rustRuntime.diagnostics(output, own, helperSpec)).toEqual([
        {
          line: 2,
          column: 5,
          message:
            '`is_bad_version` is provided by the test runner, so remove your own `fn is_bad_version`',
        },
      ]);
    });

    it("explains a function the tests can't call", () => {
      const output = `main.rs:${harnessLine}:30: error[E0308]: mismatched types: expected \`String\`, found \`i32\`\n`;

      expect(rustRuntime.diagnostics(output, assembled, addSpec)).toEqual([
        {
          line: null,
          column: null,
          message:
            "Your code doesn't match what the tests call. They expect:\nimpl Solution {\n    pub fn add_numbers(a: i32, b: i32) -> i32\n}",
        },
      ]);
    });

    it('points at the brace that is never closed', () => {
      const missing = rustRuntime.assemble(
        'impl Solution {\n    pub fn add_numbers(a: i32, b: i32) -> i32 {\n        a + b\n    }\n',
        addSpec,
      );
      const output = `main.rs:${harnessLine}:3: error: this file contains an unclosed delimiter: unclosed delimiter\n`;

      expect(rustRuntime.diagnostics(output, missing, addSpec)).toEqual([
        {
          line: 1,
          column: null,
          message: 'A `}` is missing: the `{` on this line is never closed',
        },
      ]);
    });

    it('explains redefining a type the runner provides', () => {
      const own = rustRuntime.assemble(
        'pub struct ListNode {\n    pub val: i32,\n}\nimpl Solution {}\n',
        listSpec,
      );
      const output = `main.rs:${harnessLine}:9: error[E0255]: the name \`ListNode\` is defined multiple times: \`ListNode\` reimported here\n`;

      expect(rustRuntime.diagnostics(output, own, listSpec)[0].message).toBe(
        '`ListNode` is provided by the test runner, so remove your own `struct ListNode`',
      );
    });

    it('asks for the impl or struct the tests use', () => {
      const free = rustRuntime.assemble(
        'fn add_numbers(a: i32, b: i32) -> i32 {\n    a + b\n}\n',
        addSpec,
      );
      const output = `main.rs:${harnessLine}:25: error[E0599]: no associated function or constant named \`add_numbers\` found for struct \`Solution\` in the current scope\n`;

      expect(rustRuntime.diagnostics(output, free, addSpec)[0].message).toBe(
        'Your code needs an `impl Solution`, as in the starting code',
      );
      expect(
        rustRuntime.diagnostics(output, rustRuntime.assemble('', stackSpec), stackSpec)[0].message,
      ).toBe('Your code needs a `struct MinStack`, as in the starting code');
    });

    it("shows errors that aren't about the code as they are", () => {
      const output = 'error: linking with `cc` failed: exit status: 1\n';

      expect(rustRuntime.diagnostics(output, assembled, addSpec)).toEqual([
        { line: null, column: null, message: 'linking with `cc` failed: exit status: 1' },
      ]);
    });
  });

  describe('starting code', () => {
    it('declares the function the tests call, returning a placeholder', () => {
      expect(rustStarter(addSpec)).toBe(
        'impl Solution {\n    pub fn add_numbers(a: i32, b: i32) -> i32 {\n        // Your solution here\n        0\n    }\n}\n',
      );
    });

    it('describes the runner types a lesson uses', () => {
      expect(rustStarter(listSpec)).toMatch(/^\/\/ The test runner provides ListNode/);
    });

    it('takes &self where the tests provide a helper, and says how to call it', () => {
      expect(rustStarter(helperSpec)).toBe(
        '// The test runner provides self.is_bad_version(version: i32) -> bool\nimpl Solution {\n    pub fn first_bad_version(&self, n: i32) -> i32 {\n        // Your solution here\n        0\n    }\n}\n',
      );
    });

    it('borrows a list that can have a loop', () => {
      expect(rustStarter(loopSpec)).toContain(
        'pub fn has_loop(head: &Option<Box<ListNode>>) -> bool {',
      );
    });

    it('puts one parameter a line where the signature passes 100 columns', () => {
      const spec = defineSpec({
        kind: 'function',
        entry: 'findClosestAncestor',
        params: [
          { name: 'root', type: 'BinaryNode' },
          { name: 'firstChildValue', type: 'int' },
          { name: 'secondChildValue', type: 'int' },
        ],
        returns: 'BinaryNodeRef',
        tests: [{ description: 'root', args: [[1], 1, 1], expected: 1 }],
      });

      expect(rustStarter(spec)).toContain(
        '    pub fn find_closest_ancestor(\n        root: Option<Rc<RefCell<BinaryNode>>>,\n        first_child_value: i32,\n        second_child_value: i32,\n    ) -> Option<Rc<RefCell<BinaryNode>>> {',
      );
      expect(rustStarter(spec)).toContain('use std::cell::RefCell;\nuse std::rc::Rc;\n');
    });

    it("declares a design lesson's struct and methods", () => {
      expect(rustStarter(stackSpec)).toBe(
        [
          'struct MinStack {}',
          '',
          'impl MinStack {',
          '    fn new(capacity: i32) -> Self {',
          '        // Set up your struct here',
          '        MinStack {}',
          '    }',
          '',
          '    fn push(&mut self, item: i32) {',
          '        // Your solution here',
          '    }',
          '',
          '    fn get_min(&mut self) -> i32 {',
          '        // Your solution here',
          '        0',
          '    }',
          '}',
          '',
        ].join('\n'),
      );
    });
  });
});
