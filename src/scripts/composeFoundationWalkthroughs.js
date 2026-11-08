const fs = require('fs');
const path = require('path');
const { languages } = require('./composeWalkthroughs');
const marker = '{/* Composed by contentgen:walkthroughs. Edit foundation sources. */}';

function compose(options = {}) {
  const content = options.content || path.resolve(__dirname, '../content');
  const root = path.join(content, 'lesson-walkthroughs');
  const manifest =
    options.manifest ||
    JSON.parse(fs.readFileSync(path.join(root, 'foundations/manifest.json'), 'utf8'));
  const course = options.course || require('../content/resources/course.json');
  const catalogFile = path.join(root, 'catalog.json');
  const original = JSON.parse(fs.readFileSync(catalogFile, 'utf8'));
  const sourceFor = (entry) => path.join(root, entry.lesson, `${entry.language}.mdx`);
  const owned = (entry) =>
    fs.existsSync(sourceFor(entry)) && fs.readFileSync(sourceFor(entry), 'utf8').startsWith(marker);
  const assigned = new Set(manifest.map((entry) => entry.lesson));
  const catalog = original.filter((entry) => !assigned.has(entry.lesson) && !owned(entry));
  const destinations = new Set();
  for (const entry of manifest) {
    if (
      !/^[a-z0-9-]+$/.test(entry.lesson) ||
      !['concept', 'implementation', 'javascript'].includes(entry.kind)
    )
      throw new Error('Invalid foundation lesson');
    const lesson = course.lessons.find((item) => item.slug === entry.lesson);
    if (
      !lesson ||
      !entry.title ||
      entry.title.split('{language}').length !== 2 ||
      !entry.summary ||
      !entry.description ||
      entry.description.split('{language}').length !== 2
    )
      throw new Error(`Unpublished or incomplete foundation: ${entry.lesson}`);
    const base = entry.baseNotes
      ? fs.readFileSync(path.join(content, entry.baseNotes), 'utf8').trim()
      : '';
    const reasoning = fs
      .readFileSync(path.join(root, 'foundations/chapters', `${entry.lesson}.md`), 'utf8')
      .trim();
    for (const language of entry.languages) {
      if (
        !Object.prototype.hasOwnProperty.call(languages, language) ||
        !entry.notes[language] ||
        entry.notes[language].split(/\s+/).length < 50
      )
        throw new Error(`Review foundation language commentary: ${entry.lesson}/${language}`);
      const blocks = entry.examples
        .map((example) => {
          const relative = example.source.replace('{language}', language);
          if (!/^[a-zA-Z0-9/._-]+$/.test(relative) || relative.split('/').includes('..'))
            throw new Error(`Unsafe foundation source: ${relative}`);
          const source = fs.readFileSync(path.join(content, relative), 'utf8');
          const fences = [...source.matchAll(/```[a-zA-Z0-9+#]*\n([\s\S]*?)```/g)];
          if (fences.length !== 1 || !fences[0][1].trim())
            throw new Error(`Review foundation code: ${relative}`);
          return `### ${example.title}\n\n\`\`\`${language}\n${fences[0][1].trimEnd()}\n\`\`\``;
        })
        .join('\n\n');
      const label = languages[language];
      const destination = sourceFor({ lesson: entry.lesson, language });
      if (fs.existsSync(destination) && !fs.readFileSync(destination, 'utf8').startsWith(marker))
        throw new Error(`Refusing to replace edited walkthrough: ${destination}`);
      destinations.add(destination);
      const text = `${marker}\n\n${base}\n\n${reasoning}\n\n## ${label} example and implementation choices\n\n${entry.notes[language]}\n\n${blocks}\n\n## Continue in ${label}\n\n[Open ${lesson.title}](/course/${entry.lesson}) for the complete course explanation. The course keeps your saved programming-language choice. Use this standalone page to inspect the ${label} example and run it in your own local environment. Follow the original course sequence when you want the surrounding lesson context and related exercises.\n\nThe [${label} interview preparation guide](/interview-prep/${language}) connects these language choices with further practice and the cross-language operation reference.\n`;
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      fs.writeFileSync(destination, text);
      catalog.push({
        lesson: entry.lesson,
        language,
        kind: entry.kind,
        title: entry.title.replace('{language}', label),
        description: entry.description.replace('{language}', label),
      });
    }
  }
  for (const entry of original)
    if (!destinations.has(sourceFor(entry)) && owned(entry)) fs.unlinkSync(sourceFor(entry));
  fs.writeFileSync(catalogFile, JSON.stringify(catalog, null, 2) + '\n');
  delete require.cache[require.resolve(catalogFile)];
}
module.exports = { compose, marker };
if (require.main === module) compose();
