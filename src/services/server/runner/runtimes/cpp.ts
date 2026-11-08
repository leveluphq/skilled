import { CodingLanguage } from 'utils/constants/lesson';
import { nameIn } from 'utils/shared/runner/naming';
import { parseType } from 'utils/shared/runner/spec';
import { DesignSpec, FunctionSpec, LessonSpec, Param, TypeNode } from 'utils/shared/runner/types';
import preludes from '../preludes/preludes.gen';
import { countLines, lex, normalizeText } from './lexer';
import { RUNNER_TYPES, runnerTypesIn } from './specTypes';
import { Assembled, Diagnostic, LanguageRuntime } from './types';

// C++, LeetCode-style: the learner writes `class Solution { public: ... };`
// (or the lesson's class). The headers, `using namespace std;`, the harness
// and the runner types come first in main.cpp, then the learner's code after
// `#line 1 "solution.cpp"`, so their line N is solution.cpp:N in compiler
// errors, then the driver.

const LANGUAGE = CodingLanguage.Cpp;

// The file name the compiler gives the learner's code
const USER_FILE = 'solution.cpp';

type Scalar = 'int' | 'long' | 'double' | 'bool' | 'string' | 'char';

const SCALAR: Record<Scalar, string> = {
  int: 'int',
  long: 'long long',
  double: 'double',
  bool: 'bool',
  char: 'char',
  string: 'string',
};

const POINTERS = ['ListNode', 'BinaryNode', 'BinaryNodeRef'];

// The C++ type for a neutral type. `qualified` spells out std:: for the
// driver, which mustn't depend on the learner's `using`s.
export const cppType = (node: TypeNode, qualified = false): string => {
  const std = qualified ? 'std::' : '';

  switch (node.kind) {
    case 'scalar':
      return node.name === 'string' ? `${std}string` : SCALAR[node.name];
    case 'array':
      return `${std}vector<${cppType(node.of, qualified)}>`;
    case 'map':
      return `${std}unordered_map<${std}string, ${cppType(node.of, qualified)}>`;
    case 'nullable':
      // Pointers can already be null
      return POINTERS.includes(node.of.kind)
        ? cppType(node.of, qualified)
        : `${std}optional<${cppType(node.of, qualified)}>`;
    case 'ListNode':
      return 'ListNode*';
    case 'BinaryNode':
    case 'BinaryNodeRef':
      return 'BinaryNode*';
    default:
      return node.kind;
  }
};

// As LeetCode declares them: containers by reference, the rest by value
const parameter = (param: Param) => {
  const type = parseType(param.type);
  const byReference = type.kind === 'array' || type.kind === 'map';
  return `${cppType(type)}${byReference ? '&' : ''} ${param.name}`;
};

// What the tests call, for "your code doesn't match" messages and starters
const methodSignature = (name: string, params: Param[], returns: string) =>
  `${cppType(parseType(returns))} ${name}(${params.map(parameter).join(', ')})`;

export const cppSignature = (spec: LessonSpec) => {
  if (spec.kind === 'function') {
    return `class Solution {\npublic:\n    ${methodSignature(
      nameIn(LANGUAGE, spec.entry, spec.names),
      spec.params,
      spec.returns,
    )}\n};`;
  }

  return [
    `class ${spec.className} {`,
    'public:',
    `    ${spec.className}(${spec.ctor.map(parameter).join(', ')})`,
    ...spec.methods.map(
      (method) =>
        `    ${methodSignature(nameIn(LANGUAGE, method.name, method.names), method.params, method.returns)}`,
    ),
    '};',
  ].join('\n');
};

// The helper the tests provide (isBadVersion), a free function before the
// learner's code, and the hidden values it reads
const injectedFunction = (spec: LessonSpec) => {
  if (spec.kind !== 'function') {
    return [];
  }

  const hidden = spec.hidden || [];
  const { injected } = spec;
  const lines = hidden.length
    ? [
        'namespace __skh_hidden {',
        ...hidden.map((param) => `${cppType(parseType(param.type), true)} ${param.name}{};`),
        '}',
      ]
    : [];

  if (!injected) {
    return lines;
  }

  const body = injected.body[LANGUAGE] || injected.body[CodingLanguage.Javascript];

  if (!body) {
    throw new Error(`The injected ${injected.name} has no C++ body`);
  }

  return [
    ...lines,
    `${cppType(parseType(injected.returns), true)} ${injected.name}(${injected.params
      .map((param) => `${cppType(parseType(param.type), true)} ${param.name}`)
      .join(', ')}) {`,
    ...(hidden.length ? ['    using namespace __skh_hidden;'] : []),
    `    ${body}`,
    '}',
  ];
};

// Converts a test's JSON value to the parameter's C++ type
const declare = (type: TypeNode, name: string, json: string) =>
  `${cppType(type, true)} ${name} = __skh::from<${cppType(type, true)}>(${json});`;

// A returned value, as JSON. The writer takes whatever the learner returns
// that has a JSON form, so a method may return vector<int> or array<int, 2>
// where the spec says int[], or long long where it says int.
const report = (returns: TypeNode, value: string, out: string) =>
  returns.kind === 'BinaryNodeRef'
    ? `__skh::put_ref(${out}, ${value});`
    : `__skh::put(${out}, ${value});`;

const functionDriver = (spec: FunctionSpec) => {
  const hidden = spec.hidden || [];
  const call = `__s->${nameIn(LANGUAGE, spec.entry, spec.names)}(${spec.params
    .map((_param, i) => `__a${i}`)
    .join(', ')})`;

  return [
    'static std::string __skh_test(const __skh::JVal& __case) {',
    `    const __skh::JVal& __args = __skh::args(__case, "args", ${spec.params.length});`,
    ...spec.params.map(
      (param, i) => `    ${declare(parseType(param.type), `__a${i}`, `__args[${i}]`)}`,
    ),
    ...(hidden.length
      ? [
          `    const __skh::JVal& __hidden = __skh::args(__case, "hidden", ${hidden.length});`,
          ...hidden.map(
            (param, i) =>
              `    __skh_hidden::${param.name} = __skh::from<${cppType(parseType(param.type), true)}>(__hidden[${i}]);`,
          ),
        ]
      : []),
    '    std::unique_ptr<Solution> __s(new Solution());',
    '    __skh::tic();',
    `    auto&& __r = ${call};`,
    '    __skh::toc();',
    '    std::string __out;',
    `    ${report(parseType(spec.returns), '__r', '__out')}`,
    '    return __out;',
    '}',
  ];
};

const designDriver = (spec: DesignSpec) => {
  const ctor = spec.ctor.map((param) => parseType(param.type));
  const cases = spec.methods.flatMap((method, index) => {
    const returns = parseType(method.returns);
    const args = method.params.map((param, i) => {
      const type = cppType(parseType(param.type), true);
      return `__skh::from<${type}>(__op[${i + 1}])`;
    });
    const call = `__o->${nameIn(LANGUAGE, method.name, method.names)}(${args.join(', ')})`;

    return [
      `        ${index === 0 ? 'if' : '} else if'} (__name == ${JSON.stringify(method.name)}) {`,
      `            __skh::op_arity(__op, ${method.params.length});`,
      ...(returns.kind === 'void'
        ? [`            ${call};`, '            __out += "null";']
        : [`            auto&& __v = ${call};`, `            ${report(returns, '__v', '__out')}`]),
    ];
  });

  return [
    'static std::string __skh_test(const __skh::JVal& __case) {',
    `    const __skh::JVal& __ctor = __skh::args(__case, "ctorArgs", ${ctor.length});`,
    ...ctor.map((type, i) => `    ${declare(type, `__c${i}`, `__ctor[${i}]`)}`),
    '    const __skh::JVal& __ops = __skh::ops(__case);',
    '    std::string __out = "[";',
    '    __skh::tic();',
    `    std::unique_ptr<${spec.className}> __o(new ${spec.className}(${ctor
      .map((_type, i) => `__c${i}`)
      .join(', ')}));`,
    '    for (std::size_t __k = 0; __k < __ops.size(); ++__k) {',
    '        const __skh::JVal& __op = __ops[__k];',
    '        const std::string __name = __op[0].str();',
    '        __skh::op_at(__k, __name);',
    "        if (__k) __out += ',';",
    ...cases,
    '        } else {',
    '            throw __skh::unknown_op(__name);',
    '        }',
    '    }',
    '    __skh::toc();',
    "    __out += ']';",
    '    return __out;',
    '}',
  ];
};

// A main() the learner kept from testing on their own machine becomes an
// unused function template: it still compiles, even without a return, and
// never runs (from the prototype)
const RENAME_MAIN =
  '#define main (*__skh_user_main_ptr)() = nullptr; template <class __SkhT = int> __SkhT __skh_user_main';

// Only edits that keep every line where it was: no BOM, LF endings and a
// final newline. Everything else compiles as it is.
const normalizeCode = (code: string) => ({ code: normalizeText(code), errors: [] });

const assemble = (code: string, spec: LessonSpec): Assembled => {
  const used = runnerTypesIn(spec);
  const userLines = countLines(code);
  const driver = spec.kind === 'function' ? functionDriver(spec) : designDriver(spec);

  const before = [
    preludes['cpp.core.h'],
    ...RUNNER_TYPES.filter((type) => used.has(type)).map((type) => preludes[`cpp.${type}.h`]),
    ...injectedFunction(spec),
    RENAME_MAIN,
    `#line 1 "${USER_FILE}"`,
  ].join('\n');
  const lineOffset = countLines(`${before}\n`);

  const source = [
    before,
    // Followed by an empty line, which takes the line splice of a final
    // backslash that would otherwise swallow the #undef
    code.endsWith('\n') ? code : `${code}\n`,
    '#undef main',
    // Harness errors give main.cpp's own line numbers
    `#line ${lineOffset + userLines + 4} "main.cpp"`,
    '// ==== driver ====',
    ...driver,
    'signed main() { return __skh::run(&__skh_test); }',
    '',
  ].join('\n');

  return { source, userLines, lineOffset };
};

interface GccError {
  file: string;
  line: number;
  column: number | null;
  message: string;
  // The learner's line that led to an error in a header, from "required from here"
  from: { line: number; column: number | null } | null;
}

const LOCATION = /^(.+?):(\d+):(?:(\d+):)? (error|fatal error|warning|note): (.*)$/;
const REQUIRED_FROM = new RegExp(
  `^${USER_FILE.replace('.', '\\.')}:(\\d+):(?:(\\d+):)?\\s+required from`,
);

// g++ (with -fdiagnostics-plain-output) prints "file:line:column: error:
// message". An error in a library header, in a template the learner's code
// used, comes after "solution.cpp:5:13:   required from here" lines.
const parseGcc = (output: string): GccError[] => {
  const errors: GccError[] = [];
  let from: GccError['from'] = null;

  output.split('\n').forEach((text) => {
    const required = REQUIRED_FROM.exec(text);
    if (required) {
      from = { line: Number(required[1]), column: required[2] ? Number(required[2]) : null };
      return;
    }

    const match = LOCATION.exec(text);
    if (!match) {
      // "In file included from", "In instantiation of": a new context
      if (/^In |^\S.*: In /.test(text)) {
        from = null;
      }
      return;
    }

    const [, file, line, column, severity, message] = match;

    if (severity === 'error' || severity === 'fatal error') {
      errors.push({
        file,
        line: Number(line),
        column: column ? Number(column) : null,
        message: message.trim(),
        from,
      });
      from = null;
    }
  });

  return errors;
};

// g++ counts columns in bytes; the editor counts characters
const characterColumn = (lineText: string | undefined, byteColumn: number | null) => {
  if (byteColumn === null || lineText === undefined) {
    return byteColumn;
  }
  const prefix = Buffer.from(lineText, 'utf8').subarray(0, byteColumn - 1);
  return prefix.toString('utf8').length + 1;
};

// The shared lexer knows neither raw strings (R"(...)") nor digit separators
// (1'000'000), so they're blanked first, keeping every line where it was
const lexable = (code: string) =>
  code
    .replace(/R"([^()\\\s]{0,16})\(([\s\S]*?)\)\1"/g, (raw) => raw.replace(/[^\n]/g, ' '))
    .replace(/\b(?:0[xXbB][0-9A-Fa-f']*[0-9A-Fa-f]|\d[\d']*\d)/g, (number) =>
      number.replace(/'/g, ' '),
    );

const RUNNER_NAMES = ['ListNode', 'BinaryNode', 'Interval', 'Item'];

// Redefining a runner type or the tests' helper is an error on the learner's
// own line (the harness's comes first); say what to do instead
const explainOwn = (message: string, lineText: string, spec: LessonSpec) => {
  const type = /^redefinition of '(?:struct |class )(\w+)'/.exec(message);

  if (type && RUNNER_NAMES.includes(type[1])) {
    const keyword = new RegExp(`\\b(class|struct)\\s+${type[1]}\\b`).exec(lineText);
    return `\`${type[1]}\` is provided by the test runner, so remove your own \`${
      keyword ? keyword[1] : 'struct'
    } ${type[1]}\``;
  }

  const helper = /^redefinition of '[^']*?\b(\w+)\(/.exec(message);

  if (helper && spec.kind === 'function' && spec.injected && spec.injected.name === helper[1]) {
    return `\`${helper[1]}\` is provided by the test runner, so remove your own \`${helper[1]}\``;
  }

  return message;
};

// Errors in the learner's code are shown where they are. Errors only in the
// harness mean the code doesn't fit around it; say why in their terms.
const diagnosticsFor =
  (spec: LessonSpec) =>
  (output: string, assembled: Assembled): Diagnostic[] => {
    const errors = parseGcc(output);
    const userCode = assembled.source
      .split('\n')
      .slice(assembled.lineOffset, assembled.lineOffset + assembled.userLines);
    const own = errors
      .map((error) => {
        if (error.file === USER_FILE && error.line <= assembled.userLines) {
          return { line: error.line, column: error.column, message: error.message };
        }
        // An error in a library template the learner's code used
        if (error.from && error.from.line <= assembled.userLines && error.file !== 'main.cpp') {
          return { ...error.from, message: error.message };
        }
        return null;
      })
      .filter(
        (error): error is { line: number; column: number | null; message: string } => !!error,
      );

    if (own.length) {
      const seen = new Set<string>();
      return (
        own
          .map(({ line, column, message }) => ({
            line,
            column: characterColumn(userCode[line - 1], column),
            message: explainOwn(message, userCode[line - 1] || '', spec),
          }))
          // A template the learner used fails the same way in each instantiation
          .filter((diagnostic) => {
            const key = JSON.stringify(diagnostic);
            if (seen.has(key)) {
              return false;
            }
            seen.add(key);
            return true;
          })
      );
    }

    if (!errors.length) {
      return output.trim()
        ? [{ line: null, column: null, message: output.trim().slice(0, 500) }]
        : [];
    }

    const lexed = lex(lexable(userCode.join('\n')));

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

    const redefined = errors
      .map((error) => /redefinition of '(?:struct |class )?(\w+)'/.exec(error.message))
      .find((match) => match && RUNNER_NAMES.includes(match[1]));

    if (redefined) {
      const name = redefined[1];
      return [
        {
          line: null,
          column: null,
          message: `\`${name}\` is provided by the test runner, so remove your own \`struct ${name}\``,
        },
      ];
    }

    const className = spec.kind === 'function' ? 'Solution' : spec.className;
    const missingClass = new RegExp(
      `'${className}' (?:was not declared|does not name a type|has not been declared)|expected type-specifier before '${className}'`,
    );

    if (errors.some((error) => missingClass.test(error.message))) {
      return [
        {
          line: null,
          column: null,
          message: `Your code needs a \`class ${className}\`, as in the starting code`,
        },
      ];
    }

    // class members are private unless declared after `public:`
    const hidden = errors
      .map((error) =>
        /^'[^']*?(\w+)\([^']*\)' is (?:private|protected) within this context/.exec(error.message),
      )
      .find(Boolean);

    if (hidden) {
      return [
        {
          line: null,
          column: null,
          message: `Make \`${hidden[1]}\` public: put it after \`public:\`, as in the starting code`,
        },
      ];
    }

    return [
      {
        line: null,
        column: null,
        message: `Your code doesn't match what the tests call. They expect:\n${cppSignature(spec)}`,
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
    case 'nullable':
      return POINTERS.includes(type.of.kind) ? 'nullptr' : 'nullopt';
    case 'ListNode':
    case 'BinaryNode':
    case 'BinaryNodeRef':
      return 'nullptr';
    default:
      return '{}';
  }
};

const NODE_COMMENTS: Record<string, string[]> = {
  ListNode: [
    '/**',
    ' * The test runner provides ListNode:',
    ' * struct ListNode {',
    ' *     int data;',
    ' *     ListNode* next;',
    ' *     ListNode(int x) : data(x), next(nullptr) {}',
    ' * };',
    ' */',
  ],
  BinaryNode: [
    '/**',
    ' * The test runner provides BinaryNode:',
    ' * struct BinaryNode {',
    ' *     int data;',
    ' *     BinaryNode* left;',
    ' *     BinaryNode* right;',
    ' *     BinaryNode(int x) : data(x), left(nullptr), right(nullptr) {}',
    ' * };',
    ' */',
  ],
  Interval: [
    '/**',
    ' * The test runner provides Interval:',
    ' * struct Interval {',
    ' *     double start;',
    ' *     double end;',
    ' *     Interval(double start, double end) { ... }',
    ' * };',
    ' */',
  ],
  Item: [
    '/**',
    ' * The test runner provides Item:',
    ' * struct Item {',
    ' *     int weight;',
    ' *     int value;',
    ' *     Item(int weight, int value) { ... }',
    ' * };',
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
export const cppStarter = (spec: LessonSpec) => {
  const used = runnerTypesIn(spec);
  const comments = RUNNER_TYPES.filter((type) => used.has(type)).flatMap((type) => [
    ...NODE_COMMENTS[type],
    '',
  ]);

  if (spec.kind === 'function') {
    const { injected } = spec;
    const helper = injected
      ? [
          `// The test runner provides ${injected.name}:`,
          `// ${cppType(parseType(injected.returns))} ${injected.name}(${injected.params
            .map((param) => `${cppType(parseType(param.type))} ${param.name}`)
            .join(', ')});`,
          '',
        ]
      : [];
    return [
      ...comments,
      ...helper,
      'class Solution {',
      'public:',
      ...methodStub(nameIn(LANGUAGE, spec.entry, spec.names), spec.params, spec.returns),
      '};',
      '',
    ].join('\n');
  }

  return [
    ...comments,
    `class ${spec.className} {`,
    'public:',
    `    ${spec.className}(${spec.ctor.map(parameter).join(', ')}) {`,
    '        // Set up your class here',
    '    }',
    ...spec.methods.flatMap((method) => [
      '',
      ...methodStub(nameIn(LANGUAGE, method.name, method.names), method.params, method.returns),
    ]),
    '};',
    '',
  ].join('\n');
};

export const cppRuntime: LanguageRuntime = {
  language: LANGUAGE,
  version: 'cpp-2',
  // The harness runs the tests on a 128 MB stack, half of this
  limits: { cpuSeconds: 5, wallSeconds: 10, memoryKb: 256000, maxFileSizeKb: 1024 },
  docker: {
    // gcc:16.2.0 with <bits/stdc++.h> precompiled (docker/runner/cpp), for
    // the flags up to -D_GLIBCXX_ASSERTIONS; change both together
    image: 'skilled-runner/cpp:16.2.0-2',
    sourceFile: 'main.cpp',
    compile:
      'g++ -std=gnu++23 -O0 -D_GLIBCXX_ASSERTIONS -Werror=return-type -I/opt/skilled/pch -fmax-errors=20 -fdiagnostics-plain-output -fdiagnostics-column-unit=byte -o main main.cpp',
    run: './main',
    // cc1plus needs 200-400 MB, more than the program gets
    compileMemoryKb: 1024000,
  },
  normalize: normalizeCode,
  assemble,
  diagnostics: (output, assembled, spec) => diagnosticsFor(spec)(output, assembled),
  starter: cppStarter,
};
