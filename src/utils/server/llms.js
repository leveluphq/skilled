const { site, absoluteUrl } = require('../shared/site');
const catalog = require('../../content/resources/catalog.json');
const walkthroughs = require('../../content/lesson-walkthroughs/catalog.json');
const videos = require('../../content/videos/catalog.json');

const inlineText = (value) =>
  value
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/([\\[\]])/g, '\\$1');
const entry = (title, path, description) =>
  `- [${inlineText(title)}](${absoluteUrl(path)}): ${inlineText(description)}`;

/** A catalog-driven navigation file, containing no restricted lesson content. */
const buildLlms = () => {
  const sections = [
    ['interview-prep', 'Programming language preparation'],
    ['guides', 'Worked guides'],
    ['patterns', 'Algorithm patterns'],
    ['topics', 'Topic learning paths'],
    ['tools', 'Interactive tools'],
    ['study-plans', 'Study plans'],
    ['reference', 'References'],
  ];
  const lines = [
    `# ${inlineText(site.name)}`,
    '',
    '> Coding interview guides, language preparation, worked algorithms, study plans, and interactive learning tools.',
    '',
    'The resources listed below are public and readable without an account. Tool interactions require JavaScript; their explanations are included in the HTML.',
    'Course lessons have their own access settings. The lesson walkthroughs listed here are public reading pages for existing exercises, with no separate course progress. An editor’s available programming languages depend on the exercise and configured runner. Language guides do not imply that every lesson runs in every language.',
    '',
    '## Start here',
    '',
    entry('Resource library', '/learn', 'Browse all published learning resources.'),
    entry(
      'Programming language paths',
      '/interview-prep',
      'Choose a preparation guide and deeper material for your language.',
    ),
    entry(
      'Course overview',
      '/course',
      'Browse the curriculum and companion language guides; individual lesson access varies.',
    ),
    entry('Developer docs', '/docs', 'Run the site, its lessons and its code runner locally.'),
    `- [Source code](${site.sourceUrl}): ${inlineText('The open-source repository for this site.')}`,
    '',
  ];
  lines.push('## Programming-language lesson walkthroughs', '');
  for (const page of walkthroughs) {
    lines.push(entry(page.title, `/course/${page.lesson}/${page.language}`, page.description));
  }
  lines.push('');
  lines.push('## Public video lessons', '');
  for (const video of videos)
    lines.push(entry(video.title, `/watch/${video.slug}`, video.description));
  lines.push('');
  for (const [section, label] of sections) {
    lines.push(`## ${label}`, '');
    for (const resource of catalog.filter((item) => item.section === section)) {
      lines.push(
        entry(resource.title, `/${resource.section}/${resource.slug}`, resource.description),
      );
    }
    lines.push('');
  }
  return lines.join('\n');
};

module.exports = { buildLlms, inlineText };
