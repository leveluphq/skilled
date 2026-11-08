import { CodingLanguage } from 'utils/constants/lesson';
import { nameIn } from 'utils/shared/runner/naming';
import { DesignSpec, FunctionSpec, LessonSpec } from 'utils/shared/runner/types';
import preludes from '../preludes/preludes.gen';
import { Assembled, Diagnostic, LanguageRuntime } from './types';

// JavaScript and TypeScript share one harness: TypeScript is the same program
// compiled by tsc first. The learner's code comes first, so their line N is
// line N of the file (N + 1 for TypeScript, after its `// @ts-nocheck`).

const literal = (value: unknown) => JSON.stringify(value);

const argument = (source: string, type: string) => `__toArg(${source}, ${literal(type)})`;

const functionDriver = (spec: FunctionSpec, language: CodingLanguage) => {
  const lines: string[] = ['var __hidden = [];'];

  if (spec.injected) {
    const injected = spec.injected;
    const body = injected.body[language] || injected.body[CodingLanguage.Javascript];

    if (!body) {
      throw new Error(`The injected ${injected.name} has no JavaScript body`);
    }

    lines.push(
      `var __injected = function (${injected.params.map((param) => param.name).join(', ')}) {`,
      ...(spec.hidden || []).map((param, i) => `  var ${param.name} = __hidden[${i}];`),
      `  ${body}`,
      '};',
      `globalThis.${injected.name} = __injected;`,
      // A learner's own top-level ${injected.name} would shadow the global
      // (node runs the file as a module), so replace theirs too, as the
      // lesson's tests always have. A const can't be replaced and keeps theirs.
      `try { ${injected.name} = __injected; } catch (__error) {}`,
    );
  }

  const args = spec.params.map((param, i) => argument(`__test.args[${i}]`, param.type)).join(', ');

  lines.push(
    '__run(function (__test) {',
    '  __hidden = __test.hidden || [];',
    `  return __fromResult(${nameIn(language, spec.entry, spec.names)}(${args}), ${literal(spec.returns)});`,
    '});',
  );

  return lines;
};

const designDriver = (spec: DesignSpec, language: CodingLanguage) => {
  const ctorArgs = spec.ctor
    .map((param, i) => argument(`__test.ctorArgs[${i}]`, param.type))
    .join(', ');
  const cases = spec.methods.map((method) => {
    const args = method.params.map((param, i) => argument(`__op[${i + 1}]`, param.type)).join(', ');
    return `      case ${literal(method.name)}: return __fromResult(__instance.${nameIn(language, method.name, method.names)}(${args}), ${literal(method.returns)});`;
  });

  return [
    '__run(function (__test) {',
    `  var __instance = new ${spec.className}(${ctorArgs});`,
    '  return __test.ops.map(function (__op) {',
    '    switch (__op[0]) {',
    ...cases,
    "      default: throw new Error('Unknown operation: ' + __op[0]);",
    '    }',
    '  });',
    '});',
  ];
};

export const normalizeCode = (code: string) => {
  let text = code.replace(/^﻿/, '').replace(/\r\n?/g, '\n');

  if (!text.endsWith('\n')) {
    text += '\n';
  }

  return { code: text, errors: [] as string[] };
};

export const countLines = (code: string) => code.split('\n').length - 1;

const assembleScript = (code: string, spec: LessonSpec, language: CodingLanguage): Assembled => {
  const header = language === CodingLanguage.Typescript ? '// @ts-nocheck\n' : '';
  const userLines = countLines(code);
  const driver =
    spec.kind === 'function' ? functionDriver(spec, language) : designDriver(spec, language);
  // Stack traces of compiled TypeScript point into tsc's output, not the
  // learner's lines, so only JavaScript reports them
  const config = { userLines, reportLines: language === CodingLanguage.Javascript };

  const source = [
    `${header}${code}`,
    // The semicolon stops the IIFE being read as a call on the learner's last expression
    ';(function () {',
    `var __CONFIG__ = ${literal(config)};`,
    preludes['javascript.js'],
    ...driver,
    '})();',
    '',
  ].join('\n');

  return { source, userLines, lineOffset: header ? 1 : 0 };
};

// "script.ts(3,15): error TS1005: ',' expected." or, from node,
// "/box/script.js:3" followed by the source line and a caret
const diagnosticsFor = (output: string, assembled: Assembled): Diagnostic[] => {
  const diagnostics: Diagnostic[] = [];
  const tsPattern = /script\.ts\((\d+),(\d+)\): (.*)/g;
  let match: RegExpExecArray | null;

  while ((match = tsPattern.exec(output))) {
    const line = Number(match[1]) - assembled.lineOffset;
    diagnostics.push(
      line >= 1 && line <= assembled.userLines
        ? { line, column: Number(match[2]), message: match[3] }
        : {
            line: null,
            column: null,
            message: `${match[3]} (check for a missing closing brace at the end of your code)`,
          },
    );
  }

  if (diagnostics.length) {
    return diagnostics;
  }

  const nodeSyntax = /script\.js:(\d+)\n[\s\S]*?\n(SyntaxError: [^\n]*)/.exec(output);

  if (nodeSyntax) {
    const line = Number(nodeSyntax[1]) - assembled.lineOffset;
    return [
      line >= 1 && line <= assembled.userLines
        ? { line, column: null, message: nodeSyntax[2] }
        : {
            line: null,
            column: null,
            message: `${nodeSyntax[2]} (check for a missing closing brace at the end of your code)`,
          },
    ];
  }

  return [];
};

const LIMITS = { cpuSeconds: 5, wallSeconds: 10, memoryKb: 256000, maxFileSizeKb: 1024 };

// Docker runs current releases. Judge0, the website's
// bridge, runs its newest: Node.js 22.08 (102) and TypeScript 5.6.2 (101).
export const javascriptRuntime: LanguageRuntime = {
  language: CodingLanguage.Javascript,
  version: 'javascript-2',
  limits: LIMITS,
  judge0: { languageId: 102 },
  docker: { image: 'node:24.22.0-slim', sourceFile: 'script.js', run: 'node script.js' },
  // Node.js can't be held to a memory limit from outside, but its heap can
  system: { run: ['{node}', '--max-old-space-size={memoryMb}', 'script.js'] },
  normalize: normalizeCode,
  assemble: (code, spec) => assembleScript(code, spec, CodingLanguage.Javascript),
  diagnostics: diagnosticsFor,
};

// Without --lib, tsc loads the DOM types, whose `Node` collides with lesson
// classes (B30)
const TSC_OPTIONS = '--target ES2022 --lib ES2023 --module commonjs';
// Judge0's "TypeScript (5.6.2)" compiles with an older tsc that stops at
// ES2020 (found by B35, 2026-10-14); Node.js 22 runs the result
const JUDGE0_TSC_OPTIONS = '--target ES2020 --lib ES2020 --module commonjs';

export const typescriptRuntime: LanguageRuntime = {
  language: CodingLanguage.Typescript,
  version: 'typescript-2',
  limits: LIMITS,
  judge0: { languageId: 101, compilerOptions: JUDGE0_TSC_OPTIONS },
  docker: {
    image: 'skilled-runner/typescript:7.0.2',
    sourceFile: 'script.ts',
    compile: `tsc ${TSC_OPTIONS} script.ts`,
    run: 'node script.js',
  },
  // The same tsc as the image (see backends/system.ts)
  system: {
    compile: ['{tsc}', ...TSC_OPTIONS.split(' '), 'script.ts'],
    run: ['{node}', '--max-old-space-size={memoryMb}', 'script.js'],
  },
  normalize: normalizeCode,
  assemble: (code, spec) => assembleScript(code, spec, CodingLanguage.Typescript),
  diagnostics: diagnosticsFor,
};
