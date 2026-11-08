import { CodingLanguage } from 'utils/constants/lesson';
import { nameIn } from 'utils/shared/runner/naming';
import { parseType } from 'utils/shared/runner/spec';
import { DesignSpec, FunctionSpec, LessonSpec, Param, TypeNode } from 'utils/shared/runner/types';
import preludes from '../preludes/preludes.gen';
import { blank, countLines, lex, normalizeText } from './lexer';
import { RUNNER_TYPES, runnerTypesIn } from './specTypes';
import { Assembled, Diagnostic, LanguageRuntime } from './types';

// C#, LeetCode-style: the learner writes `public class Solution` (or the
// lesson's class) with PascalCase methods. The harness (namespace __Skilled)
// and a generated driver (namespace __SkilledDriver) follow their code in
// Main.cs, and #line directives keep their line N as line N.

const LANGUAGE = CodingLanguage.Csharp;

// LeetCode's C# has these without usings. Global usings must come before
// everything else, so they go ahead of the learner's code, which `#line 1`
// then numbers from 1 again. The header has a file name of its own, so an
// error in it can't land on the learner's lines.
const IMPLICIT_USINGS =
  'global using System; global using System.Collections.Generic; global using System.Linq; global using System.Text;';
const HEADER = ['#line 1 "__usings.cs"', IMPLICIT_USINGS, '#line 1 "Main.cs"'];
const USER_FILE = 'Main.cs';

type Scalar = 'int' | 'long' | 'double' | 'bool' | 'string' | 'char';

const SCALAR_TYPE: Record<Scalar, string> = {
  int: 'int',
  long: 'long',
  double: 'double',
  bool: 'bool',
  char: 'char',
  string: 'string',
};
const SCALAR_IN: Record<Scalar, string> = {
  int: 'ToInt',
  long: 'ToLong',
  double: 'ToDouble',
  bool: 'ToBool',
  char: 'ToChar',
  string: 'ToStr',
};
const ARRAY_IN: Partial<Record<Scalar, string>> = {
  int: 'ToIntArr',
  long: 'ToLongArr',
  double: 'ToDoubleArr',
  bool: 'ToBoolArr',
  char: 'ToCharArr',
};
const CONVERTER: Record<string, string> = {
  ListNode: 'global::__Skilled.HList',
  BinaryNode: 'global::__Skilled.HTree',
  BinaryNodeRef: 'global::__Skilled.HTree',
  Interval: 'global::__Skilled.HInterval',
  Item: 'global::__Skilled.HItem',
};

// C#'s reserved words, which a spec's parameter names are escaped from with @
const KEYWORDS = new Set(
  (
    'abstract as base bool break byte case catch char checked class const continue decimal default ' +
    'delegate do double else enum event explicit extern false finally fixed float for foreach goto if ' +
    'implicit in int interface internal is lock long namespace new null object operator out override ' +
    'params private protected public readonly ref return sbyte sealed short sizeof stackalloc static ' +
    'string struct switch this throw true try typeof uint ulong unchecked unsafe ushort using virtual ' +
    'void volatile while'
  ).split(' '),
);
const identifier = (name: string) => (KEYWORDS.has(name) ? `@${name}` : name);

// The C# type for a neutral type. `qualified` spells out the namespace for
// the harness, which mustn't depend on the learner's usings.
export const csharpType = (node: TypeNode, qualified = false): string => {
  switch (node.kind) {
    case 'scalar':
      return SCALAR_TYPE[node.name];
    case 'array':
      return `${csharpType(node.of, qualified)}[]`;
    case 'map':
      return `${qualified ? 'global::System.Collections.Generic.' : ''}Dictionary<string, ${csharpType(
        node.of,
        qualified,
      )}>`;
    case 'nullable':
      // Value types become Nullable<T>; references (string, arrays,
      // classes) can be null as they are
      return node.of.kind === 'scalar' && node.of.name !== 'string'
        ? `${csharpType(node.of)}?`
        : csharpType(node.of, qualified);
    case 'BinaryNodeRef':
      return 'BinaryNode';
    default:
      return node.kind;
  }
};

// An expression converting a parsed JSON value to the C# type
const fromJson = (node: TypeNode, expr: string, depth = 0): string => {
  const item = `__x${depth}`;

  switch (node.kind) {
    case 'scalar':
      return `__H.${SCALAR_IN[node.name]}(${expr})`;
    case 'array': {
      const arrayIn = node.of.kind === 'scalar' ? ARRAY_IN[node.of.name] : undefined;
      if (arrayIn) {
        return `__H.${arrayIn}(${expr})`;
      }
      return `__H.ToArr<${csharpType(node.of, true)}>(${expr}, ${item} => ${fromJson(
        node.of,
        item,
        depth + 1,
      )})`;
    }
    case 'map':
      return `__H.ToMap<${csharpType(node.of, true)}>(${expr}, ${item} => ${fromJson(
        node.of,
        item,
        depth + 1,
      )})`;
    case 'nullable':
      return `__H.Nul<${csharpType(node, true)}>(${expr}, ${item} => ${fromJson(
        node.of,
        item,
        depth + 1,
      )})`;
    default:
      if (CONVERTER[node.kind]) {
        return `${CONVERTER[node.kind]}.To(${expr})`;
      }
      throw new Error(`C# can't take a ${node.kind}`);
  }
};

// A returned value, ready for the JSON writer. Anything else serializes as is,
// so a method may return int[] or IList<int> where the spec says int[].
const toJson = (node: TypeNode, expr: string) => {
  const base = node.kind === 'nullable' ? node.of : node;

  if (base.kind === 'ListNode' || base.kind === 'BinaryNode') {
    return `(${expr} ?? __H.Empty)`;
  }
  if (base.kind === 'BinaryNodeRef') {
    return `${CONVERTER.BinaryNodeRef}.Ref(${expr})`;
  }
  return expr;
};

const declare = (type: TypeNode, name: string, expr: string) =>
  `${csharpType(type, true)} ${name} = ${expr};`;

const parameters = (params: Param[], qualified = false) =>
  params
    .map((param) => `${csharpType(parseType(param.type), qualified)} ${identifier(param.name)}`)
    .join(', ');

// What the tests call, for "your code doesn't match" messages and starters
const methodSignature = (name: string, params: Param[], returns: string) =>
  `public ${csharpType(parseType(returns))} ${name}(${parameters(params)})`;

export const csharpSignature = (spec: LessonSpec) => {
  if (spec.kind === 'function') {
    const extend = spec.injected ? ` : ${spec.injected.baseClass}` : '';
    return `public class Solution${extend} {\n    ${methodSignature(
      nameIn(LANGUAGE, spec.entry, spec.names),
      spec.params,
      spec.returns,
    )}\n}`;
  }

  return [
    `public class ${spec.className} {`,
    `    public ${spec.className}(${parameters(spec.ctor)})`,
    ...spec.methods.map(
      (method) =>
        `    ${methodSignature(nameIn(LANGUAGE, method.name, method.names), method.params, method.returns)}`,
    ),
    '}',
  ].join('\n');
};

const injectedClass = (spec: FunctionSpec) => {
  const { injected } = spec;

  if (!injected) {
    return [];
  }

  const body = injected.body[LANGUAGE] || injected.body[CodingLanguage.Javascript];

  if (!body) {
    throw new Error(`The injected ${injected.name} has no C# body`);
  }

  return [
    `public class ${injected.baseClass} {`,
    ...(spec.hidden || []).map(
      (param) =>
        `    internal static ${csharpType(parseType(param.type), true)} ${identifier(param.name)};`,
    ),
    // Not virtual, so a learner's own version can't override it, and the
    // compile treats hiding it (CS0108) as an error
    `    public ${csharpType(parseType(injected.returns), true)} ${nameIn(
      LANGUAGE,
      injected.name,
    )}(${parameters(injected.params, true)}) {`,
    `        ${body}`,
    '    }',
    '}',
    '',
  ];
};

// The driver's namespace, which sees the learner's namespaces (if they wrapped
// their code in one) before the global one
const driverNamespace = (namespaces: string[]) => [
  'namespace __SkilledDriver {',
  'using __H = global::__Skilled.H;',
  ...namespaces.map((name) => `using global::${name};`),
  'static class Program {',
  '    static object Test(global::System.Collections.Generic.Dictionary<string, object> __case) {',
];

const functionDriver = (spec: FunctionSpec, namespaces: string[]) => {
  const hidden = spec.hidden || [];
  const call = `__s.${nameIn(LANGUAGE, spec.entry, spec.names)}(${spec.params
    .map((_param, i) => `__a${i}`)
    .join(', ')})`;
  const returns = parseType(spec.returns);
  // A node of the input tree has to come back as a BinaryNode to report its data
  const result =
    returns.kind === 'BinaryNodeRef' ? `BinaryNode __r = ${call};` : `object __r = ${call};`;

  return [
    ...injectedClass(spec),
    ...driverNamespace(namespaces),
    `        var __args = __H.Args(__case, "args", ${spec.params.length});`,
    ...spec.params.map(
      (param, i) =>
        `        ${declare(parseType(param.type), `__a${i}`, fromJson(parseType(param.type), `__args[${i}]`))}`,
    ),
    ...(hidden.length
      ? [
          `        var __hidden = __H.Args(__case, "hidden", ${hidden.length});`,
          ...hidden.map(
            (param, i) =>
              `        ${spec.injected ? spec.injected.baseClass : 'Solution'}.${identifier(
                param.name,
              )} = ${fromJson(parseType(param.type), `__hidden[${i}]`)};`,
          ),
        ]
      : []),
    '        Solution __s = new Solution();',
    '        __H.Tic();',
    `        ${result}`,
    '        __H.Toc();',
    `        return ${toJson(returns, '__r')};`,
    '    }',
  ];
};

const designDriver = (spec: DesignSpec, namespaces: string[]) => {
  const ctor = spec.ctor.map((param) => parseType(param.type));
  const cases = spec.methods.flatMap((method) => {
    const returns = parseType(method.returns);
    const args = method.params.map((param, i) => fromJson(parseType(param.type), `__op[${i + 1}]`));
    const call = `__o.${nameIn(LANGUAGE, method.name, method.names)}(${args.join(', ')})`;

    return [
      `                case ${JSON.stringify(method.name)}: {`,
      `                    __H.OpArity(__op, ${method.params.length});`,
      ...(returns.kind === 'void'
        ? [`                    ${call};`, '                    __out.Add(null);']
        : [
            `                    ${returns.kind === 'BinaryNodeRef' ? 'BinaryNode' : 'object'} __v = ${call};`,
            `                    __out.Add(${toJson(returns, '__v')});`,
          ]),
      '                    break;',
      '                }',
    ];
  });

  return [
    ...driverNamespace(namespaces),
    `        var __ctor = __H.Args(__case, "ctorArgs", ${ctor.length});`,
    ...ctor.map((type, i) => `        ${declare(type, `__c${i}`, fromJson(type, `__ctor[${i}]`))}`),
    '        var __ops = __H.Ops(__H.Field(__case, "ops"));',
    '        var __out = new global::System.Collections.Generic.List<object>();',
    '        __H.Tic();',
    `        ${spec.className} __o = new ${spec.className}(${ctor.map((_type, i) => `__c${i}`).join(', ')});`,
    '        for (int __k = 0; __k < __ops.Count; __k++) {',
    '            var __op = __ops[__k];',
    '            string __name = (string)__op[0];',
    '            __H.OpAt(__k, __name);',
    '            switch (__name) {',
    ...cases,
    '                default: throw __H.UnknownOp(__name);',
    '            }',
    '        }',
    '        __H.Toc();',
    '        return __out;',
    '    }',
  ];
};

// ---------------- reading C# source ----------------

export interface Directive {
  name: string;
  line: number;
  start: number;
  end: number;
}

export interface Scanned {
  // The source with comments, literals and preprocessor lines blanked out,
  // keeping every line break, so `lex` sees only code
  masked: string;
  unterminated: { what: string; line: number } | null;
  directives: Directive[];
}

// Finds C#'s comments, strings (regular, verbatim @"", raw """ and
// interpolated $"{...}", whose holes hold code with strings of their own),
// character literals and #directives, which the shared lexer doesn't know
export const scanCSharp = (source: string): Scanned => {
  const n = source.length;
  const directives: Directive[] = [];
  let masked = source;
  let unterminated: Scanned['unterminated'] = null;
  const lineAt = (position: number) => source.slice(0, position).split('\n').length;
  const fail = (what: string, start: number) => {
    if (!unterminated) {
      unterminated = { what, line: lineAt(start) };
    }
    return n;
  };

  // Past the end of the string or character literal starting at `start`
  // (after its $ and @ prefix, at its first quote)
  const literalEnd = (start: number): number => {
    let j = start;
    let interpolated = false;
    let verbatim = false;
    while (source[j] === '$' || source[j] === '@') {
      interpolated = interpolated || source[j] === '$';
      verbatim = verbatim || source[j] === '@';
      j++;
    }

    if (source[j] === "'") {
      for (j++; j < n; j++) {
        if (source[j] === '\\') j++;
        else if (source[j] === "'") return j + 1;
        else if (source[j] === '\n') break;
      }
      return fail('character literal', start);
    }

    if (source.startsWith('"""', j)) {
      let quotes = 0;
      while (source[j + quotes] === '"') quotes++;
      const close = source.indexOf('"'.repeat(quotes), j + quotes);
      return close < 0 ? fail('raw string', start) : close + quotes;
    }

    for (j++; j < n; j++) {
      const c = source[j];
      if (verbatim && c === '"') {
        if (source[j + 1] !== '"') return j + 1;
        j++;
      } else if (!verbatim && c === '\\') {
        j++;
      } else if (!verbatim && c === '"') {
        return j + 1;
      } else if (!verbatim && c === '\n') {
        break;
      } else if (interpolated && c === '{') {
        if (source[j + 1] === '{') j++;
        else j = holeEnd(j + 1) - 1;
      }
    }
    return fail(verbatim ? 'verbatim string' : 'string', start);
  };

  // Past the `}` closing an interpolation hole that starts at `start`
  const holeEnd = (start: number): number => {
    let depth = 0;
    let j = start;
    while (j < n) {
      const c = source[j];
      if (c === '{') {
        depth++;
      } else if (c === '}') {
        if (depth === 0) return j + 1;
        depth--;
      } else if (c === '"' || c === "'" || /^[$@]+["]/.test(source.slice(j, j + 4))) {
        j = literalEnd(j);
        continue;
      } else if (source.startsWith('/*', j)) {
        const close = source.indexOf('*/', j + 2);
        j = close < 0 ? n : close + 2;
        continue;
      }
      j++;
    }
    return n;
  };

  let i = 0;
  let lineStart = true;

  while (i < n) {
    const c = source[i];

    if (c === '\n') {
      lineStart = true;
      i++;
      continue;
    }
    if (c === ' ' || c === '\t' || c === '\r' || c === '\f' || c === '\v') {
      i++;
      continue;
    }

    let end = i;

    if (lineStart && c === '#') {
      const close = source.indexOf('\n', i);
      end = close < 0 ? n : close;
      const name = /^#\s*([a-z]+)/.exec(source.slice(i, end));
      directives.push({ name: name ? name[1] : '', line: lineAt(i), start: i, end });
    } else if (source.startsWith('//', i)) {
      const close = source.indexOf('\n', i);
      end = close < 0 ? n : close;
    } else if (source.startsWith('/*', i)) {
      const close = source.indexOf('*/', i + 2);
      end = close < 0 ? fail('comment', i) : close + 2;
    } else if (c === '"' || c === "'" || /^[$@]+["]/.test(source.slice(i, i + 4))) {
      end = literalEnd(i);
    }

    lineStart = false;

    if (end > i) {
      masked = blank(masked, i, end);
      i = end;
    } else {
      i++;
    }
  }

  return { masked, unterminated, directives };
};

// #if and #region blocks that never end, which swallow the harness
const unclosedDirective = (directives: Directive[]) => {
  const open: Directive[] = [];

  for (const directive of directives) {
    if (directive.name === 'if' || directive.name === 'region') {
      open.push(directive);
    } else if (directive.name === 'endif' || directive.name === 'endregion') {
      open.pop();
    }
  }

  return open.length ? open[open.length - 1] : null;
};

// The namespaces the learner declared with braces, by full name, for the
// driver to import. File-scoped ones are blanked by the normalizer.
export const namespacesIn = (code: string) => {
  const { masked } = scanCSharp(code);
  const { identifiers } = lex(masked);
  const open: { name: string; depth: number }[] = [];
  const found: string[] = [];

  identifiers.forEach((token) => {
    if (token.text !== 'namespace') {
      return;
    }
    const declared = /^\s*([A-Za-z_][\w]*(?:\s*\.\s*[A-Za-z_][\w]*)*)\s*\{/.exec(
      masked.slice(token.end),
    );
    if (!declared) {
      return;
    }
    while (open.length && open[open.length - 1].depth >= token.depth) {
      open.pop();
    }
    const name = [...open.map((outer) => outer.name), declared[1].replace(/\s+/g, '')].join('.');
    open.push({ name, depth: token.depth });
    if (!found.includes(name)) {
      found.push(name);
    }
  });

  return found;
};

// Only edits that keep every line where it was: no BOM, LF endings, Unicode
// line separators (which C# counts as line breaks and the editor doesn't) as
// spaces, and blanked `#line` directives (which would move the learner's
// lines) and file-scoped `namespace X;` lines (which would take in the harness)
const normalizeCode = (code: string) => {
  let text = normalizeText(code).replace(/[\u0085\u2028\u2029]/g, ' ');
  const { masked, directives } = scanCSharp(text);
  const { identifiers } = lex(masked);
  const spans: [number, number][] = directives
    .filter((directive) => directive.name === 'line')
    .map((directive) => [directive.start, directive.end]);

  identifiers
    .filter((token) => token.depth === 0 && token.text === 'namespace')
    .forEach((token) => {
      const fileScoped = /^\s*[A-Za-z_][\w]*(?:\s*\.\s*[A-Za-z_][\w]*)*\s*;/.exec(
        masked.slice(token.end),
      );
      if (fileScoped) {
        spans.push([token.start, token.end + fileScoped[0].length]);
      }
    });

  // Back to front, so earlier positions stay valid
  spans
    .sort((a, b) => b[0] - a[0])
    .forEach(([start, end]) => {
      text = blank(text, start, end);
    });

  return { code: text, errors: [] };
};

const assemble = (code: string, spec: LessonSpec): Assembled => {
  const used = runnerTypesIn(spec);
  const userLines = countLines(code);
  const namespaces = namespacesIn(code);
  const driver =
    spec.kind === 'function' ? functionDriver(spec, namespaces) : designDriver(spec, namespaces);

  const source = [
    ...HEADER,
    // The harness numbers its own lines, so errors in it can't land on the learner's
    `${code.endsWith('\n') ? code : `${code}\n`}#line 1 "__harness.cs"`,
    preludes['csharp.core.cs'],
    ...RUNNER_TYPES.filter((type) => used.has(type)).map((type) => preludes[`csharp.${type}.cs`]),
    '// ==== driver ====',
    ...driver,
    '    static void Main() {',
    `        __H.UserLines = ${userLines};`,
    '        __H.Run(Test);',
    '    }',
    '}',
    '}',
    '',
  ].join('\n');

  return { source, userLines, lineOffset: HEADER.length };
};

interface CscError {
  file: string | null;
  line: number | null;
  column: number | null;
  code: string;
  message: string;
}

// csc prints "Main.cs(7,20): error CS1525: Invalid expression term ';'", with
// the file and line from the #line directives, or "error CS5001: ..." for an
// error that has no place
const parseCsc = (output: string): CscError[] =>
  output.split('\n').flatMap((text): CscError[] => {
    const located = /^(.*)\((\d+),(\d+)\): error (CS\d+): (.*)$/.exec(text.trim());
    if (located) {
      return [
        {
          file: located[1].split(/[\\/]/).pop() || null,
          line: Number(located[2]),
          column: Number(located[3]),
          code: located[4],
          message: located[5].trim(),
        },
      ];
    }
    const unplaced = /(?:^|: )error (CS\d+): (.*)$/.exec(text.trim());
    return unplaced
      ? [{ file: null, line: null, column: null, code: unplaced[1], message: unplaced[2].trim() }]
      : [];
  });

// A learner's own copy of the injected helper hides the tests' one (CS0108,
// an error here). csc suggests `new`, which would make the copy win.
const hidesInjected = (spec: LessonSpec, code: string, message: string) => {
  if (code !== 'CS0108' || spec.kind !== 'function' || !spec.injected) {
    return null;
  }
  const name = nameIn(LANGUAGE, spec.injected.name);
  const { baseClass } = spec.injected;
  return message.includes(`'${baseClass}.${name}(`)
    ? `\`${name}\` is provided by \`${baseClass}\`, so remove your own \`${name}\``
    : null;
};

// Errors in the learner's code are shown where they are. Errors only in the
// harness mean the code doesn't fit around it; say why in their terms.
const diagnosticsFor =
  (spec: LessonSpec) =>
  (output: string, assembled: Assembled): Diagnostic[] => {
    const errors = parseCsc(output);
    const own = errors.filter(
      (error) =>
        error.file === USER_FILE && error.line !== null && error.line <= assembled.userLines,
    );

    const code = assembled.source
      .split('\n')
      .slice(assembled.lineOffset, assembled.lineOffset + assembled.userLines)
      .join('\n');
    const scanned = scanCSharp(code);
    const lexed = lex(scanned.masked);
    const missingBrace = (): Diagnostic => ({
      line: lexed.openLines[lexed.openLines.length - 1],
      column: null,
      message: 'A `}` is missing: the `{` on this line is never closed',
    });

    if (own.length) {
      // Roslyn closes an unclosed class itself, before the harness, and
      // says "} expected" (CS1513) at the end of the learner's code
      const unclosedClass =
        lexed.depth > 0 && !scanned.unterminated && own.some((error) => error.code === 'CS1513');
      return [
        ...(unclosedClass ? [missingBrace()] : []),
        ...own
          .filter((error) => !unclosedClass || error.code !== 'CS1513')
          .slice(0, 20)
          .map(({ line, column, code: id, message }) => ({
            line,
            column,
            message: hidesInjected(spec, id, message) || message,
          })),
      ];
    }

    if (!errors.length) {
      return output.trim()
        ? [{ line: null, column: null, message: output.trim().slice(0, 500) }]
        : [];
    }

    if (scanned.unterminated) {
      return [
        {
          line: scanned.unterminated.line,
          column: null,
          message: `This ${scanned.unterminated.what} is never closed`,
        },
      ];
    }

    const unclosed = unclosedDirective(scanned.directives);

    if (unclosed) {
      return [
        {
          line: unclosed.line,
          column: null,
          message: `This \`#${unclosed.name}\` is never closed: it needs an \`#end${unclosed.name}\``,
        },
      ];
    }

    if (lexed.depth > 0) {
      return [missingBrace()];
    }

    if (lexed.depth < 0) {
      return [{ line: null, column: null, message: 'Your code has a `}` with no `{` to close' }];
    }

    // CS0101, or CS0260 for a `partial class ListNode`
    const duplicate = errors
      .map((error) =>
        error.code === 'CS0101' || error.code === 'CS0260'
          ? /(?:definition for|declaration of type) '(\w+)'/.exec(error.message)
          : null,
      )
      .find(Boolean);

    if (duplicate) {
      const name = duplicate[1];
      return [
        {
          line: null,
          column: null,
          message: `\`${name}\` is provided by the test runner, so remove your own \`class ${name}\``,
        },
      ];
    }

    const className = spec.kind === 'function' ? 'Solution' : spec.className;

    if (
      errors.some((error) =>
        error.message.startsWith(`The type or namespace name '${className}' could not be found`),
      )
    ) {
      return [
        {
          line: null,
          column: null,
          message: `Your code needs a \`class ${className}\`, as in the starting code`,
        },
      ];
    }

    return [
      {
        line: null,
        column: null,
        message: `Your code doesn't match what the tests call. They expect:\n${csharpSignature(spec)}`,
      },
    ];
  };

// What a method returns in starting code: a value of the right type that
// fails the tests
const placeholder = (type: TypeNode): string => {
  switch (type.kind) {
    case 'scalar':
      return { int: '0', long: '0', double: '0', bool: 'false', char: "' '", string: '""' }[
        type.name
      ];
    case 'array': {
      let inner: TypeNode = type;
      let dimensions = 0;
      while (inner.kind === 'array') {
        dimensions++;
        inner = inner.of;
      }
      return `new ${csharpType(inner)}[0]${'[]'.repeat(dimensions - 1)}`;
    }
    default:
      return 'null';
  }
};

const NODE_COMMENTS: Record<string, string[]> = {
  ListNode: [
    '/**',
    ' * The test runner provides ListNode:',
    ' * public class ListNode {',
    ' *     public int data;',
    ' *     public ListNode next;',
    ' *     public ListNode(int data = 0, ListNode next = null) { ... }',
    ' * }',
    ' */',
  ],
  BinaryNode: [
    '/**',
    ' * The test runner provides BinaryNode:',
    ' * public class BinaryNode {',
    ' *     public int data;',
    ' *     public BinaryNode left;',
    ' *     public BinaryNode right;',
    ' *     public BinaryNode(int data = 0, BinaryNode left = null, BinaryNode right = null) { ... }',
    ' * }',
    ' */',
  ],
  Interval: [
    '/**',
    ' * The test runner provides Interval:',
    ' * public class Interval {',
    ' *     public double start;',
    ' *     public double end;',
    ' *     public Interval(double start = 0, double end = 0) { ... }',
    ' * }',
    ' */',
  ],
  Item: [
    '/**',
    ' * The test runner provides Item:',
    ' * public class Item {',
    ' *     public int weight;',
    ' *     public int value;',
    ' *     public Item(int weight = 0, int value = 0) { ... }',
    ' * }',
    ' */',
  ],
};

const methodStub = (name: string, params: Param[], returns: string) => {
  const type = parseType(returns);
  return [
    `    ${methodSignature(name, params, returns)} {`,
    '        // Your solution here',
    ...(type.kind === 'void' ? [] : [`        return ${placeholder(type)};`]),
    '    }',
  ];
};

// Starting code for a lesson: the class and method the tests call, with a
// placeholder body
export const csharpStarter = (spec: LessonSpec) => {
  const used = runnerTypesIn(spec);
  const comments = RUNNER_TYPES.filter((type) => used.has(type)).flatMap((type) => [
    ...NODE_COMMENTS[type],
    '',
  ]);

  if (spec.kind === 'function') {
    const injected = spec.injected
      ? [
          `// ${nameIn(LANGUAGE, spec.injected.name)}(${spec.injected.params
            .map((param) => param.name)
            .join(', ')}) is provided by ${spec.injected.baseClass}`,
        ]
      : [];
    return [
      ...comments,
      ...injected,
      `public class Solution${spec.injected ? ` : ${spec.injected.baseClass}` : ''} {`,
      ...methodStub(nameIn(LANGUAGE, spec.entry, spec.names), spec.params, spec.returns),
      '}',
      '',
    ].join('\n');
  }

  return [
    ...comments,
    `public class ${spec.className} {`,
    `    public ${spec.className}(${parameters(spec.ctor)}) {`,
    '        // Set up your class here',
    '    }',
    ...spec.methods.flatMap((method) => [
      '',
      ...methodStub(nameIn(LANGUAGE, method.name, method.names), method.params, method.returns),
    ]),
    '}',
    '',
  ].join('\n');
};

// The SDK image's C# compiler and reference assemblies. Compiling with csc
// directly takes about 0.4 s on one CPU; `dotnet build` would restore a
// project first.
const CSC = 'dotnet /usr/share/dotnet/sdk/*/Roslyn/bincore/csc.dll';
const REFERENCES = '/usr/share/dotnet/packs/Microsoft.NETCore.App.Ref/*/ref/net10.0/*.dll';
// How `dotnet Main.dll` runs the program: on the shared .NET 10 runtime, with
// no background GC thread, and with culture-independent (ordinal) strings and
// number formats, as in Java and JavaScript
const RUNTIME_CONFIG = JSON.stringify({
  runtimeOptions: {
    tfm: 'net10.0',
    framework: { name: 'Microsoft.NETCore.App', version: '10.0.0' },
    configProperties: {
      'System.GC.Concurrent': false,
      'System.Globalization.Invariant': true,
      'System.Globalization.PredefinedCulturesOnly': false,
    },
  },
});

export const csharpRuntime: LanguageRuntime = {
  language: LANGUAGE,
  version: 'csharp-1',
  // The runtime and a 256 MB test stack need more than the interpreted languages
  limits: { cpuSeconds: 5, wallSeconds: 10, memoryKb: 512000, maxFileSizeKb: 1024 },
  docker: {
    image: 'mcr.microsoft.com/dotnet/sdk:10.0.402-noble',
    sourceFile: USER_FILE,
    compile: [
      `printf '%s' '${RUNTIME_CONFIG}' > Main.runtimeconfig.json &&`,
      CSC,
      '-nologo -noconfig -nostdlib -target:exe -langversion:latest',
      // Unoptimized, with a PDB: optimized code shares one block for every
      // index or divide-by-zero failure in a method, so stack traces give the
      // wrong line. The learner's code runs several times slower, still far
      // faster than the interpreted languages these tests are sized for.
      '-optimize- -debug:portable',
      // A learner's own copy of the injected helper hides it: make that an error
      '-warnaserror+:CS0108',
      '-main:__SkilledDriver.Program -out:Main.dll',
      `$(printf -- '-r:%s ' ${REFERENCES})`,
      USER_FILE,
    ].join(' '),
    run: 'dotnet Main.dll',
    env: {
      DOTNET_CLI_TELEMETRY_OPTOUT: '1',
      DOTNET_NOLOGO: '1',
      DOTNET_SKIP_FIRST_TIME_EXPERIENCE: '1',
      // No debugger or diagnostics server (and no socket for it in /tmp)
      DOTNET_EnableDiagnostics: '0',
      // W^X maps JIT code through a memory file that the output size limit
      // (RLIMIT_FSIZE) stops growing, and the runtime can't start
      DOTNET_EnableWriteXorExecute: '0',
    },
  },
  normalize: normalizeCode,
  assemble,
  diagnostics: (output, assembled, spec) => diagnosticsFor(spec)(output, assembled),
  starter: csharpStarter,
};
