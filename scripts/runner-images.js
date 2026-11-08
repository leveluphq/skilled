// Builds or pulls the Docker images the local code runner uses, one per
// language, at current stable releases (docs/README.md, "Run Lesson Code").
//
//   node scripts/runner-images.js                 # every language
//   node scripts/runner-images.js javascript python
//
// Images with a folder in docker/runner/ are built from its Dockerfile; the
// rest are official images, pulled as they are.

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Keep in step with the `docker.image` of each runtime in src/services/server/runner/runtimes
const IMAGES = {
  javascript: { image: 'node:24.22.0-slim' },
  typescript: { image: 'skilled-runner/typescript:7.0.2', build: 'typescript' },
  python: { image: 'python:3.14.8-slim' },
  java: { image: 'eclipse-temurin:25.0.4.1_1-jdk-noble' },
  cpp: { image: 'skilled-runner/cpp:16.2.0-2', build: 'cpp' },
  csharp: { image: 'mcr.microsoft.com/dotnet/sdk:10.0.402-noble' },
  go: { image: 'skilled-runner/go:1.27.2', build: 'go' },
  kotlin: { image: 'skilled-runner/kotlin:2.4.21', build: 'kotlin' },
  swift: { image: 'swift:6.4.1-noble' },
  rust: { image: 'rust:1.99.0-slim' },
};

module.exports = { IMAGES };

if (require.main === module) {
  const requested = process.argv.slice(2);
  const languages = requested.length ? requested : Object.keys(IMAGES);
  const unknown = languages.filter((language) => !IMAGES[language]);

  if (unknown.length) {
    console.error(
      `Unknown language: ${unknown.join(', ')}. Choose from: ${Object.keys(IMAGES).join(', ')}`,
    );
    process.exit(1);
  }

  let failed = false;

  for (const language of languages) {
    const { image, build } = IMAGES[language];
    const context = build && path.join(__dirname, '../docker/runner', build);
    const args =
      build && fs.existsSync(context) ? ['build', '--tag', image, context] : ['pull', image];

    console.log(`\n${language}: docker ${args.join(' ')}`);
    const result = spawnSync('docker', args, { stdio: 'inherit' });

    if (result.status !== 0) {
      console.error(`${language}: failed`);
      failed = true;
    }
  }

  process.exitCode = failed ? 1 : 0;
}
