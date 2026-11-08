import { CodingLanguage } from 'utils/constants/lesson';
import { nameIn } from 'utils/shared/runner/naming';
import { parseType } from 'utils/shared/runner/spec';
import { DesignSpec, FunctionSpec, LessonSpec, Param, TypeNode } from 'utils/shared/runner/types';
import preludes from '../preludes/preludes.gen';
import { blank, countLines, lex, normalizeText } from './lexer';
import { RUNNER_TYPES, runnerTypesIn } from './specTypes';
import { Assembled, Diagnostic, LanguageRuntime } from './types';

// Java, LeetCode-style: the learner writes `class Solution` (or the lesson's
// class), and the harness and a generated `public class Main` follow their
// code in Main.java, so their line N is line N of the file.

const LANGUAGE = CodingLanguage.Java;

// LeetCode's Java has these without imports. They go on line 1, before the
// learner's first line, so no line moves.
const AUTO_IMPORTS =
  'import java.util.*; import java.util.function.*; import java.util.stream.*; import java.math.*; ';

type Scalar = 'int' | 'long' | 'double' | 'bool' | 'string' | 'char';

const PRIMITIVE: Record<Scalar, string> = {
  int: 'int',
  long: 'long',
  double: 'double',
  bool: 'boolean',
  char: 'char',
  string: 'String',
};
const BOXED: Record<Scalar, string> = {
  int: 'Integer',
  long: 'Long',
  double: 'Double',
  bool: 'Boolean',
  char: 'Character',
  string: 'String',
};
const SCALAR_IN: Record<Scalar, string> = {
  int: 'toInt',
  long: 'toLong',
  double: 'toDouble',
  bool: 'toBool',
  char: 'toChar',
  string: 'toStr',
};
const ARRAY_IN: Partial<Record<Scalar, string>> = {
  int: 'toIntArr',
  long: 'toLongArr',
  double: 'toDoubleArr',
  bool: 'toBoolArr',
  char: 'toCharArr',
};
const CONVERTER: Record<string, string> = {
  ListNode: '__HList',
  BinaryNode: '__HTree',
  BinaryNodeRef: '__HTree',
  Interval: '__HInterval',
  Item: '__HItem',
};

// The Java type for a neutral type. `qualified` spells out java.util for the
// harness, which mustn't depend on the learner's imports.
export const javaType = (node: TypeNode, qualified = false): string => {
  const boxed = (inner: TypeNode) =>
    inner.kind === 'scalar' ? BOXED[inner.name] : javaType(inner, qualified);

  switch (node.kind) {
    case 'scalar':
      return PRIMITIVE[node.name];
    case 'array':
      return `${javaType(node.of, qualified)}[]`;
    case 'map':
      return `${qualified ? 'java.util.' : ''}Map<String, ${boxed(node.of)}>`;
    case 'nullable':
      return boxed(node.of);
    case 'BinaryNodeRef':
      return 'BinaryNode';
    default:
      return node.kind;
  }
};

// An expression converting a parsed JSON value to the Java type
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
      if (node.of.kind === 'map') {
        throw new Error('Java has no arrays of maps; use a record type such as Item');
      }
      return `__H.toArr(${expr}, ${javaType(node.of, true)}[]::new, ${item} -> ${fromJson(
        node.of,
        item,
        depth + 1,
      )})`;
    }
    case 'map':
      return `__H.toMap(${expr}, ${item} -> ${fromJson(node.of, item, depth + 1)})`;
    case 'nullable':
      return `__H.nul(${expr}, ${item} -> ${fromJson(node.of, item, depth + 1)})`;
    default:
      if (CONVERTER[node.kind]) {
        return `${CONVERTER[node.kind]}.to(${expr})`;
      }
      throw new Error(`Java can't take a ${node.kind}`);
  }
};

// A returned value, ready for the JSON writer. Anything else serializes as is,
// so a method may return int[] or List<Integer> where the spec says int[].
const toJson = (node: TypeNode, expr: string) => {
  const base = node.kind === 'nullable' ? node.of : node;

  if (base.kind === 'ListNode' || base.kind === 'BinaryNode') {
    return `(${expr} == null ? __H.EMPTY : (Object) ${expr})`;
  }
  if (base.kind === 'BinaryNodeRef') {
    return `__HTree.ref(${expr})`;
  }
  return expr;
};

const declare = (type: TypeNode, name: string, expr: string) =>
  `${javaType(type, true)} ${name} = ${expr};`;

// What the tests call, for "your code doesn't match" messages and starters
const methodSignature = (name: string, params: Param[], returns: string) =>
  `public ${javaType(parseType(returns))} ${name}(${params
    .map((param) => `${javaType(parseType(param.type))} ${param.name}`)
    .join(', ')})`;

export const javaSignature = (spec: LessonSpec) => {
  if (spec.kind === 'function') {
    const extend = spec.injected ? ` extends ${spec.injected.baseClass}` : '';
    return `class Solution${extend} {\n    ${methodSignature(
      nameIn(LANGUAGE, spec.entry, spec.names),
      spec.params,
      spec.returns,
    )}\n}`;
  }

  return [
    `class ${spec.className} {`,
    `    public ${spec.className}(${spec.ctor
      .map((param) => `${javaType(parseType(param.type))} ${param.name}`)
      .join(', ')})`,
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
    throw new Error(`The injected ${injected.name} has no Java body`);
  }

  return [
    `class ${injected.baseClass} {`,
    ...(spec.hidden || []).map(
      (param) => `    static ${javaType(parseType(param.type), true)} ${param.name};`,
    ),
    // final: a learner's own version can't replace the tests' one
    `    final ${javaType(parseType(injected.returns), true)} ${injected.name}(${injected.params
      .map((param) => `${javaType(parseType(param.type), true)} ${param.name}`)
      .join(', ')}) {`,
    `        ${body}`,
    '    }',
    '}',
    '',
  ];
};

const functionDriver = (spec: FunctionSpec) => {
  const hidden = spec.hidden || [];
  const call = `__s.${nameIn(LANGUAGE, spec.entry, spec.names)}(${spec.params
    .map((_param, i) => `__a${i}`)
    .join(', ')})`;
  const returns = parseType(spec.returns);
  // A node of the input tree has to come back as a BinaryNode to report its data
  const result =
    returns.kind === 'BinaryNodeRef' ? `BinaryNode __r = ${call};` : `Object __r = ${call};`;

  return [
    ...injectedClass(spec),
    'public class Main {',
    '    static Object __test(java.util.Map<?, ?> __case) throws Throwable {',
    `        java.util.List<Object> __args = __H.args(__case, "args", ${spec.params.length});`,
    ...spec.params.map(
      (param, i) =>
        `        ${declare(parseType(param.type), `__a${i}`, fromJson(parseType(param.type), `__args.get(${i})`))}`,
    ),
    ...(hidden.length
      ? [
          `        java.util.List<Object> __hidden = __H.args(__case, "hidden", ${hidden.length});`,
          ...hidden.map(
            (param, i) =>
              `        ${spec.injected ? spec.injected.baseClass : 'Solution'}.${param.name} = ${fromJson(
                parseType(param.type),
                `__hidden.get(${i})`,
              )};`,
          ),
        ]
      : []),
    '        Solution __s = new Solution();',
    '        __H.tic();',
    `        ${result}`,
    '        __H.toc();',
    `        return ${toJson(returns, '__r')};`,
    '    }',
  ];
};

const designDriver = (spec: DesignSpec) => {
  const ctor = spec.ctor.map((param) => parseType(param.type));
  const cases = spec.methods.flatMap((method) => {
    const returns = parseType(method.returns);
    const args = method.params.map((param, i) =>
      fromJson(parseType(param.type), `__op.get(${i + 1})`),
    );
    const call = `__o.${nameIn(LANGUAGE, method.name, method.names)}(${args.join(', ')})`;

    return [
      `                case ${JSON.stringify(method.name)}: {`,
      `                    __H.opArity(__op, ${method.params.length});`,
      ...(returns.kind === 'void'
        ? [`                    ${call};`, '                    __out.add(null);']
        : [
            `                    ${returns.kind === 'BinaryNodeRef' ? 'BinaryNode' : 'Object'} __v = ${call};`,
            `                    __out.add(${toJson(returns, '__v')});`,
          ]),
      '                    break;',
      '                }',
    ];
  });

  return [
    'public class Main {',
    '    static Object __test(java.util.Map<?, ?> __case) throws Throwable {',
    `        java.util.List<Object> __ctor = __H.args(__case, "ctorArgs", ${ctor.length});`,
    ...ctor.map(
      (type, i) => `        ${declare(type, `__c${i}`, fromJson(type, `__ctor.get(${i})`))}`,
    ),
    '        java.util.List<java.util.List<Object>> __ops = __H.ops(__case.get("ops"));',
    '        java.util.ArrayList<Object> __out = new java.util.ArrayList<>();',
    '        __H.tic();',
    `        ${spec.className} __o = new ${spec.className}(${ctor.map((_type, i) => `__c${i}`).join(', ')});`,
    '        for (int __k = 0; __k < __ops.size(); __k++) {',
    '            java.util.List<Object> __op = __ops.get(__k);',
    '            String __name = (String) __op.get(0);',
    '            __H.opAt(__k, __name);',
    '            switch (__name) {',
    ...cases,
    '                default: throw __H.unknownOp(__name);',
    '            }',
    '        }',
    '        __H.toc();',
    '        return __out;',
    '    }',
  ];
};

const LEX_OPTIONS = { textBlocks: true };

// Only edits that keep every line where it was: no BOM, LF endings, and
// blanked `package` lines and top-level `public` modifiers (Main.java may only
// have one public class, the harness's)
const normalizeCode = (code: string) => {
  let text = normalizeText(code);
  const { identifiers } = lex(text, LEX_OPTIONS);

  // Back to front, so earlier positions stay valid
  identifiers
    .filter((token) => token.depth === 0 && (token.text === 'package' || token.text === 'public'))
    .reverse()
    .forEach((token) => {
      const semicolon = text.indexOf(';', token.end);
      text =
        token.text === 'package' && semicolon >= 0
          ? blank(text, token.start, semicolon + 1)
          : blank(text, token.start, token.end);
    });

  return { code: text, errors: [] };
};

const assemble = (code: string, spec: LessonSpec): Assembled => {
  const used = runnerTypesIn(spec);
  const userLines = countLines(code);
  const driver = spec.kind === 'function' ? functionDriver(spec) : designDriver(spec);

  const source = [
    AUTO_IMPORTS + code,
    preludes['java.core.java'],
    ...RUNNER_TYPES.filter((type) => used.has(type)).map((type) => preludes[`java.${type}.java`]),
    '// ==== driver ====',
    ...driver,
    '    public static void main(String[] __argv) {',
    `        __H.userLines = ${userLines};`,
    '        __H.run(Main::__test);',
    '    }',
    '}',
    '',
  ].join('\n');

  return { source, userLines, lineOffset: 0 };
};

interface JavacError {
  line: number;
  column: number | null;
  message: string;
}

// javac prints "Main.java:7: error: ';' expected", the source line, and a caret
// under the column, sometimes followed by "symbol:" and "location:" lines
const parseJavac = (output: string): JavacError[] => {
  const lines = output.split('\n');
  const errors: JavacError[] = [];

  lines.forEach((text, k) => {
    const match = /^Main\.java:(\d+): error: (.*)$/.exec(text);
    if (!match) {
      return;
    }

    const line = Number(match[1]);
    let message = match[2].trim();
    let column: number | null = null;

    for (let j = k + 1; j < lines.length && !/^Main\.java:\d+:/.test(lines[j]); j++) {
      if (/^\s*\^\s*$/.test(lines[j])) {
        column = lines[j].indexOf('^') + 1 - (line === 1 ? AUTO_IMPORTS.length : 0);
      }
      const symbol = /^\s+symbol:\s+(.*)$/.exec(lines[j]);
      if (symbol) {
        message += `: ${symbol[1].trim()}`;
      }
    }

    errors.push({ line, column: column !== null && column > 0 ? column : null, message });
  });

  return errors;
};

// Errors in the learner's code are shown where they are. Errors only in the
// harness mean the code doesn't fit around it; say why in their terms.
const diagnosticsFor =
  (spec: LessonSpec) =>
  (output: string, assembled: Assembled): Diagnostic[] => {
    const errors = parseJavac(output);
    const own = errors.filter((error) => error.line <= assembled.userLines);

    if (own.length) {
      return own.map(({ line, column, message }) => ({ line, column, message }));
    }

    if (!errors.length) {
      return output.trim()
        ? [{ line: null, column: null, message: output.trim().slice(0, 500) }]
        : [];
    }

    const code = assembled.source
      .split('\n')
      .slice(0, assembled.userLines)
      .join('\n')
      .slice(AUTO_IMPORTS.length);
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

    const duplicate = errors
      .map((error) => /duplicate class: (\w+)/.exec(error.message))
      .find(Boolean);

    if (duplicate) {
      const name = duplicate[1];
      return [
        {
          line: null,
          column: null,
          message:
            name === 'Main'
              ? 'Rename your class `Main`: the test runner uses that name'
              : `\`${name}\` is provided by the test runner, so remove your own \`class ${name}\``,
        },
      ];
    }

    const className = spec.kind === 'function' ? 'Solution' : spec.className;

    if (errors.some((error) => error.message.includes(`symbol: class ${className}`))) {
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
        message: `Your code doesn't match what the tests call. They expect:\n${javaSignature(spec)}`,
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
      return `new ${javaType(inner)}[0]${'[]'.repeat(dimensions - 1)}`;
    }
    default:
      return 'null';
  }
};

const NODE_COMMENTS: Record<string, string[]> = {
  ListNode: [
    '/**',
    ' * The test runner provides ListNode:',
    ' * class ListNode {',
    ' *     int data;',
    ' *     ListNode next;',
    ' *     ListNode(int data) { this.data = data; }',
    ' * }',
    ' */',
  ],
  BinaryNode: [
    '/**',
    ' * The test runner provides BinaryNode:',
    ' * class BinaryNode {',
    ' *     int data;',
    ' *     BinaryNode left;',
    ' *     BinaryNode right;',
    ' *     BinaryNode(int data) { this.data = data; }',
    ' * }',
    ' */',
  ],
  Interval: [
    '/**',
    ' * The test runner provides Interval:',
    ' * class Interval {',
    ' *     double start;',
    ' *     double end;',
    ' *     Interval(double start, double end) { ... }',
    ' * }',
    ' */',
  ],
  Item: [
    '/**',
    ' * The test runner provides Item:',
    ' * class Item {',
    ' *     int weight;',
    ' *     int value;',
    ' *     Item(int weight, int value) { ... }',
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
export const javaStarter = (spec: LessonSpec) => {
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
      `class Solution${spec.injected ? ` extends ${spec.injected.baseClass}` : ''} {`,
      ...methodStub(nameIn(LANGUAGE, spec.entry, spec.names), spec.params, spec.returns),
      '}',
      '',
    ].join('\n');
  }

  return [
    ...comments,
    `class ${spec.className} {`,
    `    public ${spec.className}(${spec.ctor
      .map((param) => `${javaType(parseType(param.type))} ${param.name}`)
      .join(', ')}) {`,
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

export const javaRuntime: LanguageRuntime = {
  language: LANGUAGE,
  version: 'java-1',
  // The JVM needs more memory than the interpreted languages
  limits: { cpuSeconds: 5, wallSeconds: 10, memoryKb: 512000, maxFileSizeKb: 1024 },
  docker: {
    image: 'eclipse-temurin:25.0.4.1_1-jdk-noble',
    sourceFile: 'Main.java',
    compile:
      'javac -J-Xmx512m -J-XX:+UseSerialGC -J-XX:TieredStopAtLevel=1 -encoding UTF-8 -nowarn -Xmaxerrs 20 Main.java',
    run: 'java -Xmx256m -Xss8m -XX:+UseSerialGC -XX:TieredStopAtLevel=1 -XX:-UsePerfData Main',
    compileMemoryKb: 1024000,
  },
  normalize: normalizeCode,
  assemble,
  diagnostics: (output, assembled, spec) => diagnosticsFor(spec)(output, assembled),
  starter: javaStarter,
};
