import { CodingLanguage } from 'utils/constants/lesson';
import { nameIn } from 'utils/shared/runner/naming';
import { parseType } from 'utils/shared/runner/spec';
import { DesignSpec, FunctionSpec, LessonSpec, Param, TypeNode } from 'utils/shared/runner/types';
import preludes from '../preludes/preludes.gen';
import { blank, countLines, lex, LexOptions, normalizeText, Token } from './lexer';
import { RUNNER_TYPES, runnerTypesIn } from './specTypes';
import { Assembled, Diagnostic, LanguageRuntime } from './types';

// Kotlin, LeetCode-style: the learner writes `class Solution` (or the lesson's
// class), and the harness and a generated `fun main` follow their code in
// Main.kt, so their line N is line N of the file. Unlike Java there are no
// automatic imports: the learner's own imports stay at the top of the file,
// where Kotlin needs them.

const LANGUAGE = CodingLanguage.Kotlin;

// A learner's own top-level `fun main` is renamed to this, so it doesn't clash
// with the harness's entry point (and isn't called)
const USER_MAIN = '__userMain';

type Scalar = 'int' | 'long' | 'double' | 'bool' | 'string' | 'char';

const SCALAR: Record<Scalar, string> = {
  int: 'Int',
  long: 'Long',
  double: 'Double',
  bool: 'Boolean',
  char: 'Char',
  string: 'String',
};
const PRIMITIVE_ARRAY: Partial<Record<Scalar, string>> = {
  int: 'IntArray',
  long: 'LongArray',
  double: 'DoubleArray',
  bool: 'BooleanArray',
  char: 'CharArray',
};
const EMPTY_ARRAY: Partial<Record<Scalar, string>> = {
  int: 'intArrayOf',
  long: 'longArrayOf',
  double: 'doubleArrayOf',
  bool: 'booleanArrayOf',
  char: 'charArrayOf',
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

// The Kotlin type for a neutral type. Lists and trees are nullable, as on
// LeetCode (an empty one is null). `qualified` spells out the kotlin package
// for the harness, which mustn't depend on the learner's imports or classes.
export const kotlinType = (node: TypeNode, qualified = false): string => {
  const kotlin = (name: string) => (qualified ? `kotlin.${name}` : name);

  switch (node.kind) {
    case 'scalar':
      return kotlin(SCALAR[node.name]);
    case 'array': {
      const primitive = node.of.kind === 'scalar' ? PRIMITIVE_ARRAY[node.of.name] : undefined;
      return primitive
        ? kotlin(primitive)
        : `${kotlin('Array')}<${kotlinType(node.of, qualified)}>`;
    }
    case 'map':
      return `${qualified ? 'kotlin.collections.' : ''}Map<${kotlin('String')}, ${kotlinType(
        node.of,
        qualified,
      )}>`;
    case 'nullable': {
      const inner = kotlinType(node.of, qualified);
      return inner.endsWith('?') ? inner : `${inner}?`;
    }
    case 'ListNode':
      return 'ListNode?';
    case 'BinaryNode':
    case 'BinaryNodeRef':
      return 'BinaryNode?';
    case 'void':
      return kotlin('Unit');
    default:
      return node.kind;
  }
};

// An expression converting a parsed JSON value to the Kotlin type
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
      return `__H.toArr(${expr}) { ${item} -> ${fromJson(node.of, item, depth + 1)} }`;
    }
    case 'map':
      return `__H.toMap(${expr}) { ${item} -> ${fromJson(node.of, item, depth + 1)} }`;
    case 'nullable':
      return `__H.nul(${expr}) { ${item} -> ${fromJson(node.of, item, depth + 1)} }`;
    default:
      if (CONVERTER[node.kind]) {
        return `${CONVERTER[node.kind]}.to(${expr})`;
      }
      throw new Error(`Kotlin can't take a ${node.kind}`);
  }
};

// A returned value, ready for the JSON writer. Anything else serializes as is,
// so a method may return IntArray or List<Int> where the spec says int[].
const toJson = (node: TypeNode, expr: string) => {
  const base = node.kind === 'nullable' ? node.of : node;

  if (base.kind === 'ListNode' || base.kind === 'BinaryNode') {
    return `(${expr} ?: __H.EMPTY)`;
  }
  if (base.kind === 'BinaryNodeRef') {
    return `__HTree.ref(${expr})`;
  }
  return expr;
};

// What the driver holds a returned value as: a node of the input tree has to
// come back as a BinaryNode to report its data
const resultType = (node: TypeNode) => (node.kind === 'BinaryNodeRef' ? 'BinaryNode?' : 'Any?');

const declare = (type: TypeNode, name: string, expr: string) =>
  `val ${name}: ${kotlinType(type, true)} = ${expr}`;

const parameters = (params: Param[]) =>
  params.map((param) => `${param.name}: ${kotlinType(parseType(param.type))}`).join(', ');

// What the tests call, for "your code doesn't match" messages and starters
const methodSignature = (name: string, params: Param[], returns: string) => {
  const type = parseType(returns);
  return `fun ${name}(${parameters(params)})${type.kind === 'void' ? '' : `: ${kotlinType(type)}`}`;
};

const classHeader = (spec: LessonSpec) =>
  spec.kind === 'function'
    ? `class Solution${spec.injected ? ` : ${spec.injected.baseClass}()` : ''}`
    : `class ${spec.className}${spec.ctor.length ? `(${parameters(spec.ctor)})` : ''}`;

export const kotlinSignature = (spec: LessonSpec) => {
  if (spec.kind === 'function') {
    return `${classHeader(spec)} {\n    ${methodSignature(
      nameIn(LANGUAGE, spec.entry, spec.names),
      spec.params,
      spec.returns,
    )}\n}`;
  }

  return [
    `${classHeader(spec)} {`,
    ...spec.methods.map(
      (method) =>
        `    ${methodSignature(nameIn(LANGUAGE, method.name, method.names), method.params, method.returns)}`,
    ),
    '}',
  ].join('\n');
};

// A value of the type that fails the tests: for starting code, and for the
// injected class's hidden state before a test sets it
const placeholder = (type: TypeNode): string | null => {
  switch (type.kind) {
    case 'scalar':
      return { int: '0', long: '0L', double: '0.0', bool: 'false', char: "' '", string: '""' }[
        type.name
      ];
    case 'array':
      return `${(type.of.kind === 'scalar' && EMPTY_ARRAY[type.of.name]) || 'arrayOf'}()`;
    case 'map':
      return 'mapOf()';
    case 'nullable':
    case 'ListNode':
    case 'BinaryNode':
    case 'BinaryNodeRef':
      return 'null';
    case 'Interval':
    case 'Item':
      return `${type.kind}()`;
    default:
      return null;
  }
};

const injectedClass = (spec: FunctionSpec) => {
  const { injected } = spec;

  if (!injected) {
    return [];
  }

  const body = injected.body[LANGUAGE] || injected.body[CodingLanguage.Javascript];

  if (!body) {
    throw new Error(`The injected ${injected.name} has no Kotlin body`);
  }

  return [
    `open class ${injected.baseClass} {`,
    // Not open: a learner's own version can't replace the tests' one
    `    fun ${injected.name}(${injected.params
      .map((param) => `${param.name}: ${kotlinType(parseType(param.type), true)}`)
      .join(', ')}): ${kotlinType(parseType(injected.returns), true)} {`,
    `        ${body}`,
    '    }',
    ...((spec.hidden || []).length
      ? [
          '    companion object {',
          ...(spec.hidden || []).map((param) => {
            const type = parseType(param.type);
            const initial = placeholder(type);
            return initial
              ? `        var ${param.name}: ${kotlinType(type, true)} = ${initial}`
              : `        lateinit var ${param.name}: ${kotlinType(type, true)}`;
          }),
          '    }',
        ]
      : []),
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

  return [
    ...injectedClass(spec),
    'private fun __test(__case: kotlin.collections.Map<kotlin.String, Any?>): Any? {',
    `    val __args = __H.args(__case, "args", ${spec.params.length})`,
    ...spec.params.map(
      (param, i) =>
        `    ${declare(parseType(param.type), `__a${i}`, fromJson(parseType(param.type), `__args[${i}]`))}`,
    ),
    ...(hidden.length
      ? [
          `    val __hidden = __H.args(__case, "hidden", ${hidden.length})`,
          ...hidden.map(
            (param, i) =>
              `    ${spec.injected ? spec.injected.baseClass : 'Solution'}.${param.name} = ${fromJson(
                parseType(param.type),
                `__hidden[${i}]`,
              )}`,
          ),
        ]
      : []),
    '    val __s = Solution()',
    '    __H.tic()',
    `    val __r: ${resultType(returns)} = ${call}`,
    '    __H.toc()',
    `    return ${toJson(returns, '__r')}`,
    '}',
  ];
};

const designDriver = (spec: DesignSpec) => {
  const ctor = spec.ctor.map((param) => parseType(param.type));
  const cases = spec.methods.flatMap((method) => {
    const returns = parseType(method.returns);
    const args = method.params.map((param, i) => fromJson(parseType(param.type), `__op[${i + 1}]`));
    const call = `__o.${nameIn(LANGUAGE, method.name, method.names)}(${args.join(', ')})`;

    return [
      `            ${JSON.stringify(method.name)} -> {`,
      `                __H.opArity(__op, ${method.params.length})`,
      ...(returns.kind === 'void'
        ? [`                ${call}`, '                __out.add(null)']
        : [
            `                val __v: ${resultType(returns)} = ${call}`,
            `                __out.add(${toJson(returns, '__v')})`,
          ]),
      '            }',
    ];
  });

  return [
    'private fun __test(__case: kotlin.collections.Map<kotlin.String, Any?>): Any? {',
    `    val __ctor = __H.args(__case, "ctorArgs", ${ctor.length})`,
    ...ctor.map((type, i) => `    ${declare(type, `__c${i}`, fromJson(type, `__ctor[${i}]`))}`),
    '    val __ops = __H.ops(__case["ops"])',
    '    val __out = java.util.ArrayList<Any?>()',
    '    __H.tic()',
    `    val __o = ${spec.className}(${ctor.map((_type, i) => `__c${i}`).join(', ')})`,
    '    for (__k in 0 until __ops.size) {',
    '        val __op = __ops[__k]',
    '        val __name = __op[0] as kotlin.String',
    '        __H.opAt(__k, __name)',
    '        when (__name) {',
    ...cases,
    '            else -> throw __H.unknownOp(__name)',
    '        }',
    '    }',
    '    __H.toc()',
    '    return __out',
    '}',
  ];
};

const LEX_OPTIONS: LexOptions = { nestedComments: true, textBlocks: true };

// The text after a token, from `from`, skipping spaces and tabs
const nextChar = (text: string, from: number) => {
  let i = from;
  while (text[i] === ' ' || text[i] === '\t') i++;
  return { char: text[i], at: i };
};

// The text before a token, back from `from`, skipping spaces and tabs
const previousChar = (text: string, from: number) => {
  let i = from - 1;
  while (text[i] === ' ' || text[i] === '\t') i--;
  return { char: text[i], at: i };
};

// A top-level `fun main` (with any modifiers), as the identifier `main`
const userMains = (identifiers: Token[], text: string, name: string) =>
  identifiers.filter(
    (token, k) =>
      token.text === name &&
      token.depth === 0 &&
      k > 0 &&
      identifiers[k - 1].text === 'fun' &&
      text[token.start - 1] !== '`' &&
      nextChar(text, token.end).char === '(',
  );

// Only edits that keep every line where it was: no BOM, LF endings, a blanked
// `package` line and `@file:JvmName` (either would move the harness's
// MainKt), and a top-level `fun main` renamed, which would clash with the
// harness's own
const normalizeCode = (code: string) => {
  let text = normalizeText(code);
  const { identifiers } = lex(text, LEX_OPTIONS);
  const edits: { start: number; end: number; replacement: string | null }[] = [];

  identifiers.forEach((token, k) => {
    if (token.depth !== 0 || text[token.start - 1] === '`') {
      return;
    }

    if (token.text === 'package' && previousChar(text, token.start).char !== '.') {
      const lineEnd = text.indexOf('\n', token.end);
      const semicolon = text.indexOf(';', token.end);
      const end = semicolon >= 0 && semicolon < lineEnd ? semicolon + 1 : lineEnd;
      edits.push({ start: token.start, end, replacement: null });
    }

    // @file:JvmName("X") or @file:JvmMultifileClass, optionally kotlin.jvm.-qualified
    if (
      token.text === 'file' &&
      previousChar(text, token.start).char === '@' &&
      nextChar(text, token.end).char === ':'
    ) {
      let n = k + 1;
      while (
        identifiers[n] &&
        ['kotlin', 'jvm'].includes(identifiers[n].text) &&
        text[identifiers[n].end] === '.'
      ) {
        n++;
      }
      const annotation = identifiers[n];
      if (annotation && ['JvmName', 'JvmMultifileClass'].includes(annotation.text)) {
        const open = nextChar(text, annotation.end);
        const close = open.char === '(' ? text.indexOf(')', open.at) : -1;
        edits.push({
          start: previousChar(text, token.start).at,
          end: close >= 0 ? close + 1 : annotation.end,
          replacement: null,
        });
      }
    }
  });

  userMains(identifiers, text, 'main').forEach((token) =>
    edits.push({ start: token.start, end: token.end, replacement: USER_MAIN }),
  );

  // Back to front, so earlier positions stay valid
  edits
    .sort((a, b) => b.start - a.start)
    .forEach(({ start, end, replacement }) => {
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
    code,
    preludes['kotlin.core.kt'],
    ...RUNNER_TYPES.filter((type) => used.has(type)).map((type) => preludes[`kotlin.${type}.kt`]),
    '// ==== driver ====',
    ...driver,
    '',
    'fun main(__argv: kotlin.Array<kotlin.String>) {',
    `    __H.userLines = ${userLines}`,
    '    __H.run { __case -> __test(__case) }',
    '}',
    '',
  ].join('\n');

  return { source, userLines, lineOffset: 0 };
};

interface KotlincError {
  line: number;
  column: number | null;
  message: string;
}

const DIAGNOSTIC = /^(?:.*\/)?Main\.kt:(\d+):(\d+): (error|warning|info): (.*)$/;

// kotlinc prints "Main.kt:7:19: error: syntax error: Expecting an element.",
// sometimes more lines of message (a redeclaration names the class there),
// then the source line and carets under it. Syntax errors come one per token,
// so a line keeps only the first of each message.
const parseKotlinc = (output: string): KotlincError[] => {
  const lines = output.split('\n');
  const errors: KotlincError[] = [];

  lines.forEach((text, k) => {
    const match = DIAGNOSTIC.exec(text);
    if (!match || match[3] !== 'error') {
      return;
    }

    let end = k + 1;
    while (end < lines.length && !DIAGNOSTIC.test(lines[end])) end++;
    const caret = lines.slice(k + 1, end).findIndex((line) => /^\s*\^+\s*$/.test(line));
    // Without a caret line, the rest is message
    const more = caret >= 0 ? lines.slice(k + 1, k + caret) : lines.slice(k + 1, end);
    const message = [match[4], ...more]
      .map((line) => line.trim())
      .filter(Boolean)
      .join('\n');
    const line = Number(match[1]);

    if (!errors.some((error) => error.line === line && error.message === message)) {
      errors.push({ line, column: Number(match[2]) > 0 ? Number(match[2]) : null, message });
    }
  });

  return errors;
};

// A column on a line where the learner's `fun main` was renamed, as it was
// before the rename
const columnBeforeRename = (code: string, line: number, column: number | null) => {
  if (column === null) {
    return null;
  }

  const renamed = userMains(lex(code, LEX_OPTIONS).identifiers, code, USER_MAIN).find(
    (token) => token.line === line,
  );

  if (!renamed) {
    return column;
  }

  // 1-based, like kotlinc's columns
  const start = renamed.start - code.lastIndexOf('\n', renamed.start - 1);
  const shift = USER_MAIN.length - 'main'.length;

  if (column >= start + USER_MAIN.length) {
    return column - shift;
  }
  return column > start ? start : column;
};

// A class the learner wrote that the harness also declares, from a kotlinc
// redeclaration error ("redeclaration:\nclass ListNode : __H.Json")
const redeclared = (message: string) =>
  (/^redeclaration\b[\s\S]*?\b(?:class|object|interface)\s+(\w+)/i.exec(message) || [])[1];

// Errors in the learner's code are shown where they are. Errors only in the
// harness mean the code doesn't fit around it; say why in their terms.
const diagnosticsFor =
  (spec: LessonSpec) =>
  (output: string, assembled: Assembled): Diagnostic[] => {
    const errors = parseKotlinc(output);
    const own = errors.filter((error) => error.line <= assembled.userLines);
    const code = assembled.source.split('\n').slice(0, assembled.userLines).join('\n');
    const provided = new Set<string>([
      ...runnerTypesIn(spec),
      ...(spec.kind === 'function' && spec.injected ? [spec.injected.baseClass] : []),
    ]);
    const providedMessage = (name: string) =>
      `\`${name}\` is provided by the test runner, so remove your own \`class ${name}\``;

    if (!errors.length) {
      return output.trim()
        ? [{ line: null, column: null, message: output.trim().slice(0, 500) }]
        : [];
    }

    const lexed = lex(code, LEX_OPTIONS);
    const { unterminated } = lexed;
    const neverClosed: Diagnostic[] | null = unterminated && [
      {
        line: unterminated.line,
        column: null,
        message: `This ${
          unterminated.what === 'text block' ? 'raw string' : unterminated.what
        } is never closed`,
      },
    ];

    // An unclosed comment or raw string runs on into the harness, so what
    // kotlinc says about the learner's lines (a `}` missing on line 1, say)
    // follows from it
    if (unterminated && neverClosed && ['comment', 'text block'].includes(unterminated.what)) {
      return neverClosed;
    }

    if (own.length) {
      return own.map(({ line, column, message }) => {
        const name = redeclared(message);
        return {
          line,
          column: columnBeforeRename(code, line, column),
          message: name && provided.has(name) ? providedMessage(name) : message,
        };
      });
    }

    if (neverClosed) {
      return neverClosed;
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

    const duplicate = errors.map((error) => redeclared(error.message)).find(Boolean);

    if (duplicate) {
      return [{ line: null, column: null, message: providedMessage(duplicate) }];
    }

    const className = spec.kind === 'function' ? 'Solution' : spec.className;

    // "unresolved reference 'Solution'.", not a method missing "on receiver of
    // type 'Solution'"
    if (
      errors.some((error) =>
        error.message.toLowerCase().startsWith(`unresolved reference '${className.toLowerCase()}'`),
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
        message: `Your code doesn't match what the tests call. They expect:\n${kotlinSignature(spec)}`,
      },
    ];
  };

const NODE_COMMENTS: Record<string, string[]> = {
  ListNode: [
    '/**',
    ' * The test runner provides ListNode:',
    ' * class ListNode(var data: Int = 0, var next: ListNode? = null)',
    ' */',
  ],
  BinaryNode: [
    '/**',
    ' * The test runner provides BinaryNode:',
    ' * class BinaryNode(',
    ' *     var data: Int = 0,',
    ' *     var left: BinaryNode? = null,',
    ' *     var right: BinaryNode? = null,',
    ' * )',
    ' */',
  ],
  Interval: [
    '/**',
    ' * The test runner provides Interval:',
    ' * data class Interval(var start: Double = 0.0, var end: Double = 0.0)',
    ' */',
  ],
  Item: [
    '/**',
    ' * The test runner provides Item:',
    ' * data class Item(var weight: Int = 0, var value: Int = 0)',
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
export const kotlinStarter = (spec: LessonSpec) => {
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
      `${classHeader(spec)} {`,
      ...methodStub(nameIn(LANGUAGE, spec.entry, spec.names), spec.params, spec.returns),
      '}',
      '',
    ].join('\n');
  }

  return [
    ...comments,
    `${classHeader(spec)} {`,
    '    // Set up your class here',
    ...spec.methods.flatMap((method) => [
      '',
      ...methodStub(nameIn(LANGUAGE, method.name, method.names), method.params, method.returns),
    ]),
    '}',
    '',
  ].join('\n');
};

export const kotlinRuntime: LanguageRuntime = {
  language: LANGUAGE,
  version: 'kotlin-1',
  // The JVM needs more memory than the interpreted languages
  limits: { cpuSeconds: 5, wallSeconds: 10, memoryKb: 512000, maxFileSizeKb: 1024 },
  docker: {
    image: 'skilled-runner/kotlin:2.4.21',
    sourceFile: 'Main.kt',
    // kotlinc-aot is the compiler on a tuned JVM with an AOT cache of its
    // classes (docker/runner/kotlin/Dockerfile)
    compile: 'kotlinc-aot -nowarn -no-reflect -Xdisable-default-scripting-plugin -d . Main.kt',
    run: 'java -Xmx256m -Xss8m -XX:+UseSerialGC -XX:TieredStopAtLevel=1 -XX:-UsePerfData -cp /opt/kotlinc/lib/kotlin-stdlib.jar:. MainKt',
    compileMemoryKb: 1024000,
  },
  normalize: normalizeCode,
  assemble,
  diagnostics: (output, assembled, spec) => diagnosticsFor(spec)(output, assembled),
  starter: kotlinStarter,
};
