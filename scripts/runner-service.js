// The runner service: the language images with the runner agent added
// (runner/Dockerfile.service), and the Docker-host dispatcher. See
// docs/runner-service.md.
//
//   node scripts/runner-service.js build [--platform linux/amd64] [language...]
//       Builds the service images (all languages by default) for a platform,
//       the machine's own by default. Cloudflare needs linux/amd64.
//   node scripts/runner-service.js images [--platform linux/amd64]
//       Prints the service image for each language, as JSON.
//   node scripts/runner-service.js bases [--platform linux/amd64] [language...]
//       Builds only the language images from docker/runner for a platform,
//       which Cloudflare's own builds start from.
//   node scripts/runner-service.js dispatch [--addr :8787] [--runtime runsc] [--platform linux/amd64]
//       Runs the dispatcher on this machine: POST /run/{language} runs each
//       program in a fresh container of the language's service image. Needs
//       RUNNER_SERVICE_SECRET and the images from `build`.

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { IMAGES } = require('./runner-images');

const ROOT = path.join(__dirname, '..');
const RUNNER_DIR = path.join(ROOT, 'runner');
const AGENT_DIR = path.join(RUNNER_DIR, 'agent');
const IMAGES_DIR = path.join(RUNNER_DIR, '.images');

// Changes whenever the agent or the service Dockerfile does, so a new agent
// always gets new image tags
const agentVersion = () => {
  const hash = crypto.createHash('sha256');
  fs.readdirSync(AGENT_DIR)
    .filter((file) => file.endsWith('.go') || file === 'go.mod')
    .sort()
    .forEach((file) => hash.update(file).update(fs.readFileSync(path.join(AGENT_DIR, file))));
  hash.update(fs.readFileSync(path.join(RUNNER_DIR, 'Dockerfile.service')));
  return hash.digest('hex').slice(0, 8);
};

const nativePlatform = () => `linux/${process.arch === 'arm64' ? 'arm64' : 'amd64'}`;
const archOf = (platform) => platform.split('/')[1];
const tagOf = (image) => image.slice(image.lastIndexOf(':') + 1);

// The language image to build on. Images built from docker/runner get a
// platform suffix when built for another platform, so they don't replace the
// local ones.
const baseImage = (language, platform) => {
  const { image, build } = IMAGES[language];
  return build && platform !== nativePlatform() ? `${image}-${archOf(platform)}` : image;
};

const serviceImage = (language, platform, version = agentVersion()) =>
  `skilled-runner-service/${language}:${tagOf(IMAGES[language].image)}-agent${version}-${archOf(
    platform,
  )}`;

const serviceImages = (platform) => {
  const version = agentVersion();
  return Object.fromEntries(
    Object.keys(IMAGES).map((language) => [language, serviceImage(language, platform, version)]),
  );
};

const docker = (args) => {
  console.log(`\ndocker ${args.join(' ')}`);
  return spawnSync('docker', args, { stdio: 'inherit' }).status === 0;
};

const option = (args, name, fallback) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : fallback;
};

const positional = (args) =>
  args.filter((arg, i) => !arg.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--')));

const build = (args) => {
  const platform = option(args, '--platform', nativePlatform());
  const requested = positional(args);
  const languages = requested.length ? requested : Object.keys(IMAGES);
  const unknown = languages.filter((language) => !IMAGES[language]);

  if (unknown.length) {
    console.error(
      `Unknown language: ${unknown.join(', ')}. Choose from: ${Object.keys(IMAGES).join(', ')}`,
    );
    return 1;
  }

  const failed = languages.filter((language) => {
    const { image, build: folder } = IMAGES[language];
    const base = baseImage(language, platform);

    // A language image built from docker/runner, for another platform
    if (folder && base !== image) {
      const context = path.join(ROOT, 'docker/runner', folder);
      if (!docker(['buildx', 'build', '--platform', platform, '--load', '--tag', base, context])) {
        return true;
      }
    }

    return !docker([
      'buildx',
      'build',
      '--platform',
      platform,
      '--load',
      '--build-arg',
      `BASE_IMAGE=${base}`,
      '--tag',
      serviceImage(language, platform),
      '--file',
      path.join(RUNNER_DIR, 'Dockerfile.service'),
      RUNNER_DIR,
    ]);
  });

  fs.mkdirSync(IMAGES_DIR, { recursive: true });
  const manifest = path.join(IMAGES_DIR, `${archOf(platform)}.json`);
  fs.writeFileSync(manifest, `${JSON.stringify(serviceImages(platform), null, 2)}\n`);
  console.log(`\nWrote ${path.relative(ROOT, manifest)}`);

  if (failed.length) {
    console.error(`Failed: ${failed.join(', ')}`);
    return 1;
  }
  return 0;
};

// Builds the language images that come from docker/runner, for a platform:
// what a service image for another platform builds on (Cloudflare's builds
// use this)
const buildBases = (platform, languages = Object.keys(IMAGES)) =>
  languages
    .filter(
      (language) =>
        IMAGES[language].build && baseImage(language, platform) !== IMAGES[language].image,
    )
    .filter((language) => {
      const context = path.join(ROOT, 'docker/runner', IMAGES[language].build);
      return !docker([
        'buildx',
        'build',
        '--platform',
        platform,
        '--load',
        '--tag',
        baseImage(language, platform),
        context,
      ]);
    });

// Builds the agent for this machine, in the Go image, so no Go install is needed
const agentBinary = () => {
  const goos = process.platform === 'darwin' ? 'darwin' : 'linux';
  const goarch = process.arch === 'arm64' ? 'arm64' : 'amd64';
  const output = path.join(RUNNER_DIR, '.bin', `skilled-runner-agent-${goos}-${goarch}`);
  fs.mkdirSync(path.dirname(output), { recursive: true });

  const ok = docker([
    'run',
    '--rm',
    '-e',
    `GOOS=${goos}`,
    '-e',
    `GOARCH=${goarch}`,
    '-e',
    'CGO_ENABLED=0',
    '-v',
    `${AGENT_DIR}:/src`,
    '-v',
    `${path.dirname(output)}:/out`,
    '-w',
    '/src',
    'golang:1.27.2',
    'go',
    'build',
    '-trimpath',
    '-o',
    `/out/${path.basename(output)}`,
    '.',
  ]);

  return ok ? output : null;
};

const dispatch = (args) => {
  if (!process.env.RUNNER_SERVICE_SECRET) {
    console.error('Set RUNNER_SERVICE_SECRET (the app sends it as a bearer token).');
    return 1;
  }

  // Another platform's images run under emulation, to check them before a deploy
  const manifest = path.join(
    IMAGES_DIR,
    `${archOf(option(args, '--platform', nativePlatform()))}.json`,
  );
  if (!fs.existsSync(manifest)) {
    console.error(
      `No ${path.relative(ROOT, manifest)}: run \`node scripts/runner-service.js build\` first.`,
    );
    return 1;
  }

  const binary = agentBinary();
  if (!binary) {
    return 1;
  }

  const dispatchArgs = ['dispatch', '-images', manifest, '-addr', option(args, '--addr', ':8787')];
  const containerRuntime = option(args, '--runtime', '');
  if (containerRuntime) {
    dispatchArgs.push('-runtime', containerRuntime);
  }

  console.log(`\n${binary} ${dispatchArgs.join(' ')}`);
  return spawnSync(binary, dispatchArgs, { stdio: 'inherit' }).status || 0;
};

module.exports = {
  agentVersion,
  baseImage,
  buildBases,
  serviceImage,
  serviceImages,
  nativePlatform,
};

if (require.main === module) {
  const [command, ...args] = process.argv.slice(2);
  const commands = {
    build,
    dispatch,
    bases: (rest) => {
      const failed = buildBases(
        option(rest, '--platform', nativePlatform()),
        positional(rest).length ? positional(rest) : undefined,
      );
      if (failed.length) {
        console.error(`Failed: ${failed.join(', ')}`);
        return 1;
      }
      return 0;
    },
    images: (rest) => {
      console.log(
        JSON.stringify(serviceImages(option(rest, '--platform', nativePlatform())), null, 2),
      );
      return 0;
    },
  };

  if (!commands[command]) {
    console.error('Usage: node scripts/runner-service.js build|images|dispatch [options]');
    process.exit(2);
  }

  process.exitCode = commands[command](args);
}
