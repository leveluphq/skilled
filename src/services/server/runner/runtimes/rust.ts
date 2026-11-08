import { CodingLanguage } from 'utils/constants/lesson';
import { nameIn, parameterName } from 'utils/shared/runner/naming';
import { parseType } from 'utils/shared/runner/spec';
import { DesignSpec, FunctionSpec, LessonSpec, Param, TypeNode } from 'utils/shared/runner/types';
import preludes from '../preludes/preludes.gen';
import { countLines, Lexed, normalizeText, Token } from './lexer';
import { RUNNER_TYPES, runnerTypesIn } from './specTypes';
import { Assembled, Diagnostic, LanguageRuntime } from './types';

// Rust, LeetCode-style: the learner writes `impl Solution` with associated
// functions (or the lesson's struct), and the harness (`mod __harness`) and a
// generated `fn main` follow their code in main.rs, so their line N is line N
// of the file. rustc has no line directive, so nothing may come before it.

const LANGUAGE = CodingLanguage.Rust;

// On every item the driver adds at the crate root, so a learner's
// `#![deny(...)]` can't fail the build on the tests' code (an explicit deny
// isn't overridden by allow(warnings) alone). The prelude files carry the same.
const LINTS =
  '#[allow(unknown_lints, renamed_and_removed_lints, warnings, dead_code, unused, unused_qualifications, unused_results, unused_lifetimes, unused_import_braces, unused_extern_crates, unused_macro_rules, unsafe_code, unsafe_op_in_unsafe_fn, non_snake_case, non_camel_case_types, non_upper_case_globals, nonstandard_style, missing_docs, missing_debug_implementations, missing_copy_implementations, unreachable_pub, single_use_lifetimes, trivial_casts, trivial_numeric_casts, elided_lifetimes_in_paths, let_underscore_drop, variant_size_differences, rust_2018_idioms, rust_2021_compatibility, rust_2024_compatibility, future_incompatible, keyword_idents, meta_variable_misuse, missing_abi, unit_bindings, deprecated, unreachable_code, unreachable_patterns, clippy::all)]';

type Scalar = 'int' | 'long' | 'double' | 'bool' | 'string' | 'char';

const SCALAR: Record<Exclude<Scalar, 'string'>, string> = {
  int: 'i32',
  long: 'i64',
  double: 'f64',
  bool: 'bool',
  char: 'char',
};

// The Rust type for a neutral type. `qualified` spells out std's paths for
// the driver, which a learner's own `Vec` or `Option` mustn't change.
export const rustType = (node: TypeNode, qualified = false): string => {
  const std = (path: string, name: string) => (qualified ? `::std::${path}::${name}` : name);
  const option = (inner: string) => `${std('option', 'Option')}<${inner}>`;

  switch (node.kind) {
    case 'scalar':
      return node.name === 'string' ? std('string', 'String') : SCALAR[node.name];
    case 'array':
      return `${std('vec', 'Vec')}<${rustType(node.of, qualified)}>`;
    case 'map':
      return `${qualified ? '::std::collections::HashMap' : 'HashMap'}<${std(
        'string',
        'String',
      )}, ${rustType(node.of, qualified)}>`;
    case 'nullable':
      // A list or tree is already an Option
      return ['ListNode', 'BinaryNode', 'BinaryNodeRef'].includes(node.of.kind)
        ? rustType(node.of, qualified)
        : option(rustType(node.of, qualified));
    case 'ListNode':
      return option(`${std('boxed', 'Box')}<ListNode>`);
    case 'BinaryNode':
    case 'BinaryNodeRef':
      return option(`${std('rc', 'Rc')}<${std('cell', 'RefCell')}<BinaryNode>>`);
    case 'void':
      return '()';
    default:
      return node.kind;
  }
};

// Parameters given a list with a loop in some test. Two boxes can't own one
// node, so such a list can't be handed over as an Option<Box<ListNode>>: it's
// lent as &Option<Box<ListNode>> instead, and never dropped.
export const loopedParams = (spec: LessonSpec): Set<number> => {
  const looped = new Set<number>();

  if (spec.kind === 'function') {
    spec.params.forEach((param, i) => {
      const type = parseType(param.type);
      const list =
        type.kind === 'ListNode' || (type.kind === 'nullable' && type.of.kind === 'ListNode');
      if (
        list &&
        spec.tests.some((test) => {
          const arg = test.args[i] as { cycleIndex?: unknown } | null;
          return !!arg && typeof arg === 'object' && !Array.isArray(arg) && arg.cycleIndex != null;
        })
      ) {
        looped.add(i);
      }
    });
  }

  return looped;
};

const paramList = (params: Param[], looped: Set<number> = new Set()) =>
  params.map(
    (param, i) =>
      `${parameterName(LANGUAGE, param.name)}: ${looped.has(i) ? '&' : ''}${rustType(
        parseType(param.type),
      )}`,
  );

const returnsPart = (returns: string) => {
  const type = parseType(returns);
  return type.kind === 'void' ? '' : ` -> ${rustType(type)}`;
};

// What the tests call, for "your code doesn't match" messages and starters.
// It sits in an impl block, and has one parameter a line where it would pass
// 100 columns, as rustfmt writes it.
const fnSignature = (
  visibility: string,
  name: string,
  params: string[],
  returns: string,
  receiver?: string,
) => {
  const all = [...(receiver ? [receiver] : []), ...params];
  const flat = `${visibility}fn ${name}(${all.join(', ')})${returns}`;
  return `    ${flat} {`.length <= 100
    ? flat
    : `${visibility}fn ${name}(\n${all.map((param) => `        ${param},`).join('\n')}\n    )${returns}`;
};

const entrySignature = (spec: FunctionSpec) =>
  fnSignature(
    'pub ',
    nameIn(LANGUAGE, spec.entry, spec.names),
    paramList(spec.params, loopedParams(spec)),
    returnsPart(spec.returns),
    spec.injected ? '&self' : undefined,
  );

const ctorSignature = (spec: DesignSpec) =>
  fnSignature('', 'new', paramList(spec.ctor), ' -> Self');

const methodSignatures = (spec: DesignSpec) =>
  spec.methods.map((method) =>
    fnSignature(
      '',
      nameIn(LANGUAGE, method.name, method.names),
      paramList(method.params),
      returnsPart(method.returns),
      '&mut self',
    ),
  );

export const rustSignature = (spec: LessonSpec) =>
  spec.kind === 'function'
    ? `impl Solution {\n    ${entrySignature(spec)}\n}`
    : [
        `impl ${spec.className} {`,
        `    ${ctorSignature(spec)}`,
        ...methodSignatures(spec).map((signature) => `    ${signature}`),
        '}',
      ].join('\n');

// ---------------- lexing ----------------

export interface RustLexed extends Lexed {
  // The code with comments, strings and character literals blanked out
  masked: string;
}

const isIdentifierStart = (c: string) => /[A-Za-z_]/.test(c);
const isIdentifierPart = (c: string) => /[A-Za-z0-9_]/.test(c);

// Where a character literal starting at q ends, or -1 when the quote starts a
// lifetime or a label ('a, 'outer:)
const charLiteralEnd = (source: string, q: number) => {
  if (source[q + 1] === '\\') {
    // '\n', '\'', '\\', '\x41', '\u{1F600}'
    const end = source.indexOf("'", q + 3);
    return end > 0 && end - q <= 12 && !source.slice(q, end).includes('\n') ? end + 1 : -1;
  }
  const code = source.codePointAt(q + 1);
  if (code === undefined || source[q + 1] === '\n' || source[q + 1] === "'") {
    return -1;
  }
  const width = code > 0xffff ? 2 : 1;
  return source[q + 1 + width] === "'" ? q + 2 + width : -1;
};

// lexer.ts's lex() for Rust, whose strings may span lines and whose quote
// starts a lifetime as often as a character ('{' must not count as a brace)
export const lexRust = (source: string): RustLexed => {
  const identifiers: Token[] = [];
  const openLines: number[] = [];
  const masked = source.split('');
  const n = source.length;
  let depth = 0;
  let line = 1;
  let i = 0;

  const result = (unterminated: Lexed['unterminated']): RustLexed => ({
    identifiers,
    depth,
    openLines,
    unterminated,
    masked: masked.join(''),
  });

  // Blanks source[i, end), counting lines
  const skipTo = (end: number) => {
    for (; i < end && i < n; i++) {
      if (source[i] === '\n') {
        line++;
      } else {
        masked[i] = ' ';
      }
    }
  };

  const string = (open: number) => {
    let j = open;
    while (j < n && source[j] !== '"') {
      j += source[j] === '\\' ? 2 : 1;
    }
    return j < n ? j + 1 : -1;
  };

  while (i < n) {
    const c = source[i];
    const startLine = line;

    if (c === '\n') {
      line++;
      i++;
      continue;
    }

    if (c === '/' && source[i + 1] === '/') {
      const end = source.indexOf('\n', i);
      skipTo(end < 0 ? n : end);
      continue;
    }

    if (c === '/' && source[i + 1] === '*') {
      // Block comments nest
      let level = 0;
      let j = i;
      while (j < n) {
        if (source.startsWith('/*', j)) {
          level++;
          j += 2;
        } else if (source.startsWith('*/', j)) {
          level--;
          j += 2;
          if (level === 0) break;
        } else {
          j++;
        }
      }
      if (level > 0) {
        return result({ what: 'comment', line: startLine });
      }
      skipTo(j);
      continue;
    }

    if (c === '"') {
      const end = string(i + 1);
      if (end < 0) {
        return result({ what: 'string', line: startLine });
      }
      skipTo(end);
      continue;
    }

    // Prefixed literals: r"..", r#".."#, b"..", br"..", c"..", b'x'
    if (/[bcr]/.test(c) && !(i > 0 && isIdentifierPart(source[i - 1]))) {
      const raw = /^[bc]?r(#*)"/.exec(source.slice(i, i + 300));
      if (raw) {
        const close = `"${raw[1]}`;
        const end = source.indexOf(close, i + raw[0].length);
        if (end < 0) {
          return result({ what: 'string', line: startLine });
        }
        skipTo(end + close.length);
        continue;
      }
      if ((c === 'b' || c === 'c') && source[i + 1] === '"') {
        const end = string(i + 2);
        if (end < 0) {
          return result({ what: 'string', line: startLine });
        }
        skipTo(end);
        continue;
      }
      if (c === 'b' && source[i + 1] === "'") {
        const end = charLiteralEnd(source, i + 1);
        if (end > 0) {
          skipTo(end);
          continue;
        }
      }
    }

    if (c === "'") {
      const end = charLiteralEnd(source, i);
      if (end > 0) {
        skipTo(end);
        continue;
      }
    }

    if (c === '{') {
      depth++;
      openLines.push(line);
    } else if (c === '}') {
      depth--;
      openLines.pop();
    } else if (isIdentifierStart(c)) {
      let j = i;
      while (j < n && isIdentifierPart(source[j])) j++;
      identifiers.push({ text: source.slice(i, j), start: i, end: j, depth, line });
      i = j;
      continue;
    }

    i++;
  }

  return result(null);
};

// A crate-root `struct Solution` (or enum, union, type) of the learner's
const declaresAtRoot = (lexed: Lexed, name: string) =>
  lexed.identifiers.some(
    (token, k) =>
      token.depth === 0 &&
      ['struct', 'enum', 'union', 'type'].includes(token.text) &&
      lexed.identifiers[k + 1] &&
      lexed.identifiers[k + 1].text === name,
  );

// A crate-root `impl Solution` (or `impl Trait for Solution`)
const implementsAtRoot = (lexed: RustLexed, name: string) =>
  lexed.identifiers.some((token) => {
    if (token.depth !== 0 || token.text !== 'impl') {
      return false;
    }
    const header = /^[^{;]*/.exec(lexed.masked.slice(token.end));
    return !!header && new RegExp(`\\b${name}\\b`).test(header[0]);
  });

// ---------------- normalizing and assembling ----------------

// Only edits that keep every line where it was: no BOM, LF endings, a
// crate-root `fn main` renamed (the harness has the program's main; theirs is
// kept but not called), and `#![forbid(...)]` softened to deny, which the
// harness's own allow() can override
const normalizeCode = (code: string) => {
  let text = normalizeText(code);
  const { identifiers, masked } = lexRust(text);
  const edits: { start: number; end: number; text: string }[] = [];

  identifiers.forEach((token, k) => {
    const next = identifiers[k + 1];
    if (token.depth === 0 && token.text === 'fn' && next && next.text === 'main') {
      edits.push({ start: next.start, end: next.end, text: '__user_main' });
    }
    if (
      token.depth === 0 &&
      token.text === 'forbid' &&
      /#\s*!\s*\[\s*$/.test(masked.slice(Math.max(0, token.start - 20), token.start))
    ) {
      edits.push({ start: token.start, end: token.end, text: 'deny  ' });
    }
  });

  // Back to front, so earlier positions stay valid
  edits
    .sort((a, b) => b.start - a.start)
    .forEach((edit) => {
      text = text.slice(0, edit.start) + edit.text + text.slice(edit.end);
    });

  return { code: text, errors: [] };
};

const injectedImpl = (spec: FunctionSpec) => {
  const hidden = spec.hidden || [];
  // Per-test values only the tests' helper sees, set before each call
  const statics = hidden.flatMap((param, i) => [
    '::std::thread_local! {',
    `    ${LINTS}`,
    `    static __HIDDEN_${i}: ::std::cell::RefCell<::std::option::Option<${rustType(
      parseType(param.type),
      true,
    )}>> = const { ::std::cell::RefCell::new(::std::option::Option::None) };`,
    '}',
  ]);
  const { injected } = spec;

  if (!injected) {
    return statics;
  }

  const body = injected.body[LANGUAGE] || injected.body[CodingLanguage.Javascript];

  if (!body) {
    throw new Error(`The injected ${injected.name} has no Rust body`);
  }

  // A method of Solution, as on LeetCode: the learner calls self.is_bad_version(v)
  return [
    ...statics,
    LINTS,
    'impl Solution {',
    `    pub fn ${nameIn(LANGUAGE, injected.name)}(&self, ${injected.params
      .map(
        (param) =>
          `${parameterName(LANGUAGE, param.name)}: ${rustType(parseType(param.type), true)}`,
      )
      .join(
        ', ',
      )})${parseType(injected.returns).kind === 'void' ? '' : ` -> ${rustType(parseType(injected.returns), true)}`} {`,
    ...hidden.map(
      (param, i) =>
        `        let ${parameterName(LANGUAGE, param.name)}: ${rustType(
          parseType(param.type),
          true,
        )} = __harness::hidden(&__HIDDEN_${i});`,
    ),
    `        ${body}`,
    '    }',
    '}',
    '',
  ];
};

const functionDriver = (spec: FunctionSpec, ownSolution: boolean) => {
  const hidden = spec.hidden || [];
  const looped = loopedParams(spec);
  const args = spec.params.map((_param, i) => (looped.has(i) ? `&__a${i}` : `__a${i}`)).join(', ');
  const name = nameIn(LANGUAGE, spec.entry, spec.names);
  // With a helper to call, the entry takes &self (LeetCode's first-bad-version)
  const call = spec.injected ? `__s.${name}(${args})` : `Solution::${name}(${args})`;
  const returns = parseType(spec.returns);

  return [
    // Unless the learner wrote their own `struct Solution;`
    ...(ownSolution ? [] : [LINTS, 'pub struct Solution;', '']),
    ...injectedImpl(spec),
    LINTS,
    'fn __test(__case: &__harness::Json) -> ::std::string::String {',
    `    let __args = __harness::args(__case, "args", ${spec.params.length});`,
    ...spec.params.map((param, i) =>
      looped.has(i)
        ? `    let __a${i} = __hlist::with_loop(&__args[${i}]);`
        : `    let __a${i}: ${rustType(parseType(param.type), true)} = __harness::from_json(&__args[${i}]);`,
    ),
    ...(hidden.length
      ? [
          `    let __hidden = __harness::args(__case, "hidden", ${hidden.length});`,
          ...hidden.map(
            (param, i) =>
              `    __harness::set_hidden(&__HIDDEN_${i}, __harness::from_json::<${rustType(
                parseType(param.type),
                true,
              )}>(&__hidden[${i}]));`,
          ),
        ]
      : []),
    ...(spec.injected ? ['    let mut __s = Solution;'] : []),
    '    __harness::tic();',
    // Any type the answer can be written from (Vec<i32>, Vec<usize>, [i32; 2]...),
    // except that a node of the input tree must come back as one
    returns.kind === 'BinaryNodeRef'
      ? `    let __r: ${rustType(returns, true)} = ${call};`
      : `    let __r = ${call};`,
    '    __harness::toc();',
    returns.kind === 'BinaryNodeRef'
      ? '    __htree::node_data(&__r)'
      : '    __harness::answer(&__r)',
    '}',
  ];
};

const designDriver = (spec: DesignSpec) => {
  const ctor = spec.ctor.map((param) => parseType(param.type));
  const cases = spec.methods.flatMap((method) => {
    const returns = parseType(method.returns);
    const call = `__o.${nameIn(LANGUAGE, method.name, method.names)}(${method.params
      .map((_param, i) => `__p${i}`)
      .join(', ')})`;

    return [
      `            ${JSON.stringify(method.name)} => {`,
      `                __harness::op_arity(__op, ${method.params.length});`,
      ...method.params.map(
        (param, i) =>
          `                let __p${i}: ${rustType(
            parseType(param.type),
            true,
          )} = __harness::from_json(__harness::op_arg(__op, ${i}));`,
      ),
      ...(returns.kind === 'BinaryNodeRef'
        ? [
            `                let __v: ${rustType(returns, true)} = ${call};`,
            '                __harness::Answers::push_json(&mut __out, __htree::node_data(&__v));',
          ]
        : [
            `                let __v = ${call};`,
            '                __harness::Answers::push(&mut __out, &__v);',
          ]),
      '            }',
    ];
  });

  return [
    LINTS,
    'fn __test(__case: &__harness::Json) -> ::std::string::String {',
    `    let __ctor = __harness::args(__case, "ctorArgs", ${ctor.length});`,
    ...ctor.map(
      (type, i) =>
        `    let __c${i}: ${rustType(type, true)} = __harness::from_json(&__ctor[${i}]);`,
    ),
    '    let __ops = __harness::ops(__case);',
    '    let mut __out = __harness::Answers::new();',
    '    __harness::tic();',
    `    let mut __o = ${spec.className}::new(${ctor.map((_type, i) => `__c${i}`).join(', ')});`,
    '    for __k in 0..__ops.len() {',
    '        let __op = &__ops[__k];',
    '        match __harness::op_at(__k, __op) {',
    ...cases,
    '            __name => __harness::unknown_op(__name),',
    '        }',
    '    }',
    '    __harness::toc();',
    '    __harness::Answers::finish(__out)',
    '}',
  ];
};

const assemble = (code: string, spec: LessonSpec): Assembled => {
  const used = runnerTypesIn(spec);
  const userLines = countLines(code);
  const ownSolution = spec.kind === 'function' && declaresAtRoot(lexRust(code), 'Solution');
  const driver = spec.kind === 'function' ? functionDriver(spec, ownSolution) : designDriver(spec);

  const source = [
    code,
    preludes['rust.core.rs'],
    ...RUNNER_TYPES.filter((type) => used.has(type)).map((type) => preludes[`rust.${type}.rs`]),
    '// ==== driver ====',
    ...driver,
    '',
    LINTS,
    'fn main() {',
    `    __harness::run(__test, ${userLines});`,
    '}',
    '',
  ].join('\n');

  return { source, userLines, lineOffset: 0 };
};

// ---------------- compiler diagnostics ----------------

interface RustcError {
  line: number | null;
  column: number | null;
  message: string;
}

// rustc --error-format=short prints one line per error,
// "main.rs:7:33: error[E0308]: mismatched types: expected `i32`, found `&str`",
// and a few without a place, such as "error: linking with `cc` failed"
const parseRustc = (output: string): RustcError[] =>
  output.split('\n').flatMap((text): RustcError[] => {
    const placed = /^main\.rs:(\d+):(\d+): error(?:\[E\d+\])?: (.*)$/.exec(text);
    if (placed) {
      return [{ line: Number(placed[1]), column: Number(placed[2]), message: placed[3].trim() }];
    }
    const general = /^error(?:\[E\d+\])?: (.*)$/.exec(text);
    return general && !/^aborting due to/.test(general[1])
      ? [{ line: null, column: null, message: general[1].trim() }]
      : [];
  });

// Errors in the learner's code are shown where they are. Errors only in the
// harness mean the code doesn't fit around it; say why in their terms.
const diagnosticsFor =
  (spec: LessonSpec) =>
  (output: string, assembled: Assembled): Diagnostic[] => {
    const errors = parseRustc(output);
    const own = errors.filter((error) => error.line !== null && error.line <= assembled.userLines);
    const helper =
      spec.kind === 'function' && spec.injected ? nameIn(LANGUAGE, spec.injected.name) : null;

    if (own.length) {
      // A learner's own copy of the tests' helper: say so where it's defined,
      // and drop the "multiple applicable items" errors it causes at the calls
      const ownHelper =
        !!helper &&
        own.some((error) =>
          error.message.startsWith(`duplicate definitions with name \`${helper}\``),
        );
      return own
        .filter((error) => !(ownHelper && error.message.includes(`multiple \`${helper}\` found`)))
        .slice(0, 20)
        .map(({ line, column, message }) => ({
          line,
          column,
          message:
            ownHelper && message.startsWith(`duplicate definitions with name \`${helper}\``)
              ? `\`${helper}\` is provided by the test runner, so remove your own \`fn ${helper}\``
              : message,
        }));
    }

    if (!errors.length) {
      return output.trim()
        ? [{ line: null, column: null, message: output.trim().slice(0, 500) }]
        : [];
    }

    // Not about the code's shape (a failed link, say): shown as they are
    if (errors.every((error) => error.line === null)) {
      return errors.slice(0, 20).map(({ message }) => ({ line: null, column: null, message }));
    }

    const code = assembled.source.split('\n').slice(0, assembled.userLines).join('\n');
    const lexed = lexRust(code);

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
      .map((error) => /the name `(\w+)` is defined multiple times/.exec(error.message))
      .find(Boolean);

    if (duplicate) {
      const name = duplicate[1];
      return [
        {
          line: null,
          column: null,
          message:
            (RUNNER_TYPES as string[]).includes(name) || name === 'Solution'
              ? `\`${name}\` is provided by the test runner, so remove your own \`struct ${name}\``
              : `Rename your \`${name}\`: the test runner uses that name`,
        },
      ];
    }

    if (
      spec.kind === 'function'
        ? !implementsAtRoot(lexed, 'Solution')
        : !declaresAtRoot(lexed, spec.className)
    ) {
      return [
        {
          line: null,
          column: null,
          message:
            spec.kind === 'function'
              ? 'Your code needs an `impl Solution`, as in the starting code'
              : `Your code needs a \`struct ${spec.className}\`, as in the starting code`,
        },
      ];
    }

    return [
      {
        line: null,
        column: null,
        message: `Your code doesn't match what the tests call. They expect:\n${rustSignature(spec)}`,
      },
    ];
  };

// ---------------- starting code ----------------

// What a function returns in starting code: a value of the right type that
// fails the tests
const placeholder = (type: TypeNode): string => {
  switch (type.kind) {
    case 'scalar':
      return {
        int: '0',
        long: '0',
        double: '0.0',
        bool: 'false',
        char: "' '",
        string: 'String::new()',
      }[type.name];
    case 'array':
      return 'vec![]';
    case 'map':
      return 'HashMap::new()';
    case 'Interval':
      return 'Interval::new(0.0, 0.0)';
    case 'Item':
      return 'Item::new(0, 0)';
    default:
      return 'None';
  }
};

const NODE_COMMENTS: Record<string, string[]> = {
  ListNode: [
    '// The test runner provides ListNode (which {:?} prints as 1 -> 2 -> 3):',
    '// #[derive(PartialEq, Eq, Clone)]',
    '// pub struct ListNode {',
    '//     pub data: i32,',
    '//     pub next: Option<Box<ListNode>>,',
    '// }',
    '//',
    '// impl ListNode {',
    '//     pub fn new(data: i32) -> Self { ... }',
    '// }',
  ],
  BinaryNode: [
    '// The test runner provides BinaryNode:',
    '// #[derive(Debug, PartialEq, Eq)]',
    '// pub struct BinaryNode {',
    '//     pub data: i32,',
    '//     pub left: Option<Rc<RefCell<BinaryNode>>>,',
    '//     pub right: Option<Rc<RefCell<BinaryNode>>>,',
    '// }',
    '//',
    '// impl BinaryNode {',
    '//     pub fn new(data: i32) -> Self { ... }',
    '// }',
  ],
  Interval: [
    '// The test runner provides Interval:',
    '// #[derive(Debug, Clone, Copy, PartialEq, Default)]',
    '// pub struct Interval {',
    '//     pub start: f64,',
    '//     pub end: f64,',
    '// }',
    '//',
    '// impl Interval {',
    '//     pub fn new(start: f64, end: f64) -> Self { ... }',
    '// }',
  ],
  Item: [
    '// The test runner provides Item:',
    '// #[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Default)]',
    '// pub struct Item {',
    '//     pub weight: i32,',
    '//     pub value: i32,',
    '// }',
    '//',
    '// impl Item {',
    '//     pub fn new(weight: i32, value: i32) -> Self { ... }',
    '// }',
  ],
};

const usesMap = (spec: LessonSpec) => {
  const hasMap = (node: TypeNode): boolean =>
    node.kind === 'map' || ((node.kind === 'array' || node.kind === 'nullable') && hasMap(node.of));
  const types =
    spec.kind === 'function'
      ? [...spec.params.map((param) => param.type), spec.returns]
      : [
          ...spec.ctor.map((param) => param.type),
          ...spec.methods.flatMap((method) => [
            ...method.params.map((param) => param.type),
            method.returns,
          ]),
        ];
  return types.some((type) => hasMap(parseType(type)));
};

const body = (returns: string, comment: string) => {
  const type = parseType(returns);
  return [
    `        // ${comment}`,
    ...(type.kind === 'void' ? [] : [`        ${placeholder(type)}`]),
  ];
};

// Starting code for a lesson: the impl the tests call, with placeholder bodies
export const rustStarter = (spec: LessonSpec) => {
  const used = runnerTypesIn(spec);
  const comments = RUNNER_TYPES.filter((type) => used.has(type)).flatMap((type) => [
    ...NODE_COMMENTS[type],
    '',
  ]);
  const imports = [
    ...(used.has('BinaryNode') ? ['use std::cell::RefCell;', 'use std::rc::Rc;'] : []),
    ...(usesMap(spec) ? ['use std::collections::HashMap;'] : []),
  ];
  const header = [...comments, ...(imports.length ? [...imports, ''] : [])];

  if (spec.kind === 'function') {
    const injected = spec.injected
      ? [
          `// The test runner provides self.${nameIn(LANGUAGE, spec.injected.name)}(${paramList(
            spec.injected.params,
          ).join(', ')})${returnsPart(spec.injected.returns)}`,
        ]
      : [];
    return [
      ...header,
      ...injected,
      'impl Solution {',
      `    ${entrySignature(spec)} {`,
      ...body(spec.returns, 'Your solution here'),
      '    }',
      '}',
      '',
    ].join('\n');
  }

  const signatures = methodSignatures(spec);
  return [
    ...header,
    `struct ${spec.className} {}`,
    '',
    `impl ${spec.className} {`,
    `    ${ctorSignature(spec)} {`,
    '        // Set up your struct here',
    `        ${spec.className} {}`,
    '    }',
    ...spec.methods.flatMap((method, i) => [
      '',
      `    ${signatures[i]} {`,
      ...body(method.returns, 'Your solution here'),
      '    }',
    ]),
    '}',
    '',
  ].join('\n');
};

export const rustRuntime: LanguageRuntime = {
  language: LANGUAGE,
  version: 'rust-1',
  // A stack overflow on the 256 MB test thread aborts cleanly (and is reported
  // as one) only if the stack fits in memory
  limits: { cpuSeconds: 5, wallSeconds: 10, memoryKb: 512000, maxFileSizeKb: 1024 },
  docker: {
    image: 'rust:1.99.0-slim',
    sourceFile: 'main.rs',
    // Overflow checks as on LeetCode; lints off so the learner sees only
    // errors; never panic=abort, which would stop catching a test's panic
    compile:
      'rustc --edition 2024 -C opt-level=1 -C overflow-checks=on -C strip=debuginfo -A warnings --error-format=short -o main main.rs',
    run: './main',
    compileMemoryKb: 1024000,
  },
  normalize: normalizeCode,
  assemble,
  diagnostics: (output, assembled, spec) => diagnosticsFor(spec)(output, assembled),
  starter: rustStarter,
};
