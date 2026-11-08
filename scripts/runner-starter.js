// Prints the starting code a language's runtime generates for a lesson: the
// declarations the tests call, with placeholder bodies. The basis for a
// lesson's UserAnswer/<language>.mdx.
//
//   node scripts/runner-starter.js count-islands JAVA
//   node scripts/runner-starter.js --signature count-islands JAVA

require('ts-node').register({
  transpileOnly: true,
  compilerOptions: { module: 'commonjs', jsx: 'react' },
});

const fs = require('fs');
const Module = require('module');
const path = require('path');

// The app's import aliases (tsconfig paths): a first segment naming a folder
// in src/ that isn't also a package
const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const resolve = Module._resolveFilename;
Module._resolveFilename = function resolveAlias(request, ...rest) {
  const first = request.split('/')[0];
  const aliased =
    request.includes('/') &&
    fs.existsSync(path.join(SRC, first)) &&
    !fs.existsSync(path.join(ROOT, 'node_modules', first))
      ? path.join(SRC, request)
      : request;
  return resolve.call(this, aliased, ...rest);
};

const args = process.argv.slice(2).filter((arg) => !arg.startsWith('--'));
const [slug, language] = args;

if (!slug || !language) {
  console.error('Usage: node scripts/runner-starter.js <lesson-slug> <LANGUAGE>');
  process.exit(1);
}

const spec = require(path.join(SRC, 'content/lessons', slug, 'runner.spec.ts')).default;
const { runtimeFor } = require(path.join(SRC, 'services/server/runner/runtimes'));
const runtime = runtimeFor(language);

if (!runtime || !runtime.starter) {
  console.error(`No runtime with starting code for ${language}`);
  process.exit(1);
}

process.stdout.write(runtime.starter(spec));
