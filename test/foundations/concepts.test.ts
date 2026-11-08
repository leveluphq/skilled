import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { CodingLanguage } from 'utils/constants/lesson';
import { runtimeFor } from 'services/server/runner/runtimes';
import { Program } from 'services/server/runner/program';
import { runPublished } from '../walkthroughs/native';
import { prepare } from './program';
import concepts from '../../src/content/lesson-walkthroughs/foundations/concepts.json';

const cases: { function: string; args: any[]; expected: unknown }[] = require('./cases.json');
const root = process.cwd();
const content = path.join(root, 'src/content');
const selected = (process.env.FOUNDATION_LANGUAGES || 'javascript,typescript,python').split(',');

function examples(language: string) {
  const imports = new Set<string>();
  const body = concepts
    .map((entry) => {
      const source = fs.readFileSync(
        path.join(
          content,
          'lesson-walkthroughs/foundations/examples',
          entry.lesson,
          `${language}.mdx`,
        ),
        'utf8',
      );
      const blocks = [...source.matchAll(/```[a-zA-Z0-9+#]*\n([\s\S]*?)```/g)];
      expect(blocks).toHaveLength(1);
      const code = blocks[0][1].trim();
      if (process.env.FOUNDATION_SOURCE_ONLY !== '1') {
        const published = fs.readFileSync(
          path.join(content, 'lesson-walkthroughs', entry.lesson, `${language}.mdx`),
          'utf8',
        );
        expect(published).toContain(`\`\`\`${language}\n${code}\n\`\`\``);
      }
      if (['java', 'csharp', 'rust', 'go'].includes(language))
        return code.replace(/^(?:import |using |use )[^\n]+\n?/gm, (line) => {
          imports.add(line.trim());
          return '';
        });
      return code;
    })
    .join('\n\n');
  return { body, imports: [...imports].join('\n') };
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
  const test = selected.includes('all') || selected.includes(slug) ? it : it.skip;
  test(`${slug}: all 23 published concept examples match ${cases.length} independent cases`, async () => {
    const runtime = runtimeFor(language)!;
    const nonce = crypto.randomBytes(16).toString('hex');
    const prepared = prepare(slug, nonce, examples(slug), concepts, cases);
    const result = await runPublished({
      runtime,
      assembled: { source: prepared.source, userLines: 0, diagnostics: [] },
      stdin: prepared.stdin,
      nonce,
      limits: { ...runtime.limits, cpuSeconds: 120, wallSeconds: 180, maxFileSizeKb: 16 * 1024 },
    } as unknown as Program);
    if (result.statusId !== 3) throw new Error(JSON.stringify(result));
    const lines = result.stdout.toString('utf8').trim().split('\n');
    const answers = prepared.protocol
      ? lines
          .filter((line) => line.startsWith(nonce))
          .map((line) => JSON.parse(line.slice(nonce.length)))
          .filter((event) => event.t === 'result')
          .map((event) => {
            if (!event.ok) throw new Error(JSON.stringify(event));
            return event.out;
          })
      : lines.map((line) => JSON.parse(line));
    expect(answers).toHaveLength(cases.length);
    for (let i = 0; i < cases.length; i++) {
      if (JSON.stringify(answers[i]) !== JSON.stringify(cases[i].expected))
        throw new Error(
          `${slug}: case ${i}: ${JSON.stringify(cases[i])}; received ${JSON.stringify(answers[i])}`,
        );
    }
  });
}
