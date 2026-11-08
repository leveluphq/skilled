// The lesson code snippets that follow the selected language: code blocks
// (folders with javascript.mdx, python.mdx... and an index.tsx code map) and
// inline code (files calling generateInlineCode). Snippets in the
// JavaScript-specific lessons are limited to JavaScript and TypeScript on
// purpose, and starting code, solutions and old tests are covered elsewhere,
// so all of those are left out.
//
//   node scripts/lesson-snippets.js                  # how many lack each language
//   node scripts/lesson-snippets.js --missing RUST   # the folders and files lacking Rust

const fs = require('fs');
const path = require('path');

const contentDir = path.join(__dirname, '../src/content');

// CodingLanguage value, file name and member name
const LANGUAGES = [
  ['JAVASCRIPT', 'javascript.mdx', 'Javascript'],
  ['TYPESCRIPT', 'typescript.mdx', 'Typescript'],
  ['PYTHON', 'python.mdx', 'Python'],
  ['JAVA', 'java.mdx', 'Java'],
  ['CPP', 'cpp.mdx', 'Cpp'],
  ['CSHARP', 'csharp.mdx', 'Csharp'],
  ['GO', 'go.mdx', 'Go'],
  ['KOTLIN', 'kotlin.mdx', 'Kotlin'],
  ['SWIFT', 'swift.mdx', 'Swift'],
  ['RUST', 'rust.mdx', 'Rust'],
];

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? [full, ...walk(full)] : [];
  });

const files = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? files(full) : [full];
  });

const isLimitedToJavaScript = (indexSource) =>
  /options:\s*\[CodingLanguage\.Javascript,\s*CodingLanguage\.Typescript\]/.test(indexSource);

// Code block folders that follow the selected language
const snippetFolders = () =>
  walk(path.join(contentDir, 'lessons'))
    .filter(
      (dir) =>
        fs.existsSync(path.join(dir, 'index.tsx')) &&
        fs.existsSync(path.join(dir, 'python.mdx')) &&
        !/\/(UserAnswer|Tests)$/.test(dir) &&
        !/\/Solution\/code\//.test(dir) &&
        !isLimitedToJavaScript(fs.readFileSync(path.join(dir, 'index.tsx'), 'utf8')),
    )
    .sort();

// Inline code maps that follow the selected language
const inlineCodeFiles = () =>
  files(contentDir)
    .filter((file) => file.endsWith('.tsx') && !file.endsWith('generateInlineCode.tsx'))
    .filter((file) => {
      const source = fs.readFileSync(file, 'utf8');
      return source.includes('generateInlineCode(') && source.includes('codeMap');
    })
    .sort();

// A folder has a language when it has the file and its code map shows it
const hasFile = (dir, file) =>
  fs.existsSync(path.join(dir, file)) &&
  fs.readFileSync(path.join(dir, 'index.tsx'), 'utf8').includes(`from './${file}'`);

const missingIn = (language) => {
  const [, file, member] = LANGUAGES.find(([value]) => value === language);
  return {
    folders: snippetFolders().filter((dir) => !hasFile(dir, file)),
    inline: inlineCodeFiles().filter(
      (inlineFile) => !fs.readFileSync(inlineFile, 'utf8').includes(`[CodingLanguage.${member}]`),
    ),
  };
};

module.exports = { LANGUAGES, snippetFolders, inlineCodeFiles, missingIn };

if (require.main === module) {
  const relative = (file) => path.relative(process.cwd(), file);
  const index = process.argv.indexOf('--missing');

  if (index >= 0) {
    const { folders, inline } = missingIn(process.argv[index + 1]);
    console.log(`Code block folders (${folders.length}):`);
    folders.forEach((dir) => console.log(`  ${relative(dir)}`));
    console.log(`Inline code files (${inline.length}):`);
    inline.forEach((file) => console.log(`  ${relative(file)}`));
  } else {
    console.log(
      `${snippetFolders().length} code block folders, ${inlineCodeFiles().length} inline code files`,
    );
    LANGUAGES.forEach(([language]) => {
      const { folders, inline } = missingIn(language);
      console.log(
        `${language.padEnd(10)} lacks ${folders.length} folders, ${inline.length} inline files`,
      );
    });
  }
}
