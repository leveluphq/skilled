/**
 * The Go runtime's pure parts: normalizing, assembling, placing compiler
 * errors and starting code. Running the programs is the conformance suite's
 * job (test/conformance, in Docker).
 */
import preludes from 'services/server/runner/preludes/preludes.gen';
import { goRuntime, goStarter, goType } from 'services/server/runner/runtimes/go';
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
  className: 'MaxMinStack',
  ctor: [],
  methods: [
    { name: 'push', params: [{ name: 'item', type: 'int' }], returns: 'int' },
    { name: 'getStackMax', params: [], returns: 'int' },
  ],
  tests: [{ description: 'one', ops: [['push', 1], ['getStackMax']], expected: [1, 1] }],
});

const correct = 'func addNumbers(a int, b int) int {\n\treturn a + b\n}\n';

describe('Go runtime', () => {
  describe('types', () => {
    it.each([
      ['char[][]', '[][]byte'],
      ['long[]', '[]int64'],
      ['map<string,string[]>', 'map[string][]string'],
      ['int?', '*int'],
      ['Interval?', '*Interval'],
      ['string[]?', '[]string'],
      ['ListNode?', '*ListNode'],
      ['BinaryNodeRef', '*BinaryNode'],
      ['Item[]', '[]Item'],
    ])('%s is %s', (neutral, go) => {
      expect(goType(parseType(neutral))).toBe(go);
    });
  });

  describe('normalize', () => {
    it('blanks the package clause and renames main without moving anything', () => {
      const { code, errors } = goRuntime.normalize(
        'package solution\r\n\r\nfunc main() { fmt.Println(1) }\r\nfunc addNumbers(a, b int) int { return a + b }',
      );

      expect(errors).toEqual([]);
      expect(code.split('\n')).toEqual([
        '                ',
        '',
        'func _   () { fmt.Println(1) }',
        'func addNumbers(a, b int) int { return a + b }',
        '',
      ]);
    });

    it('leaves strings, comments and methods named main alone', () => {
      const code =
        '// package main\nvar s = `package main`\n\nfunc (t T) main() {}\nfunc mainly() {}\n';

      expect(goRuntime.normalize(code).code).toBe(code);
    });
  });

  describe('assemble', () => {
    it("keeps the learner's line N at line N after a //line directive", () => {
      const { source, userLines, lineOffset } = goRuntime.assemble(correct, addSpec);
      const lines = source.split('\n');

      expect(userLines).toBe(3);
      expect(lineOffset).toBe(3);
      expect(lines.slice(0, lineOffset)).toEqual([
        '//line harness.go:1',
        expect.stringMatching(/^package main; import \(__fmt "fmt"; .*\)$/),
        '//line main.go:1:1',
      ]);
      expect(lines[lineOffset]).toBe('func addNumbers(a int, b int) int {');
      expect(lines[lineOffset + 1]).toBe('\treturn a + b');
      expect(lines.slice(lineOffset + userLines, lineOffset + userLines + 2)).toEqual([
        '',
        '//line harness.go:1',
      ]);
      expect(source).toContain(`\t__run(__test, ${userLines})`);
    });

    it('adds a runner type only for lessons that use it', () => {
      expect(goRuntime.assemble(correct, addSpec).source).not.toContain('type ListNode struct');
      expect(goRuntime.assemble(correct, listSpec).source).toContain('type ListNode struct');
    });

    it('calls the function with converted inputs, accepting any return type', () => {
      const { source } = goRuntime.assemble(correct, addSpec);

      expect(source).toContain('\t__a0 := __jInt(__args[0])');
      expect(source).toContain('\t__r := any(addNumbers(__a0, __a1))');
    });

    it('marks where nil is null and where bytes are characters', () => {
      const spec = defineSpec({
        kind: 'function',
        entry: 'letters',
        params: [],
        returns: 'char[]?',
        tests: [{ description: 'none', args: [], expected: null }],
      });

      expect(goRuntime.assemble('', spec).source).toContain(
        '\t__r := __shaped{letters(), &__shape{nullable: true, of: &__shape{chars: true}}}',
      );
    });

    it("defines the tests' function, with the hidden values under their spec names", () => {
      const { source } = goRuntime.assemble('', injectedSpec);

      expect(source).toContain(
        'func isBadVersion(version int) bool {\n\tbadVersion := __hidden0\n\t_ = badVersion\n\treturn version >= badVersion;\n}',
      );
      expect(source).toContain('\t__hidden0 = __jInt(__hidden[0])');
    });

    it('drives a design lesson through Constructor and exported methods', () => {
      const { source } = goRuntime.assemble('', designSpec);

      expect(source).toContain('\t__o := Constructor()');
      expect(source).toContain('\t\t\t__out = append(__out, any(__o.Push(__jInt(__op.args[0]))))');
      expect(source).toContain('\t\t\t__out = append(__out, any(__o.GetStackMax()))');
    });

    // An unclosed raw string or block comment in the learner's code must run
    // to the end of the file, so Go reports it where it starts
    it.each(Object.keys(preludes).filter((name) => name.startsWith('go.')))(
      '%s has no backquote, no end of a block comment and no min or max',
      (name) => {
        expect(preludes[name]).not.toMatch(/`|\*\/|\b(min|max)\(/);
      },
    );
  });

  describe('diagnostics', () => {
    const assembled = goRuntime.assemble(correct, addSpec);

    it("places errors in the learner's code, in characters rather than bytes", () => {
      const code = 'func addNumbers(a int, b int) int {\n\ts := "héllo"; return a + s\n}\n';
      const output =
        '# command-line-arguments\n./main.go:2:24: invalid operation: a + s (mismatched types int and string)\n';

      expect(goRuntime.diagnostics(output, goRuntime.assemble(code, addSpec), addSpec)).toEqual([
        {
          line: 2,
          column: 23,
          message: 'invalid operation: a + s (mismatched types int and string)',
        },
      ]);
    });

    it("explains a function the tests can't call", () => {
      const output =
        '# command-line-arguments\n./driver.go:6: addNumbers(__a0, __a1) (no value) used as value\n';

      expect(goRuntime.diagnostics(output, assembled, addSpec)).toEqual([
        {
          line: null,
          column: null,
          message:
            "Your code doesn't match what the tests call. They expect:\nfunc addNumbers(a int, b int) int",
        },
      ]);
    });

    it('points at the brace that is never closed', () => {
      const missing = goRuntime.assemble(
        'func addNumbers(a int, b int) int {\n\treturn a + b\n',
        addSpec,
      );
      const output =
        '# command-line-arguments\n./harness.go:24:6: syntax error: unexpected name __dupStdout, expected (\n';

      expect(goRuntime.diagnostics(output, missing, addSpec)).toEqual([
        {
          line: 1,
          column: null,
          message: 'A `}` is missing: the `{` on this line is never closed',
        },
      ]);
    });

    it('explains redefining a type the runner provides', () => {
      const own = goRuntime.assemble(
        'type ListNode struct {\n\tData int\n}\n\nfunc reverseLinkedList(head *ListNode) *ListNode { return head }\n',
        listSpec,
      );
      const output =
        '# command-line-arguments\n./harness.go:1042: ListNode redeclared in this block\n\t./main.go:1:6[/box/main.go:4:6]: other declaration of ListNode\n';

      expect(goRuntime.diagnostics(output, own, listSpec)[0].message).toBe(
        '`ListNode` is provided by the test runner, so remove your own `type ListNode`',
      );
    });

    it("explains a learner's copy of the tests' function", () => {
      const output = './driver.go:3:6: isBadVersion redeclared in this block\n';

      expect(
        goRuntime.diagnostics(output, goRuntime.assemble('', injectedSpec), injectedSpec)[0]
          .message,
      ).toBe(
        '`isBadVersion` is provided by the test runner, so remove your own `func isBadVersion`',
      );
    });

    it('explains a method the runner already gives a type', () => {
      const output =
        './harness.go:1048: method ListNode.String already declared at ./main.go:1:20[/box/main.go:4:20]\n';

      expect(goRuntime.diagnostics(output, assembled, listSpec)[0].message).toBe(
        'The test runner gives `ListNode` its own `String` method, so remove yours',
      );
    });

    it('explains redefining a builtin the harness relies on', () => {
      const own = goRuntime.assemble(`func len(s string) int { return 0 }\n\n${correct}`, addSpec);
      const output =
        './harness.go:82: cannot use tests (variable of type []any) as string value in argument to len\n';

      expect(goRuntime.diagnostics(output, own, addSpec)[0].message).toBe(
        "Rename your `len`: the test runner uses Go's own `len`",
      );
    });

    it('asks for the function the tests call', () => {
      const output = '# command-line-arguments\n./driver.go:6: undefined: addNumbers\n';

      expect(
        goRuntime.diagnostics(output, goRuntime.assemble('', addSpec), addSpec)[0].message,
      ).toBe('Your code needs a `func addNumbers`, as in the starting code');
    });

    it("asks a design lesson's code for its Constructor", () => {
      const output = './driver.go:5: undefined: Constructor\n';

      expect(
        goRuntime.diagnostics(output, goRuntime.assemble('', designSpec), designSpec)[0].message,
      ).toBe('Your code needs a `func Constructor`, as in the starting code');
    });

    it('shows output it does not recognize as it is', () => {
      expect(goRuntime.diagnostics('go: something went wrong\n', assembled, addSpec)).toEqual([
        { line: null, column: null, message: 'go: something went wrong' },
      ]);
    });
  });

  describe('starting code', () => {
    it('declares the function the tests call, returning a placeholder', () => {
      expect(goStarter(addSpec)).toBe(
        'func addNumbers(a int, b int) int {\n\t// Your solution here\n\treturn 0\n}\n',
      );
    });

    it('describes the runner types a lesson uses', () => {
      expect(goStarter(listSpec)).toMatch(/^\/\*\*\n \* The test runner provides ListNode:/);
      expect(goStarter(listSpec)).toContain('func reverseLinkedList(head *ListNode) *ListNode {');
    });

    it("mentions the tests' function", () => {
      expect(goStarter(injectedSpec)).toMatch(
        /^\/\/ The test runner provides func isBadVersion\(version int\) bool\nfunc firstBadVersion\(n int\) int \{/,
      );
    });

    it('gives a design lesson a struct, a Constructor and exported methods', () => {
      expect(goStarter(designSpec)).toBe(
        [
          'type MaxMinStack struct {',
          '\t// Your fields here',
          '}',
          '',
          'func Constructor() MaxMinStack {',
          '\t// Set up your struct here',
          '\treturn MaxMinStack{}',
          '}',
          '',
          'func (this *MaxMinStack) Push(item int) int {',
          '\t// Your solution here',
          '\treturn 0',
          '}',
          '',
          'func (this *MaxMinStack) GetStackMax() int {',
          '\t// Your solution here',
          '\treturn 0',
          '}',
          '',
        ].join('\n'),
      );
    });
  });
});
