import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import ts from 'typescript';
import os from 'os';
import { CodingLanguage } from 'utils/constants/lesson';
import { runtimeFor } from 'services/server/runner/runtimes';
import { Program } from 'services/server/runner/program';
import { runPublished } from '../walkthroughs/native';
import { prepare } from './program';
import { adapter } from './adapters';
import { implementationCases, swiftUnicodeHashCases } from './implementationCases';
import manifest from '../../src/content/lesson-walkthroughs/foundations/manifest.json';
const selected = (process.env.FOUNDATION_LANGUAGES || 'javascript,typescript,python').split(',');
const kinds: Record<string, string> = {
  'implement-an-array': 'array',
  'implement-a-hash-table': 'hash',
  'implement-a-linked-list': 'list',
  'implement-a-queue': 'queue',
  'implement-a-stack': 'stack',
  'implement-a-binary-search-tree': 'tree',
  'implement-a-graph': 'graph',
};
const content = path.join(process.cwd(), 'src/content');
function example(entry: (typeof manifest)[number], language: string) {
  const text = fs.readFileSync(
    path.join(content, entry.examples[0].source.replace('{language}', language)),
    'utf8',
  );
  const code = text.match(/```\w+\n([\s\S]*?)```/)![1].trim();
  if (process.env.FOUNDATION_SOURCE_ONLY !== '1')
    expect(
      fs.readFileSync(
        path.join(content, 'lesson-walkthroughs', entry.lesson, language + '.mdx'),
        'utf8',
      ),
    ).toContain('```' + language + '\n' + code + '\n```');
  return code;
}
for (const language of Object.values(CodingLanguage)) {
  const slug = language.toLowerCase();
  if (
    ![
      'javascript',
      'typescript',
      'python',
      'java',
      'cpp',
      'go',
      'rust',
      'csharp',
      'kotlin',
      'swift',
    ].includes(slug)
  )
    continue;
  const check = selected.includes('all') || selected.includes(slug) ? it : it.skip;
  for (const entry of manifest.filter((e) => e.kind === 'implementation'))
    check(
      `${slug}: ${entry.lesson} matches operation models and structural invariants`,
      async () => {
        let code = example(entry, slug) + '\n' + adapter(slug, kinds[entry.lesson]);
        const imports = new Set<string>();
        if (['java', 'csharp', 'rust', 'go'].includes(slug))
          code = code.replace(/^(?:import |using |use )[^\n]+\n?/gm, (line) => {
            imports.add(line.trim());
            return '';
          });
        // Reflection only observes the lesson's private Java fields; it does not replace any operation.
        if (slug === 'java') imports.add('import java.util.*;');
        const cases = implementationCases(kinds[entry.lesson]);
        if (slug === 'swift' && kinds[entry.lesson] === 'hash')
          cases.push(...swiftUnicodeHashCases());
        const nonce = crypto.randomBytes(16).toString('hex');
        const prepared = prepare(
          slug,
          nonce,
          { body: code, imports: [...imports].join('\n') },
          [{ function: 'verify', arguments: ['graph', 'int'] }],
          cases,
        );
        const runtime = runtimeFor(language)!;
        const result = await runPublished({
          runtime,
          assembled: { source: prepared.source, userLines: 0, diagnostics: [] },
          stdin: prepared.stdin,
          nonce,
          limits: {
            ...runtime.limits,
            cpuSeconds: 120,
            wallSeconds: 180,
            maxFileSizeKb: 16 * 1024,
          },
        } as unknown as Program);
        if (result.statusId !== 3) throw Error(JSON.stringify(result));
        const lines = result.stdout.toString('utf8').trim().split('\n');
        const answers = prepared.protocol
          ? lines
              .filter((line) => line.startsWith(nonce))
              .map((line) => JSON.parse(line.slice(nonce.length)))
              .filter((event) => event.t === 'result')
              .map((event) => {
                if (!event.ok) throw Error(JSON.stringify(event));
                return event.out;
              })
          : lines.map((line) => JSON.parse(line));
        expect(answers).toHaveLength(cases.length);
        for (let i = 0; i < cases.length; i++)
          if (JSON.stringify(answers[i]) !== JSON.stringify(cases[i].expected))
            throw Error(
              `${slug}/${entry.lesson} trace ${i}: ${JSON.stringify(
                cases[i],
              )}; received ${JSON.stringify(answers[i])}`,
            );
      },
    );
}
it('strictly type-checks the standalone TypeScript data-structure definitions', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'skilled-implementation-types-'));
  try {
    const files = manifest
      .filter((e) => e.kind === 'implementation')
      .map((entry) => {
        const file = path.join(dir, entry.lesson + '.ts');
        fs.writeFileSync(file, example(entry, 'typescript'));
        return file;
      });
    for (const file of files) {
      const program = ts.createProgram([file], {
        noEmit: true,
        strict: true,
        target: ts.ScriptTarget.ES2020,
        types: [],
        lib: ['lib.es2020.d.ts', 'lib.dom.d.ts'],
      });
      expect(
        ts
          .getPreEmitDiagnostics(program)
          .map(
            (d) =>
              (d.file ? path.basename(d.file.fileName) + ': ' : '') +
              ts.flattenDiagnosticMessageText(d.messageText, '\n'),
          ),
      ).toEqual([]);
    }
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
