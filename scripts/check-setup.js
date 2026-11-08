// Checks a local setup step by step (docs/README.md) and says how to fix
// whatever isn't done: Node.js, the install, the app's settings, Docker,
// Hasura with its schema and the course seed, where code runs, and the app,
// ending with a lesson's reference solution run through the app the way Run
// Code runs it.
//
//   npm run check:setup                  # everything; start the app first (npm run dev)
//   npm run check:setup -- --no-app      # everything up to the app
//   npm run check:setup -- java python   # run code in only these languages
//
// It reads the app's settings as `next dev` does (.env.local, .env and the
// environment) and never prints a secret. It runs code only on this machine:
// when code runs on Judge0 or the runner service, it runs none there.

const { spawnSync } = require('child_process');
const fs = require('fs');
const net = require('net');
const path = require('path');
const { isValidSecret } = require('./setup-env');
const courseSeed = require('./course-seed');
const { IMAGES } = require('./runner-images');

const ROOT = path.join(__dirname, '..');

// A free lesson, so it runs without an account, with code in every language
const LESSON = 'walk-a-matrix';

// The settings the app needs (docs/README.md, step 2)
const REQUIRED = [
  'APP_STAGE',
  'ROOT_DOMAIN',
  'ROOT_URL',
  'GRAPHQL_URL',
  'HASURA_GRAPHQL_ADMIN_SECRET',
  'JWT_TOKEN_NAME',
  'JWT_SECRET',
  'ENCRYPTION_KEY',
];
const SECRETS = ['JWT_SECRET', 'ENCRYPTION_KEY'];

// As getRunnerBackend in src/utils/shared/runner/settings.ts (a test keeps them in step)
const runnerBackend = (env) => {
  if (['docker', 'judge0', 'system', 'service'].includes(env.CODE_RUNNER)) {
    return env.CODE_RUNNER;
  }

  return env.JUDGE0_API_KEY ? 'judge0' : 'docker';
};

// As SYSTEM_LANGUAGES in settings.ts, and the minimums in runner/backends/system.ts
const SYSTEM_LANGUAGES = ['javascript', 'typescript', 'python'];
const MINIMUM_NODE = [18, 0];
const MINIMUM_PYTHON = [3, 9];

const LANGUAGES = Object.keys(IMAGES);
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

const USAGE = `Usage: npm run check:setup -- [--no-app] [language ...]

  --no-app     stop before the app (for before npm run dev)
  language     run code in only these: ${LANGUAGES.join(', ')}`;

const parseArgs = (args) => {
  const options = { app: true, languages: [] };

  for (const arg of args) {
    if (arg === '--no-app') {
      options.app = false;
    } else if (LANGUAGES.includes(arg.toLowerCase())) {
      options.languages.push(arg.toLowerCase());
    } else {
      throw new Error(`Unknown argument: ${arg}\n\n${USAGE}`);
    }
  }

  return options;
};

// Every fenced code block in an MDX file, joined, as the conformance suite
// reads them (test/conformance/lessonCode.ts)
const readCode = (file) => {
  const blocks = fs.readFileSync(file, 'utf8').match(/```[a-zA-Z0-9+#]*\n[\s\S]*?```/g) || [];

  return blocks
    .map((block) => block.replace(/^```[a-zA-Z0-9+#]*\n/, '').replace(/```$/, ''))
    .join('\n');
};

const solutionFile = (root, language) =>
  path.join(root, 'src/content/lessons', LESSON, 'Solution/code/Solution', `${language}.mdx`);

// What's missing or malformed in the app's settings
const settingsProblems = (env) => ({
  missing: REQUIRED.filter((name) => !(env[name] || '').trim()),
  invalid: SECRETS.filter((name) => (env[name] || '').trim() && !isValidSecret(env[name].trim())),
});

const isLocalUrl = (url) => {
  try {
    return LOCAL_HOSTS.has(new URL(url).hostname);
  } catch (error) {
    return false;
  }
};

const versionOf = (command) => {
  const result = spawnSync(command, ['--version'], { encoding: 'utf8', timeout: 10000 });
  const match = `${result.stdout || ''}${result.stderr || ''}`.match(/(\d+)\.(\d+)(?:\.(\d+))?/);

  return result.status === 0 && match ? match.slice(1).filter(Boolean).map(Number) : null;
};

const atLeast = (version, minimum) => {
  for (let i = 0; i < minimum.length; i += 1) {
    if ((version[i] || 0) !== minimum[i]) {
      return (version[i] || 0) > minimum[i];
    }
  }

  return true;
};

// A response, or why there isn't one
const reach = async (url, options = {}, timeoutMs = 10000) => {
  try {
    return { response: await fetch(url, { ...options, signal: AbortSignal.timeout(timeoutMs) }) };
  } catch (error) {
    return {
      reason:
        error.name === 'TimeoutError'
          ? 'no answer'
          : (error.cause && error.cause.code) || error.message,
    };
  }
};

const readJson = (response) => response.json().catch(() => null);

const postJson = (url, body, headers = {}, timeoutMs) =>
  reach(
    url,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...headers },
      body: JSON.stringify(body),
    },
    timeoutMs,
  );

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// The container that publishes a port, and the folder of its compose file
const portHolder = (port) => {
  const result = spawnSync(
    'docker',
    [
      'ps',
      '--filter',
      `publish=${port}`,
      '--format',
      '{{.Names}}\t{{.Label "com.docker.compose.project.working_dir"}}',
    ],
    { encoding: 'utf8', timeout: 10000 },
  );
  const [name, dir = ''] = (result.stdout || '').split('\n')[0].split('\t');

  return name ? { name, dir } : null;
};

// A port nothing listens on, from 8090 up
const freePort = async (from = 8090) => {
  for (let port = from; port < from + 50; port += 1) {
    const free = await new Promise((resolve) => {
      const server = net.createServer();

      server.once('error', () => resolve(false));
      server.once('listening', () => server.close(() => resolve(true)));
      server.listen(port);
    });

    if (free) {
      return port;
    }
  }

  return null;
};

// The Hasura CLI's version, or null if it isn't installed
const hasuraCliVersion = () => {
  const result = spawnSync('hasura', ['version', '--skip-update-check'], {
    encoding: 'utf8',
    timeout: 20000,
  });

  if (result.error || result.status !== 0) {
    return null;
  }

  return (`${result.stdout}${result.stderr}`.match(/(v\d+\.\d+\.\d+)/) || [])[1] || 'unknown';
};

const reporter = (log) => {
  let problems = 0;
  const detail = (text) => text && log(text.replace(/^/gm, '    '));

  return {
    ok: (text) => log(`✓ ${text}`),
    note: (text, fix) => {
      log(`! ${text}`);
      detail(fix);
    },
    fail: (text, fix) => {
      problems += 1;
      log(`✗ ${text}`);
      detail(fix);
    },
    skip: (text) => log(`- ${text}`),
    problems: () => problems,
  };
};

// The result the editor polls for (components/graphql/queries/getCodeSubmissionByToken.ts)
const RESULT_QUERY = `query checkSetupResult($codeRunnerToken: String!) {
  code_submissions(
    where: { codeRunnerToken: { _eq: $codeRunnerToken }, executionStatus: { _neq: "EXECUTING" } }
    limit: 1
  ) { executionStatus resultStatus results }
}`;

const firstLine = (text) =>
  String(text || '')
    .trim()
    .split('\n')[0];

// Runs the lesson's reference solution through the app, as Run Code does
const runLesson = async ({ rootUrl, lessonId, language, code }) => {
  const posted = await postJson(
    `${rootUrl}/api/v1/lessons/${lessonId}/submissions/code`,
    { code, tests: '', language: language.toUpperCase() },
    {},
    90000,
  );

  if (posted.reason) {
    return { reason: `the run-code route didn't answer (${posted.reason})` };
  }

  const body = (await readJson(posted.response)) || {};

  if (!posted.response.ok || !body.token) {
    return {
      reason: `the run-code route answered ${posted.response.status}: ${body.message || 'no token'}`,
    };
  }

  const deadline = Date.now() + 90000;

  while (Date.now() < deadline) {
    const answer = await postJson(`${rootUrl}/api/graphql`, {
      query: RESULT_QUERY,
      variables: { codeRunnerToken: body.token },
    });
    const data = answer.response && (await readJson(answer.response));
    const row = data && data.data && data.data.code_submissions[0];

    if (row) {
      const results = row.results || {};
      const tests = results.tests || [];
      const passed = tests.filter((test) => test.status === 'passed').length;

      if (row.resultStatus === 'PASSED') {
        return { passed, total: tests.length };
      }

      if (results.problem) {
        return { reason: `${results.problem}: ${firstLine(results.problemDetail)}` };
      }

      const failing = tests.find((test) => test.status !== 'passed');

      return {
        reason: `${tests.length - passed} of ${tests.length} tests didn't pass${
          failing ? `, the first "${failing.description}"` : ''
        }`,
      };
    }

    await sleep(500);
  }

  return { reason: 'no result within 90 seconds' };
};

const checkSetup = async ({ root = ROOT, env, args = [], log = console.log } = {}) => {
  const options = parseArgs(args);
  const r = reporter(log);
  const finish = (rootUrl) => {
    log('');

    if (r.problems()) {
      log(
        `${r.problems()} ${r.problems() === 1 ? 'thing needs' : 'things need'} fixing. Start with the first ✗, then run this again.`,
      );
    } else if (!options.app) {
      log('All set up to the app. Start it with `npm run dev`, then run `npm run check:setup`.');
    } else {
      log(`All set. The course is at ${rootUrl}/course.`);
    }

    return r.problems() ? 1 : 0;
  };

  log('Checking the local setup (docs/README.md has each step)\n');

  // Node.js
  const wanted = fs.readFileSync(path.join(root, '.nvmrc'), 'utf8').trim();

  if (process.versions.node.split('.')[0] === wanted) {
    r.ok(`Node.js ${process.versions.node}`);
  } else {
    r.note(
      `Node.js ${process.versions.node}, and the app is built and tested on Node.js ${wanted} (.nvmrc)`,
      'nvm use   (nvm install, the first time)',
    );
  }

  // The install
  if (!fs.existsSync(path.join(root, 'node_modules/next/package.json'))) {
    r.fail("The dependencies aren't installed", 'npm ci');
    return finish();
  }

  r.ok('Dependencies installed');

  // The app's settings, from the same files `next dev` reads
  let files = [];

  if (!env) {
    // eslint-disable-next-line global-require
    const { loadEnvConfig } = require('@next/env');
    const loaded = loadEnvConfig(root, true, { info: () => {}, error: log });

    env = loaded.combinedEnv;
    files = loaded.loadedEnvFiles.map((file) => file.path);
  }

  const { missing, invalid } = settingsProblems(env);
  const source = files.length ? files.join(', ') : 'the environment';

  if (missing.length && !files.includes('.env.local')) {
    r.fail("There's no .env.local, the app's settings", 'npm run setup:env');
  } else if (missing.length) {
    const onlySecrets = missing.every((name) => SECRETS.includes(name));

    r.fail(
      `${missing.join(', ')} ${missing.length === 1 ? "isn't" : "aren't"} set (in ${source})`,
      onlySecrets
        ? 'npm run setup:env'
        : 'Copy each line from .env.example into .env.local, and run npm run setup:env for JWT_SECRET and ENCRYPTION_KEY',
    );
  } else if (!invalid.length) {
    r.ok(`The app's settings, from ${source}`);
  }

  if (invalid.length) {
    r.fail(
      `${invalid.join(' and ')} ${invalid.length === 1 ? "isn't" : "aren't"} 64 bytes of base64, so logging in won't work`,
      "Delete the line from .env.local and run npm run setup:env (by hand: openssl rand -base64 64 | tr -d '\\n')",
    );
  }

  if (env.OPEN_ALL_LESSONS !== 'true') {
    r.note(
      "OPEN_ALL_LESSONS isn't true, so only the free lessons open without logging in",
      'For the whole course without an account, set OPEN_ALL_LESSONS=true in .env.local and restart the app',
    );
  }

  // Docker, for Hasura here and for running code in Docker
  const backend = runnerBackend(env);
  const graphqlUrl = (env.GRAPHQL_URL || '').trim();
  const needsDocker = backend === 'docker' || isLocalUrl(graphqlUrl);
  const docker = spawnSync('docker', ['info', '--format', '{{.ServerVersion}}'], {
    encoding: 'utf8',
    timeout: 30000,
  });
  const dockerUp = docker.status === 0;

  if (dockerUp) {
    r.ok(`Docker ${docker.stdout.trim()}`);
  } else if (!needsDocker) {
    r.skip("Docker: not running, and this setup doesn't need it");
  } else if (docker.error && docker.error.code === 'ENOENT') {
    r.fail(
      "Docker isn't installed",
      'Docker Desktop (macOS, Windows) or Docker Engine (Linux): https://docs.docker.com/get-docker/',
    );
  } else {
    r.fail(
      "Docker isn't running",
      'Start Docker Desktop (or the Docker service), then run this again',
    );
  }

  // Hasura, its schema and the course seed
  const adminSecret = (env.HASURA_GRAPHQL_ADMIN_SECRET || '').trim();
  let hasura;

  if (graphqlUrl && adminSecret) {
    try {
      hasura = courseSeed.resolveConnection({
        env: { GRAPHQL_URL: graphqlUrl, HASURA_GRAPHQL_ADMIN_SECRET: adminSecret },
      });
    } catch (error) {
      r.fail(error.message.replace('HASURA_GRAPHQL_ENDPOINT', 'GRAPHQL_URL'));
    }
  } else {
    r.skip('Hasura: skipped until GRAPHQL_URL and HASURA_GRAPHQL_ADMIN_SECRET are set');
  }

  let catalog = null;

  if (hasura) {
    const port = new URL(hasura.endpoint).port || '80';
    const start = `${port === '8080' ? '' : `HASURA_PORT=${port} `}docker compose -f hasura/docker-compose.yml up -d`;
    const health = await reach(`${hasura.endpoint}/healthz`);
    const healthy =
      health.response && health.response.ok && (await health.response.text()).trim() === 'OK';
    // Another project's container on the port, rather than this repo's Hasura
    const holder = !health.reason && dockerUp && isLocalUrl(graphqlUrl) ? portHolder(port) : null;
    const someoneElse = holder && path.resolve(holder.dir || '/') !== path.join(root, 'hasura');
    const moveFix = async () => {
      const free = await freePort();

      return `Start this repo's Hasura on a free port, and point the app at it (docs/README.md, "Port 8080 is already in use"):\nHASURA_PORT=${free} docker compose -f hasura/docker-compose.yml up -d\nnpm run setup:env -- --hasura-port ${free}\nThen, in step 4, export HASURA_GRAPHQL_ENDPOINT=http://localhost:${free}, not 8080.`;
    };

    if (health.reason) {
      r.fail(
        `Nothing answers at ${hasura.host}, where GRAPHQL_URL points (${health.reason})`,
        `Start Hasura and Postgres: ${start}\nIt's up when curl ${hasura.endpoint}/healthz says OK.`,
      );
    } else if (!healthy) {
      r.fail(
        `Something other than a healthy Hasura answers at ${hasura.host}${
          someoneElse ? ` (the container ${holder.name})` : ''
        }`,
        someoneElse
          ? await moveFix()
          : `Is another program using port ${port}? See "Port 8080 is already in use" in docs/README.md.`,
      );
    } else {
      const state = await postJson(
        `${hasura.endpoint}/v1/metadata`,
        { type: 'get_catalog_state', args: {} },
        { 'x-hasura-admin-secret': adminSecret },
      );
      const body = state.response && (await readJson(state.response));

      if (body && body.code === 'access-denied' && someoneElse) {
        r.fail(
          `Port ${port} has another project's Hasura (the container ${holder.name}), not this repo's`,
          await moveFix(),
        );
      } else if (body && body.code === 'access-denied') {
        r.fail(
          `The Hasura at ${hasura.host} refuses HASURA_GRAPHQL_ADMIN_SECRET`,
          `.env.local needs the admin secret hasura/docker-compose.yml starts Hasura with, as .env.example has it.\nIf this is another project's Hasura on port ${port}, move this one: see "Port 8080 is already in use" in docs/README.md.`,
        );
      } else if (!body || !state.response.ok) {
        r.fail(
          `The Hasura at ${hasura.host} answered ${state.reason || state.response.status} to the admin secret`,
        );
      } else {
        const version = await reach(`${hasura.endpoint}/v1/version`);
        const info = version.response && (await readJson(version.response));

        r.ok(`Hasura ${(info && info.version) || ''} at ${hasura.host}`.replace('  ', ' '));
        catalog = body;
      }
    }
  }

  const cli = (command) =>
    `With HASURA_GRAPHQL_ENDPOINT=${hasura && hasura.endpoint} and HASURA_GRAPHQL_ADMIN_SECRET exported (docs/README.md, step 4):\nhasura --project hasura ${command} --skip-update-check`;
  let schemaReady = false;

  if (catalog) {
    const applied =
      (catalog.cli_state && catalog.cli_state.migrations && catalog.cli_state.migrations.default) ||
      {};
    const versions = fs
      .readdirSync(path.join(root, 'hasura/migrations/default'))
      .map((name) => (name.match(/^(\d+)_/) || [])[1])
      .filter(Boolean);
    const pending = versions.filter((version) => !(version in applied));
    // The CLI marks a migration dirty when it stopped partway
    const dirty = versions.filter((version) => applied[version] === true);

    if (pending.length) {
      r.fail(
        `${pending.length} of the ${versions.length} migrations ${pending.length === 1 ? "isn't" : "aren't"} applied`,
        cli('migrate apply --database-name default'),
      );
    } else if (dirty.length) {
      r.fail(
        `Migration ${dirty.join(', ')} stopped partway`,
        'hasura --project hasura migrate status --database-name default shows it. Deleting the data and applying again is simplest: docker compose -f hasura/docker-compose.yml down -v, then steps 3 and 4.',
      );
    } else {
      r.ok(`Migrations: all ${versions.length} applied`);
    }

    const expected = (
      fs
        .readFileSync(
          path.join(root, 'hasura/metadata/databases/default/tables/tables.yaml'),
          'utf8',
        )
        .match(/!include/g) || []
    ).length;
    const exported = await postJson(
      `${hasura.endpoint}/v1/metadata`,
      { type: 'export_metadata', args: {} },
      { 'x-hasura-admin-secret': adminSecret },
    );
    const consistency = await postJson(
      `${hasura.endpoint}/v1/metadata`,
      { type: 'get_inconsistent_metadata', args: {} },
      { 'x-hasura-admin-secret': adminSecret },
    );
    const metadata = (exported.response && (await readJson(exported.response))) || {};
    const inconsistent = (consistency.response && (await readJson(consistency.response))) || {};
    const source = (metadata.sources || []).find((item) => item.name === 'default');
    const tracked = source ? source.tables.length : 0;

    if (tracked < expected) {
      r.fail(
        `Hasura tracks ${tracked} of the ${expected} tables, so the metadata isn't applied`,
        cli('metadata apply'),
      );
    } else if (inconsistent.is_consistent === false) {
      r.fail(
        `The metadata has ${inconsistent.inconsistent_objects.length} inconsistent objects`,
        `Apply the migrations first, then the metadata. ${cli('metadata apply')}`,
      );
    } else {
      r.ok(`Metadata: all ${expected} tables tracked`);
      schemaReady = !pending.length && !dirty.length;
    }
  } else if (hasura) {
    r.skip('Migrations, metadata and the course seed: skipped until the Hasura check passes');
  }

  // The Hasura CLI, which applies the migrations and metadata
  const cliVersion = hasuraCliVersion();
  const composeFile = fs.readFileSync(path.join(root, 'hasura/docker-compose.yml'), 'utf8');
  const wantedCli = (composeFile.match(/hasura\/graphql-engine:(v[\d.]+)/) || [])[1];

  if (!cliVersion && !schemaReady) {
    r.fail(
      "The Hasura CLI isn't installed, and applying the schema needs it",
      `curl -L https://github.com/hasura/graphql-engine/raw/stable/cli/get.sh | VERSION=${wantedCli} bash`,
    );
  } else if (!cliVersion) {
    r.skip('Hasura CLI: not installed, which is fine until the schema changes');
  } else if (wantedCli && cliVersion !== wantedCli) {
    r.note(
      `Hasura CLI ${cliVersion}, and this repo's Hasura is ${wantedCli}`,
      `hasura update-cli --version ${wantedCli}`,
    );
  } else {
    r.ok(`Hasura CLI ${cliVersion}`);
  }

  const seed = courseSeed.readSeed(path.join(root, 'hasura/seeds/course.json'));

  if (schemaReady) {
    const lines = [];

    try {
      const code = await courseSeed.run(['diff'], {
        seedFile: path.join(root, 'hasura/seeds/course.json'),
        env: { GRAPHQL_URL: graphqlUrl, HASURA_GRAPHQL_ADMIN_SECRET: adminSecret },
        log: (line) => lines.push(line),
      });

      if (code === 0) {
        r.ok(
          `Course seed: ${seed.categories.length} categories and ${seed.lessons.length} lessons`,
        );
      } else {
        const count = (lines.join('\n').match(/(\d+) rows? differs?/) || [])[1];

        r.fail(
          `The course seed isn't applied: ${count || 'some'} rows differ from hasura/seeds/course.json`,
          'node scripts/course-seed.js apply --env-file .env.local',
        );
      }
    } catch (error) {
      r.fail(`Course seed: ${error.message}`);
    }
  } else if (catalog) {
    r.skip('Course seed: skipped until the schema is in place');
  }

  // Where code runs
  let runnable = [];

  if (backend === 'docker') {
    if (dockerUp) {
      const images = spawnSync('docker', ['image', 'ls', '--format', '{{.Repository}}:{{.Tag}}'], {
        encoding: 'utf8',
      });
      const have = new Set((images.stdout || '').split('\n'));
      const absent = LANGUAGES.filter((language) => !have.has(IMAGES[language].image));

      runnable = LANGUAGES.filter((language) => have.has(IMAGES[language].image));

      if (!runnable.length) {
        r.fail(
          'Code runs in Docker, and none of its images are here yet',
          'npm run runner:images javascript python   (with no names, all ten languages: about 13 GB)',
        );
      } else {
        r.ok(`Code runs in Docker, in ${runnable.join(', ')}`);

        if (absent.length) {
          r.skip(`Not pulled: ${absent.join(', ')} (npm run runner:images <name>)`);
        }
      }
    } else {
      r.skip('Runner images: skipped until Docker runs');
    }
  } else if (backend === 'system') {
    const node = versionOf(env.RUNNER_NODE || process.execPath);
    const python = versionOf(env.RUNNER_PYTHON || 'python3');
    const problems = [];

    if (!node || !atLeast(node, MINIMUM_NODE)) {
      problems.push(`Node.js ${MINIMUM_NODE.join('.')} or newer (RUNNER_NODE)`);
    }
    if (!python || !atLeast(python, MINIMUM_PYTHON)) {
      problems.push(`python3 ${MINIMUM_PYTHON.join('.')} or newer on the PATH (or RUNNER_PYTHON)`);
    }
    if (!isLocalUrl(env.ROOT_URL)) {
      problems.push(
        'ROOT_URL at localhost, since the system runner runs code only for this machine',
      );
    }

    if (problems.length) {
      r.fail(
        `Code runs with this machine's Node.js and Python (CODE_RUNNER=system), which needs ${problems.join('; ')}`,
      );
    } else {
      r.ok(
        `Code runs with this machine's Node.js ${node.join('.')} and Python ${python.join('.')} (CODE_RUNNER=system), in ${SYSTEM_LANGUAGES.join(', ')}`,
      );
      runnable = SYSTEM_LANGUAGES;
    }
  } else {
    const [name, needs] =
      backend === 'service'
        ? ['the runner service', ['RUNNER_SERVICE_URL', 'RUNNER_SERVICE_SECRET']]
        : ['Judge0', ['JUDGE0_API_KEY', 'JUDGE0_CALLBACK_SECRET']];
    const unset = needs.filter((variable) => !(env[variable] || '').trim());
    const why = env.CODE_RUNNER ? `CODE_RUNNER=${backend}` : 'JUDGE0_API_KEY is set';

    if (unset.length) {
      r.fail(
        `Code runs on ${name} (${why}), and ${unset.join(' and ')} ${unset.length === 1 ? "isn't" : "aren't"} set`,
      );
    } else {
      r.note(
        `Code runs on ${name} (${why}), so this runs none there and each run from the app counts against its limits`,
        'To run code on this machine, set CODE_RUNNER=docker in .env.local and restart the app',
      );
    }
  }

  // The app, and Run Code
  const rootUrl = (env.ROOT_URL || '').trim().replace(/\/+$/, '');

  if (!options.app) {
    r.skip('The app and Run Code: skipped (--no-app)');
    return finish(rootUrl);
  }

  if (!rootUrl) {
    r.skip('The app: skipped until ROOT_URL is set');
    return finish(rootUrl);
  }

  // A page's first visit in `next dev` compiles it
  const slow = setTimeout(() => log(`  (waiting for ${rootUrl} to compile the lesson page)`), 5000);
  const page = await reach(`${rootUrl}/course/${LESSON}`, {}, 300000);

  clearTimeout(slow);

  if (page.reason) {
    r.fail(
      `Nothing answers at ${rootUrl}, the ROOT_URL (${page.reason})`,
      'Start the app: npm run dev',
    );
    return finish(rootUrl);
  }

  if (!page.response.ok) {
    r.fail(
      `${rootUrl}/course/${LESSON} answered ${page.response.status}`,
      page.response.status === 404
        ? 'Is another program using port 3000? Otherwise the course seed may be missing the lesson.'
        : "npm run dev's output says why",
    );
    return finish(rootUrl);
  }

  r.ok(`The app at ${rootUrl} serves the lessons`);

  const unavailable = options.languages.filter((language) => !runnable.includes(language));
  const languages = (options.languages.length ? options.languages : runnable).filter((language) =>
    runnable.includes(language),
  );

  for (const language of unavailable) {
    r.fail(
      `Run Code in ${language}: can't run here`,
      backend === 'docker'
        ? `npm run runner:images ${language}`
        : `Code runs ${backend === 'system' ? `in only ${SYSTEM_LANGUAGES.join(', ')}` : 'elsewhere'} with CODE_RUNNER=${backend}`,
    );
  }

  const lesson = seed.lessons.find((row) => row.slug === LESSON);

  for (const language of languages) {
    const started = Date.now();
    const outcome = await runLesson({
      rootUrl,
      lessonId: lesson.id,
      language,
      code: readCode(solutionFile(root, language)),
    });
    const seconds = ((Date.now() - started) / 1000).toFixed(1);

    if (outcome.reason) {
      r.fail(`Run Code in ${language}: ${outcome.reason}`, "npm run dev's output may say more");
    } else {
      r.ok(`Run Code in ${language}: all ${outcome.total} tests pass (${seconds} s)`);
    }
  }

  return finish(rootUrl);
};

module.exports = {
  LESSON,
  REQUIRED,
  SYSTEM_LANGUAGES,
  MINIMUM_NODE,
  MINIMUM_PYTHON,
  checkSetup,
  parseArgs,
  readCode,
  runLesson,
  runnerBackend,
  settingsProblems,
  solutionFile,
};

if (require.main === module) {
  checkSetup({ args: process.argv.slice(2) }).then(
    (code) => process.exit(code),
    (error) => {
      console.error(error.message);
      process.exit(2);
    },
  );
}
