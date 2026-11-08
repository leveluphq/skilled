// Deploys the runner service to Cloudflare Containers (docs/runner-service.md).
//
//   node deploy.js           # build and deploy to the account in the environment
//   node deploy.js --dev     # run it locally with `wrangler dev` (Docker builds)
//   node deploy.js --config  # only write wrangler.jsonc
//
// Reads CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID and RUNNER_SERVICE_SECRET
// from the environment or the repo's .env.local. The token stays local to this
// repo; wrangler uses it instead of any `wrangler login`. RUNNER_CUSTOM_DOMAIN
// (say runner.example.com, on a zone in the same account) serves the Worker
// there too; Cloudflare makes its DNS record and certificate.

import { randomBytes } from 'node:crypto';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, '../..');
const ENV_FILE = path.join(ROOT, '.env.local');

const { IMAGES } = require('../../scripts/runner-images.js');
const { baseImage, buildBases } = require('../../scripts/runner-service.js');

// Cloudflare's machines are linux/amd64, and wrangler builds for them even in
// `wrangler dev`, where an ARM Mac runs the containers under emulation
const CLOUDFLARE_PLATFORM = 'linux/amd64';

// Every language gets a whole vCPU, as each run does locally (--cpus 1), except
// Kotlin, whose compiler takes turns with the JVM's JIT and garbage collector
// on one: with two, a lesson compiles in 5.7 s instead of 8.3 (B42, measured
// 2026-10-15). Java, Rust and Swift gained 0-10%, not worth twice the memory.
// A program's CPU limit counts the work of all its threads, so it holds the
// same either way. Cloudflare's custom instances need 3 GiB per vCPU. Disk
// holds the image.
const VCPUS = { kotlin: 2 };
const DISK_MB = { cpp: 6000, csharp: 6000, go: 6000, rust: 6000, swift: 12000 };
const instanceType = (language) => {
  const vcpu = VCPUS[language] || 1;

  return { vcpu, memory_mib: 3072 * vcpu, disk_mb: DISK_MB[language] || 4000 };
};

// The binding and class names src/routing.ts derives
const bindingFor = (language) => language.toUpperCase();
const classFor = (language) => `${language.charAt(0).toUpperCase()}${language.slice(1)}Runner`;

// Each container class is a Durable Object class, which Cloudflare creates in a
// migration, and a deployed migration can't change. v1 created the first ten;
// a language added later gets a migration of its own, appended here in order.
// (Removing a language would need a `deleted_classes` migration.)
const FIRST_LANGUAGES = [
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
const migrations = (languages) => [
  { tag: 'v1', new_sqlite_classes: FIRST_LANGUAGES.map(classFor) },
  ...languages
    .filter((language) => !FIRST_LANGUAGES.includes(language))
    .map((language) => ({ tag: `add-${language}`, new_sqlite_classes: [classFor(language)] })),
];

const readEnvFile = () => {
  if (!fs.existsSync(ENV_FILE)) {
    return {};
  }
  return Object.fromEntries(
    fs
      .readFileSync(ENV_FILE, 'utf8')
      .split('\n')
      .map((line) => /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line))
      .filter(Boolean)
      .map(([, key, value]) => [key, value.replace(/^['"]|['"]$/g, '')]),
  );
};

const setting = (name) => process.env[name] || readEnvFile()[name];

// The service's shared secret; the app sends it with every run. Made once and
// kept in .env.local, from where it also goes to the website's settings.
const serviceSecret = () => {
  const existing = setting('RUNNER_SERVICE_SECRET');
  if (existing) {
    return existing;
  }
  const secret = randomBytes(32).toString('hex');
  fs.appendFileSync(
    ENV_FILE,
    `\n# The runner service's shared secret (runner/cloudflare/deploy.js made it)\nRUNNER_SERVICE_SECRET=${secret}\n`,
  );
  console.log('Made RUNNER_SERVICE_SECRET and saved it in .env.local');
  return secret;
};

const writeConfig = ({ dev }) => {
  const platform = CLOUDFLARE_PLATFORM;
  const languages = Object.keys(IMAGES);
  const accountId = setting('CLOUDFLARE_ACCOUNT_ID');
  const customDomain = setting('RUNNER_CUSTOM_DOMAIN');
  const config = {
    $schema: './node_modules/wrangler/config-schema.json',
    name: setting('RUNNER_WORKER_NAME') || 'skilled-runner',
    main: 'src/index.ts',
    compatibility_date: '2026-10-01',
    ...(accountId && !dev ? { account_id: accountId } : {}),
    workers_dev: true,
    ...(customDomain && !dev ? { routes: [{ pattern: customDomain, custom_domain: true }] } : {}),
    observability: { enabled: true },
    containers: languages.map((language) => ({
      class_name: classFor(language),
      image: '../Dockerfile.service',
      image_build_context: '..',
      image_vars: { BASE_IMAGE: baseImage(language, platform) },
      instance_type: instanceType(language),
      max_instances: Number(setting('RUNNER_MAX_INSTANCES') || 20),
    })),
    durable_objects: {
      bindings: languages.map((language) => ({
        name: bindingFor(language),
        class_name: classFor(language),
      })),
    },
    migrations: migrations(languages),
  };

  const file = path.join(HERE, 'wrangler.jsonc');
  fs.writeFileSync(
    file,
    `// Generated by deploy.js from scripts/runner-images.js. Don't edit.\n${JSON.stringify(config, null, 2)}\n`,
  );
  console.log(`Wrote ${path.relative(ROOT, file)} for ${platform}`);
  return platform;
};

const wrangler = (args, input) => {
  console.log(`\nwrangler ${args.join(' ')}`);
  const result = spawnSync('npx', ['wrangler', ...args], {
    cwd: HERE,
    stdio: input === undefined ? 'inherit' : ['pipe', 'inherit', 'inherit'],
    input,
    env: {
      ...process.env,
      ...Object.fromEntries(
        ['CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_ACCOUNT_ID']
          .filter((name) => setting(name))
          .map((name) => [name, setting(name)]),
      ),
    },
  });
  return result.status === 0;
};

const main = () => {
  const args = process.argv.slice(2);
  const dev = args.includes('--dev');
  const platform = writeConfig({ dev });

  if (args.includes('--config')) {
    return 0;
  }

  // The language images from docker/runner, for the platform the containers
  // run on; the official images are pulled by the build itself
  const failed = buildBases(platform);
  if (failed.length) {
    console.error(`Couldn't build the language images for ${platform}: ${failed.join(', ')}`);
    return 1;
  }

  if (dev) {
    fs.writeFileSync(path.join(HERE, '.dev.vars'), `RUNNER_SERVICE_SECRET=${serviceSecret()}\n`);
    return wrangler(['dev']) ? 0 : 1;
  }

  if (!setting('CLOUDFLARE_API_TOKEN') || !setting('CLOUDFLARE_ACCOUNT_ID')) {
    console.error(
      'Set CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID (in .env.local): see docs/runner-service.md',
    );
    return 1;
  }

  const secret = serviceSecret();
  if (!wrangler(['deploy'])) {
    return 1;
  }
  if (!wrangler(['secret', 'put', 'RUNNER_SERVICE_SECRET'], `${secret}\n`)) {
    return 1;
  }

  const customDomain = setting('RUNNER_CUSTOM_DOMAIN');
  console.log(
    `\nDeployed. Set the app's CODE_RUNNER=service, RUNNER_SERVICE_URL (${
      customDomain ? `https://${customDomain}` : 'the workers.dev URL above'
    }) and RUNNER_SERVICE_SECRET (from .env.local).`,
  );
  return 0;
};

process.exitCode = main();
