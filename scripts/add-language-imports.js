// Adds language code files to lesson code maps. Each code folder in
// src/content has an index.tsx that imports javascript.mdx and so on and maps
// CodingLanguage values to them. For every typescript.mdx, java.mdx (and so on)
// that exists in a folder but isn't imported yet, this adds the import and the
// map entry, replacing an entry that stood in for it (TypeScript showing the
// JavaScript file). Safe to run again.
//
//   node scripts/add-language-imports.js           # every folder under src/content
//   node scripts/add-language-imports.js --check   # exit 1 if any folder needs it

const fs = require('fs');
const path = require('path');

const contentDir = path.join(__dirname, '../src/content');

// file, component name, CodingLanguage member
const LANGUAGES = [
  ['typescript.mdx', 'TypeScriptCode', 'Typescript'],
  ['java.mdx', 'JavaCode', 'Java'],
  ['cpp.mdx', 'CppCode', 'Cpp'],
  ['csharp.mdx', 'CSharpCode', 'Csharp'],
  ['go.mdx', 'GoCode', 'Go'],
  ['kotlin.mdx', 'KotlinCode', 'Kotlin'],
  ['swift.mdx', 'SwiftCode', 'Swift'],
  ['rust.mdx', 'RustCode', 'Rust'],
];

const IMPORT = /^import [A-Za-z]+ from '\.\/[a-z]+\.mdx';$/gm;
const ENTRY = /^(\s*)\[CodingLanguage\.[A-Za-z]+\]: <[A-Za-z]+ ?\/>,$/gm;

const lastMatch = (text, pattern) => {
  let last = null;
  for (const match of text.matchAll(pattern)) {
    last = match;
  }
  return last;
};

const insertAfter = (text, match, line) => {
  const end = match.index + match[0].length;
  return `${text.slice(0, end)}\n${line}${text.slice(end)}`;
};

const update = (dir) => {
  const indexFile = path.join(dir, 'index.tsx');
  let text = fs.readFileSync(indexFile, 'utf8');
  const original = text;

  LANGUAGES.forEach(([file, component, member]) => {
    if (!fs.existsSync(path.join(dir, file)) || text.includes(`from './${file}'`)) {
      return;
    }

    const lastImport = lastMatch(text, IMPORT);
    const lastEntry = lastMatch(text, ENTRY);

    if (!lastImport || !lastEntry) {
      throw new Error(`${path.relative(process.cwd(), indexFile)} doesn't have the usual code map`);
    }

    // The entry comes later in the file, so change it first
    const standIn = new RegExp(`^(\\s*)\\[CodingLanguage\\.${member}\\]: <[A-Za-z]+ ?\\/>,$`, 'm');
    const existing = standIn.exec(text);
    const entry = `[CodingLanguage.${member}]: <${component} />,`;

    text = existing
      ? text.replace(standIn, `${existing[1]}${entry}`)
      : insertAfter(text, lastEntry, `${lastEntry[1]}${entry}`);
    // TypeScript's import goes next to JavaScript's, as in the older code maps
    const javascriptImport =
      file === 'typescript.mdx' && /^import [A-Za-z]+ from '\.\/javascript\.mdx';$/m.exec(text);
    text = insertAfter(
      text,
      javascriptImport || lastImport,
      `import ${component} from './${file}';`,
    );
  });

  return text === original ? null : { indexFile, text };
};

const folders = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (!entry.isDirectory()) {
      return [];
    }
    return [full, ...folders(full)];
  });

const changes = () =>
  folders(contentDir)
    .filter((dir) => fs.existsSync(path.join(dir, 'index.tsx')))
    .map(update)
    .filter(Boolean);

module.exports = { changes };

if (require.main === module) {
  const pending = changes();

  if (process.argv.includes('--check')) {
    pending.forEach(({ indexFile }) =>
      console.error(`Needs imports: ${path.relative(process.cwd(), indexFile)}`),
    );
    process.exit(pending.length ? 1 : 0);
  }

  pending.forEach(({ indexFile, text }) => fs.writeFileSync(indexFile, text));
  console.log(`Updated ${pending.length} index.tsx file(s)`);
}
