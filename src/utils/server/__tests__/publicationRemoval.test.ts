import fs from 'fs';
import os from 'os';
import path from 'path';

const { compose, languages, marker } = require('../../../scripts/composeWalkthroughs');
const resourceGenerator = require('../../../scripts/generateResources');
const roots: string[] = [];
const temporary = () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'skilled-publication-'));
  roots.push(root);
  return root;
};
const write = (file: string, text: string) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
};
afterEach(() => {
  for (const root of roots.splice(0)) fs.rmSync(root, { recursive: true, force: true });
});

it('unpublishes removed composed walkthroughs while preserving bespoke content and unrelated editorial files', () => {
  const root = temporary();
  const lessonsRoot = path.join(root, 'lessons');
  const original = {
    lesson: 'existing',
    language: 'python',
    title: 'Original',
    description: 'Original reading page',
  };
  write(path.join(root, 'catalog.json'), JSON.stringify([original]));
  write(path.join(root, 'existing/python.mdx'), 'Bespoke content');
  write(path.join(root, 'new-problem/editor-notes.mdx'), 'Handwritten notes');
  write(path.join(root, 'curriculum/new-problem.md'), 'The reviewed shared problem chapter.');
  write(path.join(lessonsRoot, 'new-problem/runner.spec.ts'), '');
  const notes = Object.fromEntries(
    Object.keys(languages).map((language) => [
      language,
      'This note explains the selected implementation and its declared input contract for the publishing fixture.',
    ]),
  );
  for (const language of Object.keys(languages))
    write(
      path.join(lessonsRoot, 'new-problem/Solution/code/Solution', `${language}.mdx`),
      '```' + language + '\nexample\n```',
    );
  const options = {
    root,
    lessonsRoot,
    contexts: notes,
    course: { lessons: [{ slug: 'new-problem', title: 'New problem' }] },
  };
  compose({
    ...options,
    manifest: [
      {
        lesson: 'new-problem',
        variant: 'Solution',
        title: 'Worked example in {language}',
        summary: 'A tested problem.',
        notes,
      },
    ],
  });
  expect(JSON.parse(fs.readFileSync(path.join(root, 'catalog.json'), 'utf8'))).toHaveLength(11);
  expect(fs.readFileSync(path.join(root, 'new-problem/java.mdx'), 'utf8')).toContain(marker);
  compose({ ...options, manifest: [] });
  expect(JSON.parse(fs.readFileSync(path.join(root, 'catalog.json'), 'utf8'))).toEqual([original]);
  for (const language of Object.keys(languages))
    expect(fs.existsSync(path.join(root, 'new-problem', `${language}.mdx`))).toBe(false);
  expect(fs.readFileSync(path.join(root, 'existing/python.mdx'), 'utf8')).toBe('Bespoke content');
  expect(fs.readFileSync(path.join(root, 'new-problem/editor-notes.mdx'), 'utf8')).toBe(
    'Handwritten notes',
  );
});

it('removes only stale routes bearing the resource generator ownership marker', () => {
  const root = temporary();
  const active = path.join(root, 'guides/active.tsx');
  const stale = path.join(root, 'guides/stale.tsx');
  const manual = path.join(root, 'guides/manual.tsx');
  const index = path.join(root, 'guides/index.tsx');
  for (const file of [active, stale])
    write(file, `${resourceGenerator.marker}\nexport default function Page() {}`);
  for (const file of [manual, index]) write(file, 'export default function Page() {}');
  resourceGenerator.removeUnpublishedRoutes(root, new Set([active]));
  expect(fs.existsSync(stale)).toBe(false);
  for (const file of [active, manual, index]) expect(fs.existsSync(file)).toBe(true);
});
