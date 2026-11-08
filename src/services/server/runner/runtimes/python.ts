import { CodingLanguage } from 'utils/constants/lesson';
import { functionName, nameIn } from 'utils/shared/runner/naming';
import { DesignSpec, FunctionSpec, LessonSpec } from 'utils/shared/runner/types';
import preludes from '../preludes/preludes.gen';
import { countLines, normalizeCode } from './javascript';
import { Assembled, Diagnostic, LanguageRuntime } from './types';

// The learner's code comes first, so their line N is line N of script.py.

const literal = (value: unknown) => JSON.stringify(value);

const argument = (source: string, type: string) => `_sk_to_arg(${source}, ${literal(type)})`;

const functionDriver = (spec: FunctionSpec) => {
  const lines: string[] = ['_sk_hidden = []', ''];

  if (spec.injected) {
    const injected = spec.injected;
    const body = injected.body[CodingLanguage.Python];

    if (!body) {
      throw new Error(`The injected ${injected.name} has no Python body`);
    }

    lines.push(
      `def ${functionName(CodingLanguage.Python, injected.name)}(${injected.params
        .map((param) => functionName(CodingLanguage.Python, param.name))
        .join(', ')}):`,
      ...(spec.hidden || []).map(
        (param, i) => `    ${functionName(CodingLanguage.Python, param.name)} = _sk_hidden[${i}]`,
      ),
      `    ${body}`,
      '',
    );
  }

  const args = spec.params
    .map((param, i) => argument(`_sk_test['args'][${i}]`, param.type))
    .join(', ');

  lines.push(
    'def _sk_run_test(_sk_test):',
    "    _sk_hidden[:] = _sk_test.get('hidden', [])",
    `    return _sk_from_result(${nameIn(CodingLanguage.Python, spec.entry, spec.names)}(${args}), ${literal(spec.returns)})`,
  );

  return lines;
};

const designDriver = (spec: DesignSpec) => {
  const ctorArgs = spec.ctor
    .map((param, i) => argument(`_sk_test['ctorArgs'][${i}]`, param.type))
    .join(', ');
  const cases = spec.methods.map((method, index) => {
    const args = method.params
      .map((param, i) => argument(`_sk_op[${i + 1}]`, param.type))
      .join(', ');
    const call = `_sk_instance.${nameIn(CodingLanguage.Python, method.name, method.names)}(${args})`;
    return [
      `        ${index === 0 ? 'if' : 'elif'} _sk_op[0] == ${literal(method.name)}:`,
      `            _sk_results.append(_sk_from_result(${call}, ${literal(method.returns)}))`,
    ];
  });

  return [
    'def _sk_run_test(_sk_test):',
    `    _sk_instance = ${spec.className}(${ctorArgs})`,
    '    _sk_results = []',
    "    for _sk_op in _sk_test['ops']:",
    ...cases.reduce<string[]>((all, lines) => all.concat(lines), []),
    '        else:',
    "            raise ValueError('Unknown operation: ' + _sk_op[0])",
    '    return _sk_results',
  ];
};

const assemble = (code: string, spec: LessonSpec): Assembled => {
  const userLines = countLines(code);
  const driver = spec.kind === 'function' ? functionDriver(spec) : designDriver(spec);

  const source = [
    code,
    preludes['python.py'],
    `_sk_config = ${literal({ user_lines: userLines })}`,
    '',
    ...driver,
    '',
    '_sk_start()',
    '',
  ].join('\n');

  return { source, userLines, lineOffset: 0 };
};

// File "/box/script.py", line 7  ...  SyntaxError: invalid syntax
const diagnostics = (output: string, assembled: Assembled): Diagnostic[] => {
  const match =
    /File "[^"]*script\.py", line (\d+)[\s\S]*?\n((?:SyntaxError|IndentationError|TabError)[^\n]*)/.exec(
      output,
    );

  if (!match) {
    return [];
  }

  const line = Number(match[1]);

  return [
    line <= assembled.userLines
      ? { line, column: null, message: match[2] }
      : {
          line: null,
          column: null,
          message: `${match[2]} (check the end of your code for an unclosed bracket or string)`,
        },
  ];
};

export const pythonRuntime: LanguageRuntime = {
  language: CodingLanguage.Python,
  version: 'python-2',
  limits: { cpuSeconds: 5, wallSeconds: 10, memoryKb: 256000, maxFileSizeKb: 1024 },
  // Python 3.14.0 on Judge0, the website's bridge
  judge0: { languageId: 113 },
  docker: { image: 'python:3.14.8-slim', sourceFile: 'script.py', run: 'python3 script.py' },
  system: { run: ['{python}', 'script.py'] },
  normalize: normalizeCode,
  assemble,
  diagnostics,
};
