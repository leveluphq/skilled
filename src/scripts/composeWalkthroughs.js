const fs = require('fs');
const path = require('path');

const languages = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python: 'Python',
  java: 'Java',
  cpp: 'C++',
  csharp: 'C#',
  go: 'Go',
  kotlin: 'Kotlin',
  swift: 'Swift',
  rust: 'Rust',
};
const marker = '{/* Composed by contentgen:walkthroughs. Edit curriculum sources. */}';

// The algorithm chapter has one editorial source. Language notes and the exact
// runnable implementation are composed with it; existing bespoke pages are kept.
function compose(options = {}) {
  const root = options.root || path.resolve(__dirname, '../content/lesson-walkthroughs');
  const lessonsRoot = options.lessonsRoot || path.resolve(__dirname, '../content/lessons');
  const manifest =
    options.manifest || require('../content/lesson-walkthroughs/curriculum/manifest.json');
  const contexts =
    options.contexts || require('../content/lesson-walkthroughs/curriculum/languages.json');
  const course = options.course || require('../content/resources/course.json');
  const catalogFile = path.join(root, 'catalog.json');
  const original = JSON.parse(fs.readFileSync(catalogFile, 'utf8'));
  const safe = (value) => typeof value === 'string' && /^[a-z0-9-]+$/.test(value);
  for (const entry of original)
    if (!safe(entry.lesson) || !Object.prototype.hasOwnProperty.call(languages, entry.language))
      throw new Error('Unsafe existing walkthrough identity');
  const sourceFor = (entry) => path.join(root, entry.lesson, `${entry.language}.mdx`);
  const composed = (entry) =>
    fs.existsSync(sourceFor(entry)) && fs.readFileSync(sourceFor(entry), 'utf8').startsWith(marker);
  const owned = new Set(manifest.map((entry) => entry.lesson));
  const catalog = original.filter((entry) => !owned.has(entry.lesson) && !composed(entry));
  const destinations = new Set();
  for (const entry of manifest) {
    if (
      !safe(entry.lesson) ||
      typeof entry.variant !== 'string' ||
      !/^[a-zA-Z0-9_-]+$/.test(entry.variant)
    )
      throw new Error('Unsafe curriculum lesson or variant');
    if (!entry.summary || !entry.title || entry.title.split('{language}').length !== 2)
      throw new Error(`Missing reviewed title or summary: ${entry.lesson}`);
    const lesson = course.lessons.find((item) => item.slug === entry.lesson);
    if (!lesson || !fs.existsSync(path.join(lessonsRoot, entry.lesson, 'runner.spec.ts')))
      throw new Error(`Curriculum requires a published runnable lesson: ${entry.lesson}`);
    const chapter = fs
      .readFileSync(path.join(root, 'curriculum', `${entry.lesson}.md`), 'utf8')
      .trim();
    for (const [language, name] of Object.entries(languages)) {
      const source = fs.readFileSync(
        path.join(lessonsRoot, entry.lesson, 'Solution/code', entry.variant, `${language}.mdx`),
        'utf8',
      );
      const blocks = [...source.matchAll(/```[a-zA-Z0-9+#]*\n([\s\S]*?)```/g)];
      if (
        blocks.length !== 1 ||
        !entry.notes[language] ||
        entry.notes[language].split(/\s+/).length < 12
      )
        throw new Error(`Review the implementation and language note: ${entry.lesson}/${language}`);
      const code = blocks[0][1].trimEnd();
      const destination = path.join(root, entry.lesson, `${language}.mdx`);
      destinations.add(destination);
      if (fs.existsSync(destination) && !fs.readFileSync(destination, 'utf8').startsWith(marker))
        throw new Error(`Refusing to replace a bespoke walkthrough: ${destination}`);
      const text = `${marker}\n\n${chapter}\n\n## ${name} implementation\n\n${entry.notes[language]}\n\n${contexts[language]}\n\n\`\`\`${language}\n${code}\n\`\`\`\n\n## Practice this implementation\n\n[Open ${lesson.title}](/course/${entry.lesson}) to run the implementation against the course tests, then change one boundary condition and explain the first failing case. The editor supplies the starter signature and any node types or helper APIs used above. Copy the implementation into that environment; the snippet is the solution body, without the input parser or test driver. Your saved progress belongs to the original lesson.\n\nFor more ${name} conventions and practice problems, use the [${name} interview guide](/interview-prep/${language}).\n`;
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      fs.writeFileSync(destination, text);
      catalog.push({
        lesson: entry.lesson,
        language,
        title: entry.title.replace('{language}', name),
        description: `${entry.summary} Follow the ${name} implementation, its correctness argument, worked example, complexity, and boundary tests.`,
      });
    }
  }
  for (const entry of original)
    if (!destinations.has(sourceFor(entry)) && composed(entry)) fs.unlinkSync(sourceFor(entry));
  fs.writeFileSync(catalogFile, `${JSON.stringify(catalog, null, 2)}\n`);
  // Discovery also reads this JSON in the generator process.
  delete require.cache[require.resolve(catalogFile)];
}

module.exports = { compose, languages, marker };
if (require.main === module) compose();
