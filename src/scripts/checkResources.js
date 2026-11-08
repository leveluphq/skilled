const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { publicPaths } = require('../utils/server/discovery');
const { contentInfo, resourceLinks } = require('./generateResources');
const catalog = require('../content/resources/catalog.json');
const course = require('../content/resources/course.json');
const metadata = require('../content/resources/lesson-metadata.json');
const routes = new Set(publicPaths().map((entry) => entry.path));
const lessonSlugs = new Set(course.lessons.map((lesson) => lesson.slug));
const errors = [];
const lessonImages = require('./checkLessonImages').validateLessonImages();
errors.push(...lessonImages.issues);
const overviews = require('../content/resources/lesson-overviews.json');
const languageSource = fs.readFileSync(
  path.resolve(__dirname, '../content/lessonLanguages.gen.ts'),
  'utf8',
);
const runnableSlugs = [...languageSource.matchAll(/"([a-z0-9-]+)": \[/g)]
  .map((match) => match[1])
  .filter((slug) => lessonSlugs.has(slug));
for (const slug of runnableSlugs) {
  const entry = overviews[slug];
  if (
    !entry ||
    !entry.focus ||
    entry.approach.split(/\s+/).length < 45 ||
    entry.checks?.length < 3 ||
    !entry.cost
  )
    errors.push(`${slug}: incomplete public approach/test overview`);
}
for (const slug of Object.keys(overviews))
  if (!runnableSlugs.includes(slug))
    errors.push(`${slug}: overview is not a published runnable lesson`);
try {
  require('./generateWalkthroughs').validateWalkthroughs();
  require('./checkVideos').validateVideos();
} catch (error) {
  errors.push(error.message);
}
let words = 0;
let examples = 0;
for (const resource of catalog) {
  const id = `${resource.section}/${resource.slug}`;
  const source = fs.readFileSync(
    path.resolve(__dirname, '../content/resources', `${id}.mdx`),
    'utf8',
  );
  const info = contentInfo(source);
  words += info.words;
  if (!fs.existsSync(path.resolve(__dirname, '../pages', `${id}.tsx`)))
    errors.push(`${id}: missing generated page`);
  if (/^# /m.test(source))
    errors.push(`${id}: put the page title in catalog metadata, not a second H1`);
  if (/\b(TODO|TBD|lorem ipsum)\b/i.test(source)) errors.push(`${id}: unfinished draft text`);
  if (/^\|.+\|\n\|[\s|:-]+\|$/m.test(source.replace(/```[\s\S]*?```/g, '')))
    errors.push(`${id}: Markdown tables are unsupported by this MDX pipeline; use an HTML table`);
  for (const slug of resource.lessons)
    if (!lessonSlugs.has(slug)) errors.push(`${id}: unpublished practice lesson ${slug}`);
  for (const target of resourceLinks(source)) {
    if (target.startsWith('/')) {
      const [pathname, anchor] = target.split('#');
      if (!routes.has(pathname)) errors.push(`${id}: broken internal link ${target}`);
      if (
        anchor &&
        pathname === `/${id}` &&
        !info.headings.some((heading) => heading.id === anchor)
      )
        errors.push(`${id}: missing anchor ${target}`);
    } else if (!target.startsWith('#')) {
      try {
        const url = new URL(target);
        if (!['http:', 'https:'].includes(url.protocol))
          errors.push(`${id}: unsupported link ${target}`);
      } catch {
        errors.push(`${id}: invalid link ${target}`);
      }
    }
  }
  for (const match of source.matchAll(/```javascript\n([\s\S]*?)```/g)) {
    examples += 1;
    try {
      new vm.Script(match[1], { filename: id });
    } catch (error) {
      errors.push(`${id}: invalid JavaScript example: ${error.message}`);
    }
  }
}
for (const lesson of course.lessons) {
  const entry = metadata[lesson.slug];
  if (!entry?.title || !entry?.description)
    errors.push(`${lesson.slug}: missing editorial metadata`);
  if (!fs.existsSync(path.resolve(__dirname, '../pages/course', `${lesson.slug}.tsx`)))
    errors.push(`${lesson.slug}: missing course route`);
}
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else
  console.log(
    `Checked ${catalog.length} resources, ${
      course.lessons.length
    } lessons, ${examples} JavaScript examples, and ${words.toLocaleString(
      'en-US',
    )} prose words. ${lessonImages.images} lesson image descriptions and dimensions are valid. Internal links and metadata are valid.`,
  );
