import fs from 'fs';
import path from 'path';
import catalog from 'content/lesson-walkthroughs/catalog.json';
import course from 'content/resources/course.json';
import coverage from 'content/lesson-walkthroughs/coverage.json';
import foundations from 'content/lesson-walkthroughs/foundations/manifest.json';
import manifest from 'content/lesson-walkthroughs/curriculum/manifest.json';
import { readCode } from '../../../../test/conformance/lessonCode';

it('publishes every required language for every published lesson, without drafts', () => {
  const root = path.join(process.cwd(), 'src/content');
  const runnable = course.lessons.filter((lesson) =>
    fs.existsSync(path.join(root, 'lessons', lesson.slug, 'runner.spec.ts')),
  );
  expect(runnable.length).toBeGreaterThan(0);
  const languages = [
    'javascript',
    'typescript',
    'python',
    'java',
    'cpp',
    'csharp',
    'go',
    'kotlin',
    'swift',
    'rust',
  ];
  const { validateCoverage } = require('../../../scripts/walkthroughCoverage');
  expect(() => validateCoverage(catalog, course, coverage)).not.toThrow();
  expect(catalog).toHaveLength(596);
  expect(coverage).toHaveLength(course.lessons.length);
  expect(() => validateCoverage(catalog.slice(1), course, coverage)).toThrow();
  expect(() =>
    validateCoverage(
      catalog,
      { ...course, lessons: [...course.lessons, { slug: 'new-published-lesson' }] },
      coverage,
    ),
  ).toThrow();
  expect(() =>
    validateCoverage([...catalog, { lesson: 'draft', language: 'python' }], course, coverage),
  ).toThrow();
  expect(() =>
    validateCoverage(
      catalog.map((page, i) => (i === 0 ? { ...page, kind: 'concept' } : page)),
      course,
      coverage,
    ),
  ).toThrow();
  for (const entry of foundations)
    for (const language of entry.languages) {
      const published = readCode(
        path.join(root, 'lesson-walkthroughs', entry.lesson, `${language}.mdx`),
      );
      const reference = readCode(
        path.join(root, entry.examples[0].source.replace('{language}', language)),
      );
      expect(published?.trim()).toBe(reference?.trim());
    }
  for (const lesson of runnable) {
    const pages = catalog.filter((page) => page.lesson === lesson.slug);
    expect(pages.map((page) => page.language).sort()).toEqual([...languages].sort());
  }
  for (const entry of manifest)
    for (const language of languages) {
      const published = readCode(
        path.join(root, 'lesson-walkthroughs', entry.lesson, `${language}.mdx`),
      );
      const reference = readCode(
        path.join(root, 'lessons', entry.lesson, 'Solution/code', entry.variant, `${language}.mdx`),
      );
      expect(published?.trim()).toBe(reference?.trim());
    }
});
