import fs from 'fs';
import os from 'os';
import path from 'path';
import vm from 'vm';
import ts from 'typescript';
import videos from 'content/videos/catalog.json';
import course from 'content/resources/course.json';
const { validateVideoInventory } = require('../../../scripts/checkVideos');
const { generate, marker, composeVideoNotes } = require('../../../scripts/generateVideos');

const seed = {
  lessons: [
    { slug: 'one', status: 'ACTIVE', accessLevel: 'FREE', solutionVideoUrl: 'https://youtu.be/abcdefghijk' },
    { slug: 'two', status: 'ACTIVE', accessLevel: 'SUBSCRIPTION', solutionVideoUrl: 'https://youtu.be/lmnopqrstuv' },
    { slug: 'no-recording', status: 'ACTIVE', solutionVideoUrl: null },
    { slug: 'draft', status: 'DRAFT', solutionVideoUrl: 'https://youtu.be/wxyzabcdefg' },
  ],
};
const published = { lessons: seed.lessons.filter((lesson) => lesson.status === 'ACTIVE') };
const recordings = [{ slug: 'one', videoId: 'abcdefghijk' }, { slug: 'two', videoId: 'lmnopqrstuv' }];

it('keeps watch chapters and corrections identical to the current course recording data', () => {
  for (const video of videos) {
    const filename = path.join(process.cwd(), 'src/content/lessons', video.slug, 'data.ts');
    const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS },
    }).outputText;
    const context = { exports: {} as any };
    vm.runInNewContext(code, context);
    const source = context.exports.video;
    expect(video.chapters).toEqual(source.segments.map((segment: any) => ({
      name: segment.name, start: segment.startTimeSeconds, end: segment.endTimeSeconds,
    })));
    expect(video.corrections).toEqual(source.changesSinceRecording || []);
    for (const chapter of video.chapters) expect(chapter.end).toBeLessThanOrEqual(video.durationSeconds);
  }
});

it('requires every published recording regardless of legacy subscription labels', () => {
  expect(() => validateVideoInventory(recordings, published, seed)).not.toThrow();
  expect(() => validateVideoInventory(recordings.slice(0, 1), published, seed)).toThrow('Missing published recording: two');
  expect(() => validateVideoInventory([{ ...recordings[0], videoId: 'wrongsource' }, recordings[1]], published, seed)).toThrow('Recording source differs');
});

it('rejects drafts, lessons without recordings, and duplicates; supports release bundles without private seeds', () => {
  expect(() => validateVideoInventory([...recordings, { slug: 'draft' }], published, seed)).toThrow('Unpublished');
  expect(() => validateVideoInventory([...recordings, { slug: 'no-recording' }], published, seed)).toThrow('no active recording');
  expect(() => validateVideoInventory([...recordings, recordings[0]], published, seed)).toThrow('Duplicate');
  expect(() => validateVideoInventory(videos, course, null)).not.toThrow();
});

it('unpublishes owned static pages and preserves handwritten watch routes', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'skilled-videos-'));
  const folder = path.join(root, 'src/pages/watch');
  try {
    generate({ root, videos: recordings });
    fs.writeFileSync(path.join(folder, 'index.tsx'), 'export default function Index() {}');
    generate({ root, videos: recordings.slice(0, 1) });
    expect(fs.existsSync(path.join(folder, 'two.tsx'))).toBe(false);
    expect(fs.readFileSync(path.join(folder, 'one.tsx'), 'utf8')).toContain("content/videos/one.mdx");
    expect(fs.readFileSync(path.join(folder, 'index.tsx'), 'utf8')).not.toContain(marker);
    fs.writeFileSync(path.join(folder, 'two.tsx'), 'handwritten');
    expect(() => generate({ root, videos: recordings })).toThrow('Refusing to overwrite');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

it('refreshes shared notes from their chapter and removes only owned unpublished notes', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'skilled-video-notes-'));
  const folder = path.join(root, 'src/content/videos');
  const chapters = path.join(root, 'src/content/lesson-walkthroughs/curriculum');
  try {
    fs.mkdirSync(folder, { recursive: true });
    fs.mkdirSync(chapters, { recursive: true });
    fs.writeFileSync(path.join(folder, 'catalog.json'), JSON.stringify(recordings));
    fs.writeFileSync(path.join(folder, 'notes-sources.json'), JSON.stringify({ one: 'one' }));
    fs.writeFileSync(path.join(chapters, 'one.md'), 'Reviewed explanation.');
    fs.writeFileSync(path.join(folder, 'two.mdx'), 'Separately edited explanation.');
    composeVideoNotes(root);
    expect(fs.readFileSync(path.join(folder, 'one.mdx'), 'utf8')).toContain('Reviewed explanation.');
    fs.writeFileSync(path.join(chapters, 'one.md'), 'Corrected explanation.');
    composeVideoNotes(root);
    expect(fs.readFileSync(path.join(folder, 'one.mdx'), 'utf8')).toContain('Corrected explanation.');
    fs.writeFileSync(path.join(folder, 'notes-sources.json'), '{}');
    composeVideoNotes(root);
    expect(fs.existsSync(path.join(folder, 'one.mdx'))).toBe(false);
    expect(fs.readFileSync(path.join(folder, 'two.mdx'), 'utf8')).toBe('Separately edited explanation.');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
