/**
 * The C# runtime's pure parts: normalizing, reading C# source, assembling,
 * placing compiler errors and starting code. Running the programs is the
 * conformance suite's job (test/conformance, in Docker).
 */
import {
  csharpRuntime,
  csharpStarter,
  namespacesIn,
  scanCSharp,
} from 'services/server/runner/runtimes/csharp';
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
  tests: [{ description: 'one', args: [1], hidden: [1], expected: 1 }],
});

const correct =
  'public class Solution {\n    public int AddNumbers(int a, int b) {\n        return a + b;\n    }\n}\n';

describe('C# runtime', () => {
  describe('normalize', () => {
    it('blanks #line directives and file-scoped namespaces without moving anything', () => {
      const { code, errors } = csharpRuntime.normalize(
        '\uFEFFnamespace Practice.Lessons;\r\n#line 40\r\npublic class Solution {\r\n}',
      );

      expect(errors).toEqual([]);
      expect(code.split('\n')).toEqual([
        ' '.repeat('namespace Practice.Lessons;'.length),
        ' '.repeat('#line 40'.length),
        'public class Solution {',
        '}',
        '',
      ]);
    });

    it('keeps namespaces with braces, and `namespace` in strings and comments', () => {
      const source =
        '// namespace A;\nnamespace B {\n    class C { string s = "namespace D;"; }\n}\n';

      expect(csharpRuntime.normalize(source).code).toBe(source);
    });

    it('turns the Unicode line separators C# counts as line breaks into spaces', () => {
      expect(csharpRuntime.normalize('// a\u2028b\nclass C {}\n').code).toBe(
        '// a b\nclass C {}\n',
      );
    });
  });

  describe('reading C# source', () => {
    it('skips verbatim, raw and interpolated strings and character literals', () => {
      const { masked, unterminated } = scanCSharp(
        [
          'var a = @"C:\\dir\\";',
          'var b = """ { "quoted" } """;',
          'var c = $"{d["key"]} {{ }}";',
          "var e = '\"';",
          'var f = $@"{g}',
          '}";',
          '',
        ].join('\n'),
      );

      expect(unterminated).toBeNull();
      expect(masked).not.toMatch(/[{}"']/);
      expect(masked.split('\n')).toHaveLength(7);
    });

    it('finds what is never closed, and preprocessor lines', () => {
      expect(scanCSharp('class A {\n  /* open\n}\n').unterminated).toEqual({
        what: 'comment',
        line: 2,
      });
      expect(scanCSharp('var s = "open;\n').unterminated).toEqual({ what: 'string', line: 1 });
      expect(scanCSharp('  #region Helpers "x"\nclass A {}\n#endregion\n').directives).toEqual([
        expect.objectContaining({ name: 'region', line: 1 }),
        expect.objectContaining({ name: 'endregion', line: 3 }),
      ]);
    });

    it('lists the namespaces declared with braces, by full name', () => {
      expect(namespacesIn('namespace A {\n  namespace B { }\n}\nnamespace C.D { }\n')).toEqual([
        'A',
        'A.B',
        'C.D',
      ]);
    });
  });

  describe('assemble', () => {
    it("keeps the learner's line N at line N, after the implicit usings", () => {
      const { source, userLines, lineOffset } = csharpRuntime.assemble(correct, addSpec);
      const lines = source.split('\n');

      expect(userLines).toBe(5);
      expect(lines.slice(0, lineOffset)).toEqual([
        '#line 1 "__usings.cs"',
        'global using System; global using System.Collections.Generic; global using System.Linq; global using System.Text;',
        '#line 1 "Main.cs"',
      ]);
      expect(lines[lineOffset + 2]).toBe('        return a + b;');
      expect(lines[lineOffset + userLines]).toBe('#line 1 "__harness.cs"');
    });

    it('adds a runner type only for lessons that use it', () => {
      expect(csharpRuntime.assemble(correct, addSpec).source).not.toContain('class ListNode');
      expect(csharpRuntime.assemble(correct, listSpec).source).toContain(
        'public class ListNode : global::__Skilled.IJson',
      );
    });

    it("lets the driver see a Solution in the learner's namespace", () => {
      const { source } = csharpRuntime.assemble(`namespace Practice {\n${correct}}\n`, addSpec);

      expect(source).toContain(
        'namespace __SkilledDriver {\nusing __H = global::__Skilled.H;\nusing global::Practice;',
      );
    });

    it('defines the injected helper on the base class, with the hidden value', () => {
      const { source } = csharpRuntime.assemble(correct, injectedSpec);

      expect(source).toContain(
        'public class VersionControl {\n    internal static int badVersion;\n    public bool IsBadVersion(int version) {\n        return version >= badVersion;\n    }\n}',
      );
      expect(source).toContain('VersionControl.badVersion = __H.ToInt(__hidden[0]);');
    });
  });

  describe('diagnostics', () => {
    const assembled = csharpRuntime.assemble(correct, addSpec);

    it("places errors in the learner's code", () => {
      const output = 'Main.cs(3,21): error CS1002: ; expected\nMain.cs(1,7): warning CS0105: x\n';

      expect(csharpRuntime.diagnostics(output, assembled, addSpec)).toEqual([
        { line: 3, column: 21, message: '; expected' },
      ]);
    });

    it("explains a method the tests can't call", () => {
      const output =
        "__harness.cs(587,26): error CS1503: Argument 1: cannot convert from 'int' to 'string'\n";

      expect(csharpRuntime.diagnostics(output, assembled, addSpec)).toEqual([
        {
          line: null,
          column: null,
          message:
            "Your code doesn't match what the tests call. They expect:\npublic class Solution {\n    public int AddNumbers(int a, int b)\n}",
        },
      ]);
    });

    it('points at the brace that is never closed, where Roslyn reports it', () => {
      const missing = csharpRuntime.assemble(
        'public class Solution {\n    public int AddNumbers(int a, int b) {\n        return a + b;\n    }\n',
        addSpec,
      );
      const output = 'Main.cs(4,6): error CS1513: } expected\n';

      expect(csharpRuntime.diagnostics(output, missing, addSpec)).toEqual([
        {
          line: 1,
          column: null,
          message: 'A `}` is missing: the `{` on this line is never closed',
        },
      ]);
    });

    it('explains a string or #region that is never closed', () => {
      const string = csharpRuntime.assemble('class Solution {\n  string s = "x;\n}\n', addSpec);
      const region = csharpRuntime.assemble('#region Helpers\nclass Solution {}\n', addSpec);
      const output = '__harness.cs(597,1): error CS1038: #endregion directive expected\n';

      expect(csharpRuntime.diagnostics(output, string, addSpec)[0]).toEqual({
        line: 2,
        column: null,
        message: 'This string is never closed',
      });
      expect(csharpRuntime.diagnostics(output, region, addSpec)[0]).toEqual({
        line: 1,
        column: null,
        message: 'This `#region` is never closed: it needs an `#endregion`',
      });
    });

    it('explains redefining a type the runner provides', () => {
      const own = csharpRuntime.assemble(
        'public class ListNode { public int val; }\npublic class Solution {}\n',
        listSpec,
      );
      const output =
        "__harness.cs(576,14): error CS0101: The namespace '<global namespace>' already contains a definition for 'ListNode'\n";

      expect(csharpRuntime.diagnostics(output, own, listSpec)[0].message).toBe(
        '`ListNode` is provided by the test runner, so remove your own `class ListNode`',
      );
    });

    it("explains a learner's own copy of the injected helper", () => {
      const own = csharpRuntime.assemble(
        'public class Solution : VersionControl {\n    bool IsBadVersion(int v) { return v >= 4; }\n}\n',
        injectedSpec,
      );
      const output =
        "Main.cs(2,10): error CS0108: 'Solution.IsBadVersion(int)' hides inherited member 'VersionControl.IsBadVersion(int)'. Use the new keyword if hiding was intended.\n";

      expect(csharpRuntime.diagnostics(output, own, injectedSpec)).toEqual([
        {
          line: 2,
          column: 10,
          message:
            '`IsBadVersion` is provided by `VersionControl`, so remove your own `IsBadVersion`',
        },
      ]);
    });

    it('asks for the class the tests use', () => {
      const output =
        "__harness.cs(585,9): error CS0246: The type or namespace name 'Solution' could not be found (are you missing a using directive or an assembly reference?)\n";

      expect(csharpRuntime.diagnostics(output, assembled, addSpec)[0].message).toBe(
        'Your code needs a `class Solution`, as in the starting code',
      );
    });

    it('passes on output that has no errors in it', () => {
      expect(csharpRuntime.diagnostics('Segmentation fault\n', assembled, addSpec)).toEqual([
        { line: null, column: null, message: 'Segmentation fault' },
      ]);
    });
  });

  describe('starting code', () => {
    it('declares the method the tests call, returning a placeholder', () => {
      expect(csharpStarter(addSpec)).toBe(
        'public class Solution {\n    public int AddNumbers(int a, int b) {\n        // Your solution here\n        return 0;\n    }\n}\n',
      );
    });

    it('describes the runner types a lesson uses', () => {
      expect(csharpStarter(listSpec)).toMatch(
        /^\/\*\*\n \* The test runner provides ListNode:\n \* public class ListNode \{/,
      );
    });

    it('extends the class that provides the injected helper', () => {
      expect(csharpStarter(injectedSpec)).toBe(
        '// IsBadVersion(version) is provided by VersionControl\npublic class Solution : VersionControl {\n    public int FirstBadVersion(int n) {\n        // Your solution here\n        return 0;\n    }\n}\n',
      );
    });
  });
});
