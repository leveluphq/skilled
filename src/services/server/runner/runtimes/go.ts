import { CodingLanguage } from 'utils/constants/lesson';
import { nameIn, parameterName } from 'utils/shared/runner/naming';
import { parseType } from 'utils/shared/runner/spec';
import {
  DesignSpec,
  FunctionSpec,
  LessonSpec,
  Method,
  Param,
  TypeNode,
} from 'utils/shared/runner/types';
import preludes from '../preludes/preludes.gen';
import { blank, countLines, declarations, lex, normalizeText } from './lexer';
import { RUNNER_TYPES, runnerTypesIn } from './specTypes';
import { Assembled, Diagnostic, LanguageRuntime } from './types';

// Go, LeetCode-style: the learner writes a free function (`func countIslands`),
// or for a design lesson a struct with `func Constructor()` and exported
// methods. main.go is the package clause and the harness's imports, then a
// //line directive so the learner's line N is line N, their code, and the
// harness and a generated driver after it, each under a //line of its own.

const LANGUAGE = CodingLanguage.Go;

// The harness's packages, under __ aliases so they can't clash with the
// learner's imports or names. Keep in step with preludes/go.core.go.
const IMPORTS = [
  '__fmt "fmt"',
  '__os "os"',
  '__reflect "reflect"',
  '__runtime "runtime"',
  '__debug "runtime/debug"',
  '__strconv "strconv"',
  '__strings "strings"',
  '__syscall "syscall"',
  '__time "time"',
  '__unsafe "unsafe"',
].join('; ');

// The lines before the learner's first
const HEADER = ['//line harness.go:1', `package main; import (${IMPORTS})`, '//line main.go:1:1'];

// Go's predeclared names the harness and drivers rely on. A learner who
// declares one at the top level breaks the harness, which can't reach the
// builtin any other way. (The harness never uses min or max, which learners
// often write themselves.)
const BUILTINS_USED = new Set([
  'any',
  'append',
  'bool',
  'byte',
  'error',
  'false',
  'float64',
  'int',
  'int64',
  'len',
  'make',
  'nil',
  'panic',
  'recover',
  'rune',
  'string',
  'true',
  'uint64',
  'uintptr',
]);

type Scalar = 'int' | 'long' | 'double' | 'bool' | 'string' | 'char';

// char is a byte, as on LeetCode; the lessons' characters are ASCII
const SCALAR: Record<Scalar, string> = {
  int: 'int',
  long: 'int64',
  double: 'float64',
  bool: 'bool',
  string: 'string',
  char: 'byte',
};
const SCALAR_IN: Record<Scalar, string> = {
  int: '__jInt',
  long: '__jLong',
  double: '__jDouble',
  bool: '__jBool',
  string: '__jString',
  char: '__jChar',
};
const CONVERTER: Record<string, string> = {
  ListNode: '__jList',
  BinaryNode: '__jTree',
  BinaryNodeRef: '__jTree',
  Interval: '__jInterval',
  Item: '__jItem',
};

// Types where nil already means null
const nilable = (node: TypeNode) =>
  ['array', 'map', 'ListNode', 'BinaryNode', 'BinaryNodeRef'].includes(node.kind);

// The Go type for a neutral type
export const goType = (node: TypeNode): string => {
  switch (node.kind) {
    case 'scalar':
      return SCALAR[node.name];
    case 'array':
      return `[]${goType(node.of)}`;
    case 'map':
      return `map[string]${goType(node.of)}`;
    case 'nullable':
      return nilable(node.of) ? goType(node.of) : `*${goType(node.of)}`;
    case 'ListNode':
      return '*ListNode';
    case 'BinaryNode':
    case 'BinaryNodeRef':
      return '*BinaryNode';
    default:
      return node.kind;
  }
};

// A function (func(any) T) converting a parsed JSON value to the Go type
const converter = (node: TypeNode): string => {
  switch (node.kind) {
    case 'scalar':
      return SCALAR_IN[node.name];
    case 'array':
      return `__jArr(${converter(node.of)})`;
    case 'map':
      return `__jMap(${converter(node.of)})`;
    case 'nullable':
      if (CONVERTER[node.of.kind] && nilable(node.of)) {
        return converter(node.of);
      }
      return `${nilable(node.of) ? '__jOrNil' : '__jPtr'}(${converter(node.of)})`;
    default:
      if (CONVERTER[node.kind]) {
        return CONVERTER[node.kind];
      }
      throw new Error(`Go can't take a ${node.kind}`);
  }
};

// What the JSON writer can't tell from a returned value's Go type: where nil
// is null rather than empty, and where bytes and runes are characters. Null
// when the defaults (empty, numbers) are right.
const shape = (node: TypeNode): string | null => {
  const base = node.kind === 'nullable' ? node.of : node;
  const of = base.kind === 'array' || base.kind === 'map' ? shape(base.of) : null;
  const fields = [
    // A nil pointer is always null, and an empty list or tree always []
    ...(node.kind === 'nullable' && (base.kind === 'array' || base.kind === 'map')
      ? ['nullable: true']
      : []),
    ...(base.kind === 'scalar' && base.name === 'char' ? ['chars: true'] : []),
    ...(of ? [`of: ${of}`] : []),
  ];
  return fields.length ? `&__shape{${fields.join(', ')}}` : null;
};

// A returned value, ready for the JSON writer. Anything else is written as it
// is, so a function may return []int64 or [][]int32 where the lesson says int[].
const toJson = (node: TypeNode, expr: string) => {
  if (node.kind === 'BinaryNodeRef') {
    return `__ref(${expr})`;
  }
  const shaped = shape(node);
  return shaped ? `__shaped{${expr}, ${shaped}}` : `any(${expr})`;
};

const params = (list: Param[]) =>
  list.map((param) => `${parameterName(LANGUAGE, param.name)} ${goType(parseType(param.type))}`);

const returnsSuffix = (returns: string) => {
  const type = parseType(returns);
  return type.kind === 'void' ? '' : ` ${goType(type)}`;
};

// Go methods are exported, as on LeetCode: getStackMax is GetStackMax
const methodName = (method: Method) =>
  (method.names && method.names[LANGUAGE]) ||
  method.name.charAt(0).toUpperCase() + method.name.slice(1);

const methodSignature = (className: string, method: Method) =>
  `func (this *${className}) ${methodName(method)}(${params(method.params).join(', ')})${returnsSuffix(
    method.returns,
  )}`;

const constructorSignature = (spec: DesignSpec) =>
  `func Constructor(${params(spec.ctor).join(', ')}) ${spec.className}`;

// What the tests call, for "your code doesn't match" messages
export const goSignature = (spec: LessonSpec) => {
  if (spec.kind === 'function') {
    return `func ${nameIn(LANGUAGE, spec.entry, spec.names)}(${params(spec.params).join(
      ', ',
    )})${returnsSuffix(spec.returns)}`;
  }

  return [
    `type ${spec.className} struct`,
    constructorSignature(spec),
    ...spec.methods.map((method) => methodSignature(spec.className, method)),
  ].join('\n');
};

// The function the tests provide, with the test's hidden values as locals of
// the names the spec's body uses
const injectedFunction = (spec: FunctionSpec) => {
  const { injected } = spec;

  if (!injected) {
    return [];
  }

  const body = injected.body[LANGUAGE] || injected.body[CodingLanguage.Javascript];

  if (!body) {
    throw new Error(`The injected ${injected.name} has no Go body`);
  }

  return [
    `func ${injected.name}(${params(injected.params).join(', ')})${returnsSuffix(
      injected.returns,
    )} {`,
    ...(spec.hidden || []).flatMap((param, i) => {
      const name = parameterName(LANGUAGE, param.name);
      return [`\t${name} := __hidden${i}`, `\t_ = ${name}`];
    }),
    `\t${body}`,
    '}',
    '',
  ];
};

const functionDriver = (spec: FunctionSpec) => {
  const hidden = spec.hidden || [];
  const call = `${nameIn(LANGUAGE, spec.entry, spec.names)}(${spec.params
    .map((_param, i) => `__a${i}`)
    .join(', ')})`;
  const argsList = `__argsOf(__case, "args", ${spec.params.length})`;

  return [
    ...hidden.map((param, i) => `var __hidden${i} ${goType(parseType(param.type))}`),
    ...(hidden.length ? [''] : []),
    ...injectedFunction(spec),
    'func __test(__case map[string]any) any {',
    spec.params.length ? `\t__args := ${argsList}` : `\t${argsList}`,
    ...spec.params.map(
      (param, i) => `\t__a${i} := ${converter(parseType(param.type))}(__args[${i}])`,
    ),
    ...(hidden.length
      ? [
          `\t__hidden := __argsOf(__case, "hidden", ${hidden.length})`,
          ...hidden.map(
            (param, i) => `\t__hidden${i} = ${converter(parseType(param.type))}(__hidden[${i}])`,
          ),
        ]
      : []),
    '\t__tic()',
    `\t__r := ${toJson(parseType(spec.returns), call)}`,
    '\t__toc()',
    '\treturn __r',
    '}',
  ];
};

const designDriver = (spec: DesignSpec) => {
  const ctor = spec.ctor.map((param) => parseType(param.type));
  const ctorList = `__argsOf(__case, "ctorArgs", ${ctor.length})`;
  const cases = spec.methods.flatMap((method) => {
    const returns = parseType(method.returns);
    const args = method.params.map(
      (param, i) => `${converter(parseType(param.type))}(__op.args[${i}])`,
    );
    const call = `__o.${methodName(method)}(${args.join(', ')})`;

    return [
      `\t\tcase ${JSON.stringify(method.name)}:`,
      `\t\t\t__opArity(__op, ${method.params.length})`,
      ...(returns.kind === 'void'
        ? [`\t\t\t${call}`, '\t\t\t__out = append(__out, nil)']
        : [`\t\t\t__out = append(__out, ${toJson(returns, call)})`]),
    ];
  });

  return [
    'func __test(__case map[string]any) any {',
    ctor.length ? `\t__ctor := ${ctorList}` : `\t${ctorList}`,
    ...ctor.map((type, i) => `\t__c${i} := ${converter(type)}(__ctor[${i}])`),
    '\t__ops := __opsOf(__case["ops"])',
    '\t__out := make([]any, 0, len(__ops))',
    '\t__tic()',
    `\t__o := Constructor(${ctor.map((_type, i) => `__c${i}`).join(', ')})`,
    '\tfor __k, __op := range __ops {',
    '\t\t__opAt(__k, __op.name)',
    '\t\tswitch __op.name {',
    ...cases,
    '\t\tdefault:',
    '\t\t\tpanic(__unknownOp(__op.name))',
    '\t\t}',
    '\t}',
    '\t__toc()',
    '\t__opAt(-1, "")',
    '\treturn __out',
    '}',
  ];
};

const LEX_OPTIONS = { backquoteStrings: true };

// Only edits that keep every line where it was: no BOM, LF endings, a blanked
// `package` clause (the file has its own), and a top-level `func main` renamed
// to `func _` (the driver has the program's main; `_` keeps the columns)
const normalizeCode = (code: string) => {
  let text = normalizeText(code);
  const { identifiers } = lex(text, LEX_OPTIONS);
  const edits: { start: number; end: number; replacement: string | null }[] = [];

  identifiers.forEach((token, k) => {
    const next = identifiers[k + 1];

    if (token.depth !== 0 || !next) {
      return;
    }

    if (token.text === 'package') {
      const semicolon = /^[ \t]*;/.exec(text.slice(next.end));
      edits.push({
        start: token.start,
        end: next.end + (semicolon ? semicolon[0].length : 0),
        replacement: null,
      });
    } else if (
      token.text === 'func' &&
      next.text === 'main' &&
      /^\s+$/.test(text.slice(token.end, next.start)) &&
      /^\s*\(/.test(text.slice(next.end))
    ) {
      edits.push({ start: next.start, end: next.end, replacement: '_   ' });
    }
  });

  // Back to front, so earlier positions stay valid
  edits.reverse().forEach(({ start, end, replacement }) => {
    text =
      replacement === null
        ? blank(text, start, end)
        : text.slice(0, start) + replacement + text.slice(end);
  });

  return { code: text, errors: [] };
};

const assemble = (code: string, spec: LessonSpec): Assembled => {
  const used = runnerTypesIn(spec);
  const userLines = countLines(code);
  const driver = spec.kind === 'function' ? functionDriver(spec) : designDriver(spec);

  const source = [
    ...HEADER,
    code,
    '//line harness.go:1',
    preludes['go.core.go'],
    ...RUNNER_TYPES.filter((type) => used.has(type)).map((type) => preludes[`go.${type}.go`]),
    '//line driver.go:1',
    ...driver,
    '',
    'func main() {',
    `\t__run(__test, ${userLines})`,
    '}',
    '',
  ].join('\n');

  return { source, userLines, lineOffset: HEADER.length };
};

interface GoError {
  file: string;
  line: number;
  column: number | null;
  message: string;
}

// go build prints "main.go:7:21: message" (the file names are the //line
// directives'), sometimes with the real place in brackets after the position,
// and notes on lines that start with a tab
const parseGo = (output: string): GoError[] =>
  output.split('\n').flatMap((text) => {
    const match =
      /^(?:\S*\/)?(main|harness|driver)\.go:(\d+)(?::(\d+))?(?:\[[^\]]*\])?: (.*)$/.exec(text);

    if (!match || match[4].trim() === 'too many errors') {
      return [];
    }

    return [
      {
        file: match[1],
        line: Number(match[2]),
        column: match[3] ? Number(match[3]) : null,
        message: match[4].replace(/\[[^\]\s]*\.go:\d+:\d+\]/g, '').trim(),
      },
    ];
  });

// Go counts columns in bytes; the editor counts characters
const characterColumn = (lineText: string, byteColumn: number) =>
  Buffer.from(lineText, 'utf8')
    .subarray(0, byteColumn - 1)
    .toString('utf8').length + 1;

// Errors in the learner's code are shown where they are. Errors only in the
// harness mean the code doesn't fit around it; say why in their terms.
const diagnosticsFor =
  (spec: LessonSpec) =>
  (output: string, assembled: Assembled): Diagnostic[] => {
    const errors = parseGo(output);
    const userCode = assembled.source
      .split('\n')
      .slice(assembled.lineOffset, assembled.lineOffset + assembled.userLines);
    const own = errors.filter(
      (error) => error.file === 'main' && error.line >= 1 && error.line <= assembled.userLines,
    );

    if (own.length) {
      return own.map(({ line, column, message }) => ({
        line,
        column: column === null ? null : characterColumn(userCode[line - 1], column),
        message,
      }));
    }

    if (!errors.length) {
      return output.trim()
        ? [{ line: null, column: null, message: output.trim().slice(0, 500) }]
        : [];
    }

    const lexed = lex(userCode.join('\n'), LEX_OPTIONS);

    if (lexed.unterminated) {
      return [
        {
          line: lexed.unterminated.line,
          column: null,
          message: `This ${lexed.unterminated.what} is never closed`,
        },
      ];
    }

    if (lexed.depth > 0) {
      const opened = lexed.openLines[lexed.openLines.length - 1];
      return [
        {
          line: opened,
          column: null,
          message: 'A `}` is missing: the `{` on this line is never closed',
        },
      ];
    }

    if (lexed.depth < 0) {
      return [{ line: null, column: null, message: 'Your code has a `}` with no `{` to close' }];
    }

    const redefined = redefinition(spec, errors, lexed);

    if (redefined) {
      return [{ line: null, column: null, message: redefined }];
    }

    const needed =
      spec.kind === 'function' ? nameIn(LANGUAGE, spec.entry, spec.names) : 'Constructor';

    if (errors.some((error) => error.file !== 'main' && error.message === `undefined: ${needed}`)) {
      return [
        {
          line: null,
          column: null,
          message: `Your code needs a \`func ${needed}\`, as in the starting code`,
        },
      ];
    }

    return [
      {
        line: null,
        column: null,
        message: `Your code doesn't match what the tests call. They expect:\n${goSignature(spec)}`,
      },
    ];
  };

// A name the learner declared that the harness declares or relies on
const redefinition = (
  spec: LessonSpec,
  errors: GoError[],
  lexed: ReturnType<typeof lex>,
): string | null => {
  const provided = spec.kind === 'function' && spec.injected ? spec.injected.name : null;

  for (const error of errors) {
    const method = /^method (\w+)\.(\w+) already declared/.exec(error.message);

    if (method) {
      return `The test runner gives \`${method[1]}\` its own \`${method[2]}\` method, so remove yours`;
    }

    const redeclared = /^(\w+) redeclared in this block/.exec(error.message);

    if (redeclared) {
      const name = redeclared[1];

      if ((RUNNER_TYPES as string[]).includes(name)) {
        return `\`${name}\` is provided by the test runner, so remove your own \`type ${name}\``;
      }
      if (name === provided) {
        return `\`${name}\` is provided by the test runner, so remove your own \`func ${name}\``;
      }
      return `Rename your \`${name}\`: the test runner uses that name`;
    }
  }

  // A builtin the harness relies on, declared at the top level
  const shadowed = declarations(
    lexed,
    ['func', 'type', 'var', 'const'],
    (depth) => depth === 0,
  ).find((declaration) => BUILTINS_USED.has(declaration.name));

  return shadowed
    ? `Rename your \`${shadowed.name}\`: the test runner uses Go's own \`${shadowed.name}\``
    : null;
};

// What a function returns in starting code: a value of the right type that
// fails the tests
const placeholder = (type: TypeNode): string => {
  switch (type.kind) {
    case 'scalar':
      return { int: '0', long: '0', double: '0', bool: 'false', char: "' '", string: '""' }[
        type.name
      ];
    case 'Interval':
    case 'Item':
      return `${type.kind}{}`;
    default:
      return 'nil';
  }
};

const NODE_COMMENTS: Record<string, string[]> = {
  ListNode: [
    '/**',
    ' * The test runner provides ListNode:',
    ' * type ListNode struct {',
    ' *     Data int',
    ' *     Next *ListNode',
    ' * }',
    ' */',
  ],
  BinaryNode: [
    '/**',
    ' * The test runner provides BinaryNode:',
    ' * type BinaryNode struct {',
    ' *     Data  int',
    ' *     Left  *BinaryNode',
    ' *     Right *BinaryNode',
    ' * }',
    ' */',
  ],
  Interval: [
    '/**',
    ' * The test runner provides Interval:',
    ' * type Interval struct {',
    ' *     Start float64',
    ' *     End   float64',
    ' * }',
    ' */',
  ],
  Item: [
    '/**',
    ' * The test runner provides Item:',
    ' * type Item struct {',
    ' *     Weight int',
    ' *     Value  int',
    ' * }',
    ' */',
  ],
};

const body = (returns: string) => {
  const type = parseType(returns);
  return [
    '\t// Your solution here',
    ...(type.kind === 'void' ? [] : [`\treturn ${placeholder(type)}`]),
    '}',
  ];
};

// Starting code for a lesson: the function (or type and methods) the tests
// call, with a placeholder body
export const goStarter = (spec: LessonSpec) => {
  const used = runnerTypesIn(spec);
  const comments = RUNNER_TYPES.filter((type) => used.has(type)).flatMap((type) => [
    ...NODE_COMMENTS[type],
    '',
  ]);

  if (spec.kind === 'function') {
    const { injected } = spec;
    const provided = injected
      ? [
          `// The test runner provides func ${injected.name}(${params(injected.params).join(
            ', ',
          )})${returnsSuffix(injected.returns)}`,
        ]
      : [];
    return [...comments, ...provided, `${goSignature(spec)} {`, ...body(spec.returns), ''].join(
      '\n',
    );
  }

  return [
    ...comments,
    `type ${spec.className} struct {`,
    '\t// Your fields here',
    '}',
    '',
    `${constructorSignature(spec)} {`,
    '\t// Set up your struct here',
    `\treturn ${spec.className}{}`,
    '}',
    ...spec.methods.flatMap((method) => [
      '',
      `${methodSignature(spec.className, method)} {`,
      ...body(method.returns),
    ]),
    '',
  ].join('\n');
};

export const goRuntime: LanguageRuntime = {
  language: LANGUAGE,
  version: 'go-1',
  limits: { cpuSeconds: 5, wallSeconds: 10, memoryKb: 256000, maxFileSizeKb: 1024 },
  docker: {
    // The official image with the standard library already compiled
    // (docker/runner/go/Dockerfile; GOCACHE is set there). A run compiles
    // only main.go, in about 0.2 s and 60 MB, so it compiles in the run's own
    // container. Cold, go build takes 4-5 s and up to 320 MB.
    image: 'skilled-runner/go:1.27.2',
    sourceFile: 'main.go',
    compile: 'go build -o main main.go',
    run: './main',
  },
  normalize: normalizeCode,
  assemble,
  diagnostics: (output, assembled, spec) => diagnosticsFor(spec)(output, assembled),
  starter: goStarter,
};
