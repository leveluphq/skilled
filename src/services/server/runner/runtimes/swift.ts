import { CodingLanguage } from 'utils/constants/lesson';
import { nameIn } from 'utils/shared/runner/naming';
import { parseType } from 'utils/shared/runner/spec';
import { DesignSpec, FunctionSpec, LessonSpec, Param, TypeNode } from 'utils/shared/runner/types';
import preludes from '../preludes/preludes.gen';
import { blank, countLines, lex, normalizeText } from './lexer';
import { RUNNER_TYPES, runnerTypesIn } from './specTypes';
import { Assembled, Diagnostic, LanguageRuntime } from './types';

// Swift, LeetCode-style: the learner writes `class Solution` (or the lesson's
// class). Unlike Java, the harness comes first in main.swift: top-level code
// runs in order, and the harness must read stdin before the learner's
// top-level code could. #sourceLocation directives name the learner's part
// Main.swift from line 1, so their line N is reported as Main.swift:N.

const LANGUAGE = CodingLanguage.Swift;

// The file name the compiler reports for the learner's code. The physical file
// is main.swift, so an error the compiler places at the file's real end can't
// be mistaken for one of theirs.
const USER_FILE = 'Main.swift';

type Scalar = 'int' | 'long' | 'double' | 'bool' | 'string' | 'char';

// int is Swift's Int (64-bit), as on LeetCode; inputs fit 32 bits anyway
const SCALAR: Record<Scalar, string> = {
  int: 'Int',
  long: 'Int',
  double: 'Double',
  bool: 'Bool',
  char: 'Character',
  string: 'String',
};

// Reserved words, which need backquotes as names
const KEYWORDS = new Set(
  (
    'associatedtype class deinit enum extension fileprivate func import init inout internal let ' +
    'open operator private precedencegroup protocol public rethrows static struct subscript ' +
    'typealias var break case catch continue default defer do else fallthrough for guard if in ' +
    'repeat return throw switch where while Any as await false is nil self Self super throws ' +
    'true try'
  ).split(' '),
);

const ident = (name: string) => (KEYWORDS.has(name) ? `\`${name}\`` : name);

// The Swift type for a neutral type. Nodes are always optional, as on
// LeetCode (`ListNode?`), so an empty list or tree is nil.
export const swiftType = (node: TypeNode): string => {
  switch (node.kind) {
    case 'scalar':
      return SCALAR[node.name];
    case 'array':
      return `[${swiftType(node.of)}]`;
    case 'map':
      return `[String: ${swiftType(node.of)}]`;
    case 'nullable': {
      const inner = swiftType(node.of);
      return inner.endsWith('?') ? inner : `${inner}?`;
    }
    case 'ListNode':
      return 'ListNode?';
    case 'BinaryNode':
    case 'BinaryNodeRef':
      return 'BinaryNode?';
    case 'void':
      return 'Void';
    default:
      return node.kind;
  }
};

// What the tests call, for "your code doesn't match" messages and starters.
// Parameters are unlabeled, as on LeetCode; the driver calls the method as a
// function value, so labels don't matter.
const methodSignature = (name: string, params: Param[], returns: string) => {
  const type = parseType(returns);
  return `func ${ident(name)}(${params
    .map((param) => `_ ${ident(param.name)}: ${swiftType(parseType(param.type))}`)
    .join(', ')})${type.kind === 'void' ? '' : ` -> ${swiftType(type)}`}`;
};

const initSignature = (params: Param[]) =>
  `init(${params
    .map((param) => `_ ${ident(param.name)}: ${swiftType(parseType(param.type))}`)
    .join(', ')})`;

export const swiftSignature = (spec: LessonSpec) => {
  if (spec.kind === 'function') {
    const extend = spec.injected ? `: ${spec.injected.baseClass}` : '';
    return `class Solution${extend} {\n    ${methodSignature(
      nameIn(LANGUAGE, spec.entry, spec.names),
      spec.params,
      spec.returns,
    )}\n}`;
  }

  return [
    `class ${spec.className} {`,
    `    ${initSignature(spec.ctor)}`,
    ...spec.methods.map(
      (method) =>
        `    ${methodSignature(nameIn(LANGUAGE, method.name, method.names), method.params, method.returns)}`,
    ),
    '}',
  ].join('\n');
};

// Decodes a JSON value as the declared type, before the learner's call
const declare = (type: TypeNode, name: string, expr: string) =>
  `let ${name}: ${swiftType(type)} = try __in(${expr})`;

// A call through __callN, which times it. A method is passed as a function
// value (`__s.countIslands`), so its parameter types must be the ones the
// tests pass while its return type may be anything the harness can report.
const call = (target: string, args: string[]) =>
  `try __call${args.length}(${[target, ...args].join(', ')})`;

const MAX_ARGS = 4;

const checkArity = (count: number, what: string) => {
  if (count > MAX_ARGS) {
    throw new Error(`Swift's harness calls at most ${MAX_ARGS} parameters; ${what} has ${count}`);
  }
};

// Where a hidden value is stored: on the injected base class, which the
// learner's Solution extends, or else on Solution itself
const hiddenOwner = (spec: FunctionSpec) => (spec.injected ? spec.injected.baseClass : 'Solution');

const injectedClass = (spec: FunctionSpec) => {
  const { injected } = spec;

  if (!injected) {
    return [];
  }

  const body = injected.body[LANGUAGE] || injected.body[CodingLanguage.Javascript];

  if (!body) {
    throw new Error(`The injected ${injected.name} has no Swift body`);
  }

  const returns = parseType(injected.returns);

  return [
    `class ${injected.baseClass} {`,
    // Read-only to the learner's code, which sees them as properties
    ...(spec.hidden || []).flatMap((param) => {
      const type = swiftType(parseType(param.type));
      return [
        `    static var __${param.name}: ${type}? = nil`,
        `    var ${ident(param.name)}: ${type} { return ${injected.baseClass}.__${param.name}! }`,
      ];
    }),
    // final: a learner's own version can't replace the tests' one
    `    final func ${ident(injected.name)}(${injected.params
      .map((param) => `_ ${ident(param.name)}: ${swiftType(parseType(param.type))}`)
      .join(', ')})${returns.kind === 'void' ? '' : ` -> ${swiftType(returns)}`} {`,
    `        ${body}`,
    '    }',
    '}',
    '',
  ];
};

const functionDriver = (spec: FunctionSpec) => {
  const hidden = spec.hidden || [];
  const returns = parseType(spec.returns);
  const args = spec.params.map((_param, i) => `__a${i}`);
  checkArity(args.length, spec.entry);

  return [
    ...injectedClass(spec),
    '__H.run(userLines: __USER_LINES__) { __case in',
    `    let __args = try __H.args(__case, "args", ${spec.params.length})`,
    ...spec.params.map(
      (param, i) => `    ${declare(parseType(param.type), `__a${i}`, `__args[${i}]`)}`,
    ),
    ...(hidden.length
      ? [
          `    let __hidden = try __H.args(__case, "hidden", ${hidden.length})`,
          ...hidden.flatMap((param, i) => [
            `    ${declare(parseType(param.type), `__h${i}`, `__hidden[${i}]`)}`,
            `    ${hiddenOwner(spec)}.${spec.injected ? `__${param.name}` : ident(param.name)} = __h${i}`,
          ]),
        ]
      : []),
    '    let __s = Solution()',
    `    let __r = ${call(`__s.${ident(nameIn(LANGUAGE, spec.entry, spec.names))}`, args)}`,
    // A node of the input tree is reported as its data
    `    return ${returns.kind === 'BinaryNodeRef' ? '__ref(__r)' : 'try __json(__r)'}`,
    '}',
  ];
};

const designDriver = (spec: DesignSpec) => {
  const ctor = spec.ctor.map((param) => parseType(param.type));
  checkArity(ctor.length, `${spec.className}'s constructor`);

  const cases = spec.methods.flatMap((method) => {
    const returns = parseType(method.returns);
    const params = method.params.map((_param, i) => `__p${i}`);
    checkArity(params.length, method.name);
    const invoke = call(`__o.${ident(nameIn(LANGUAGE, method.name, method.names))}`, params);

    return [
      `        case ${JSON.stringify(method.name)}:`,
      `            try __H.opArity(__op, ${method.params.length})`,
      ...method.params.map(
        (param, i) => `            ${declare(parseType(param.type), `__p${i}`, `__op.args[${i}]`)}`,
      ),
      ...(returns.kind === 'void'
        ? [`            _ = ${invoke}`, '            __out.append(.null)']
        : returns.kind === 'BinaryNodeRef'
          ? [`            __out.append(__ref(${invoke}))`]
          : [`            __out.append(try __json(${invoke}))`]),
    ];
  });

  return [
    '__H.run(userLines: __USER_LINES__) { __case in',
    `    let __ctor = try __H.args(__case, "ctorArgs", ${ctor.length})`,
    ...ctor.map((type, i) => `    ${declare(type, `__c${i}`, `__ctor[${i}]`)}`),
    '    let __ops = try __H.ops(__case)',
    `    let __o = ${call(
      `${spec.className}.init`,
      ctor.map((_type, i) => `__c${i}`),
    )}`,
    '    var __out: [__J] = []',
    '    for (__k, __op) in __ops.enumerated() {',
    '        __H.opAt(__k, __op.name)',
    '        switch __op.name {',
    ...cases,
    '        default:',
    '            throw __H.unknownOp(__op.name)',
    '        }',
    '    }',
    '    __H.opAt(-1, "")',
    '    return .arr(__out)',
    '}',
  ];
};

const LEX_OPTIONS = { nestedComments: true, textBlocks: true, charLiterals: false };

// Only edits that keep every line where it was: no BOM, LF endings, and
// blanked text that can't work in the combined file: a #sourceLocation (it
// would rename the harness's lines), a shebang (only allowed on the file's
// first line) and @main (not allowed with top-level code). `import Darwin`, a
// macOS habit, becomes Linux's `import Glibc`.
const normalizeCode = (code: string) => {
  let text = normalizeText(code);

  if (text.startsWith('#!')) {
    text = blank(text, 0, text.indexOf('\n'));
  }

  const { identifiers } = lex(text, LEX_OPTIONS);

  // Back to front, so earlier positions stay valid
  identifiers
    .map((token, k) => ({ token, previous: identifiers[k - 1] }))
    .reverse()
    .forEach(({ token, previous }) => {
      const before = text[token.start - 1];

      if (token.text === 'sourceLocation' && before === '#') {
        const close = text.indexOf(')', token.end);
        const lineEnd = text.indexOf('\n', token.end);
        const end = close >= 0 && close < lineEnd ? close + 1 : lineEnd;
        text = blank(text, token.start - 1, end);
      } else if (token.text === 'main' && before === '@') {
        text = blank(text, token.start - 1, token.end);
      } else if (
        token.text === 'Darwin' &&
        previous &&
        previous.text === 'import' &&
        previous.line === token.line
      ) {
        text = `${text.slice(0, token.start)}Glibc ${text.slice(token.end)}`;
      }
    });

  return { code: text, errors: [] };
};

const assemble = (code: string, spec: LessonSpec): Assembled => {
  const used = runnerTypesIn(spec);
  const userLines = countLines(code);
  const driver = spec.kind === 'function' ? functionDriver(spec) : designDriver(spec);

  const source = [
    '#sourceLocation(file: "harness.swift", line: 1)',
    preludes['swift.core.swift'],
    ...RUNNER_TYPES.filter((type) => used.has(type)).map((type) => preludes[`swift.${type}.swift`]),
    `#sourceLocation(file: "${USER_FILE}", line: 1)`,
    code,
    '#sourceLocation(file: "driver.swift", line: 1)',
    '// ==== driver ====',
    ...driver.map((line) => line.replace('__USER_LINES__', String(userLines))),
    '',
  ].join('\n');

  // The compiler reports the learner's lines by the #sourceLocation numbering,
  // so they need no offset
  return { source, userLines, lineOffset: 0 };
};

interface SwiftcError {
  file: string;
  line: number;
  column: number | null;
  message: string;
}

// swiftc -diagnostic-style llvm prints "Main.swift:7:18: error: cannot find
// operator '+*' in scope", then the source line and a caret
const parseSwiftc = (output: string): SwiftcError[] =>
  output
    .split('\n')
    .map((text) => /^(.*?):(\d+):(\d+): error: (.*)$/.exec(text))
    .filter((match): match is RegExpExecArray => match !== null)
    .map((match) => ({
      file: match[1].split('/').pop() as string,
      line: Number(match[2]),
      column: Number(match[3]) > 0 ? Number(match[3]) : null,
      message: match[4].trim(),
    }));

// The types the tests provide in this lesson, which the learner mustn't declare
const providedTypes = (spec: LessonSpec): string[] => [
  ...RUNNER_TYPES.filter((type) => runnerTypesIn(spec).has(type)),
  ...(spec.kind === 'function' && spec.injected ? [spec.injected.baseClass] : []),
];

const redefined = (message: string, provided: string[]) => {
  const match = /^invalid redeclaration of '(\w+)'|^'(\w+)' is ambiguous for type lookup/.exec(
    message,
  );
  const name = match && (match[1] || match[2]);
  return name && provided.includes(name) ? name : null;
};

// The learner's top-level code trapped before any test ran (diagnostics get
// the program's stderr then): the runtime's message, without the
// backtracer's status lines, and its line when the runtime names it
// ("main/Main.swift:3: Fatal error: Unexpectedly found nil ...")
const runtimeCrash = (output: string, userLines: number): Diagnostic | null => {
  const match = output
    .split('\n')
    .map((text) =>
      /^(?:(\S*?)\.swift:(\d+): )?((?:Fatal error|Precondition failed|Assertion failed|Could not cast value)\b.*)$/.exec(
        text,
      ),
    )
    .find(Boolean);

  if (!match) {
    return null;
  }

  const line = Number(match[2]);
  const ownLine = /(^|\/)Main$/.test(match[1] || '') && line >= 1 && line <= userLines;
  return {
    line: ownLine ? line : null,
    column: null,
    message: match[3].replace(/ \(0x[0-9a-f]+\)/g, '').slice(0, 500),
  };
};

const redefinedMessage = (name: string) =>
  `\`${name}\` is provided by the test runner, so remove your own \`class ${name}\``;

// Errors in the learner's code are shown where they are. Errors only in the
// harness mean the code doesn't fit around it; say why in their terms.
const diagnosticsFor =
  (spec: LessonSpec) =>
  (output: string, assembled: Assembled): Diagnostic[] => {
    const errors = parseSwiftc(output);
    const provided = providedTypes(spec);
    const own = errors.filter(
      (error) => error.file === USER_FILE && error.line >= 1 && error.line <= assembled.userLines,
    );

    if (own.length) {
      // A redeclared runner type also makes every use of it ambiguous; the
      // declaration is the one to point at
      const declared = own.filter(
        (error) =>
          /^invalid redeclaration/.test(error.message) && redefined(error.message, provided),
      );
      return (declared.length ? declared : own).map(({ line, column, message }) => {
        const name = redefined(message, provided);
        return { line, column, message: name ? redefinedMessage(name) : message };
      });
    }

    if (!errors.length) {
      const crash = runtimeCrash(output, assembled.userLines);
      if (crash) {
        return [crash];
      }
      return output.trim()
        ? [{ line: null, column: null, message: output.trim().slice(0, 500) }]
        : [];
    }

    const lines = assembled.source.split('\n');
    const start = lines.indexOf(`#sourceLocation(file: "${USER_FILE}", line: 1)`) + 1;
    const code = lines.slice(start, start + assembled.userLines).join('\n');
    const lexed = lex(code, LEX_OPTIONS);

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

    const duplicate = errors.map((error) => redefined(error.message, provided)).find(Boolean);

    if (duplicate) {
      return [{ line: null, column: null, message: redefinedMessage(duplicate) }];
    }

    const className = spec.kind === 'function' ? 'Solution' : spec.className;

    if (
      errors.some((error) =>
        new RegExp(`^cannot find (type )?'${className}' in scope`).test(error.message),
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
        message: `Your code doesn't match what the tests call. They expect:\n${swiftSignature(spec)}`,
      },
    ];
  };

// What a method returns in starting code: a value of the right type that
// fails the tests
const placeholder = (type: TypeNode): string => {
  switch (type.kind) {
    case 'scalar':
      return { int: '0', long: '0', double: '0', bool: 'false', char: '" "', string: '""' }[
        type.name
      ];
    case 'array':
      return '[]';
    case 'map':
      return '[:]';
    case 'Interval':
      return 'Interval(0, 0)';
    case 'Item':
      return 'Item(0, 0)';
    default:
      return 'nil';
  }
};

const NODE_COMMENTS: Record<string, string[]> = {
  ListNode: [
    '/**',
    ' * The test runner provides ListNode:',
    ' * class ListNode {',
    ' *     var data: Int',
    ' *     var next: ListNode?',
    ' *     init(_ data: Int) { self.data = data }',
    ' * }',
    ' */',
  ],
  BinaryNode: [
    '/**',
    ' * The test runner provides BinaryNode:',
    ' * class BinaryNode {',
    ' *     var data: Int',
    ' *     var left: BinaryNode?',
    ' *     var right: BinaryNode?',
    ' *     init(_ data: Int) { self.data = data }',
    ' * }',
    ' */',
  ],
  Interval: [
    '/**',
    ' * The test runner provides Interval:',
    ' * class Interval {',
    ' *     var start: Double',
    ' *     var end: Double',
    ' *     init(_ start: Double, _ end: Double) { ... }',
    ' * }',
    ' */',
  ],
  Item: [
    '/**',
    ' * The test runner provides Item:',
    ' * class Item {',
    ' *     var weight: Int',
    ' *     var value: Int',
    ' *     init(_ weight: Int, _ value: Int) { ... }',
    ' * }',
    ' */',
  ],
};

const methodStub = (name: string, params: Param[], returns: string) => {
  const type = parseType(returns);
  return [
    `    ${methodSignature(name, params, returns)} {`,
    '        // Your solution here',
    ...(type.kind === 'void' ? [] : [`        return ${placeholder(type)}`]),
    '    }',
  ];
};

// Starting code for a lesson: the class and method the tests call, with a
// placeholder body
export const swiftStarter = (spec: LessonSpec) => {
  const used = runnerTypesIn(spec);
  const comments = RUNNER_TYPES.filter((type) => used.has(type)).flatMap((type) => [
    ...NODE_COMMENTS[type],
    '',
  ]);

  if (spec.kind === 'function') {
    const injected = spec.injected
      ? [
          `// ${spec.injected.name}(${spec.injected.params
            .map((param) => param.name)
            .join(', ')}) is provided by ${spec.injected.baseClass}`,
        ]
      : [];
    return [
      ...comments,
      ...injected,
      `class Solution${spec.injected ? `: ${spec.injected.baseClass}` : ''} {`,
      ...methodStub(nameIn(LANGUAGE, spec.entry, spec.names), spec.params, spec.returns),
      '}',
      '',
    ].join('\n');
  }

  return [
    ...comments,
    `class ${spec.className} {`,
    `    ${initSignature(spec.ctor)} {`,
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

export const swiftRuntime: LanguageRuntime = {
  language: LANGUAGE,
  version: 'swift-1',
  // A test's process and the 256 MB stack it may fill need more than the
  // interpreted languages' 256 MB
  limits: { cpuSeconds: 5, wallSeconds: 10, memoryKb: 512000, maxFileSizeKb: 1024 },
  docker: {
    image: 'swift:6.4.1-noble',
    sourceFile: 'main.swift',
    // Swift 5 language mode: Swift 6 mode rejects the global and static
    // mutable state LeetCode-style code uses (a `static var memo`). -Onone
    // compiles fastest and keeps overflow and bounds checks readable; line
    // tables let the backtracer place a trap on the learner's line.
    compile:
      'swiftc -swift-version 5 -Onone -gline-tables-only -suppress-warnings -diagnostic-style llvm -o main main.swift',
    run: './main',
    // swiftc peaks around 115 MB, so it compiles in the run's container,
    // saving a container start
    env: {
      // A crash report per crashed test's process, as JSON in a file the
      // harness reads, not on stderr
      SWIFT_BACKTRACE:
        'enable=yes,interactive=no,color=no,threads=crashed,images=none,top=0,limit=32,format=json,output-to=/tmp/swift-crashes',
    },
  },
  normalize: normalizeCode,
  assemble,
  diagnostics: (output, assembled, spec) => diagnosticsFor(spec)(output, assembled),
  starter: swiftStarter,
};
