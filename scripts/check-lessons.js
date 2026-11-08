// Runs every lesson's reference solution against that lesson's own tests,
// the same way the platform runs learner code.
//
//   node check-lessons.js                      # all lessons
//   node check-lessons.js valid-brackets ...   # only these lessons
//   node check-lessons.js --judge0 [lessons]   # on Judge0's runtime versions, in Docker
//   node check-lessons.js --starters [lessons] # check the starter code instead
//
// Exits 1 if any solution fails, errors, or has no tests to run. With
// --starters, each starter must run and fail at least one test: one that
// crashes, or passes every test, is reported.

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const REPO_ROOT = path.join(__dirname, '..');
const LESSONS_DIR = path.join(REPO_ROOT, 'src/content/lessons');
const ts = require(require.resolve('typescript', { paths: [REPO_ROOT] }));

// Mirrors src/utils/constants/codeRunner.ts
const SEPARATOR_STRING = '<---+++ CODE RESULT +++--->';
const JAVASCRIPT_VALIDATOR = `
const items = tests.map(test => validate(test));
const results = { results: items };
console.log("${SEPARATOR_STRING}");
console.log(JSON.stringify(results));`;
const PYTHON_VALIDATOR = `
import json
runtests()
results = { 'results': test_results }
print("${SEPARATOR_STRING}")
print(json.dumps(results))
`;
const TYPESCRIPT_FILE_HEADER = '// @ts-nocheck\n';

const LANGUAGES = ['javascript', 'typescript', 'python'];
const KNOWN_FLAGS = ['--judge0', '--starters'];
const TIMEOUT_SECONDS = 20;

// Solution variants that aren't the lesson's main function. `alias` points the
// name the tests call at the variant's own function; `skip` says why a variant
// can't be run against the tests at all.
const VARIANTS = {
  'product-array/Bonus': {
    alias: {
      javascript: 'const buildProductArray = buildProductArrayWithDivision;',
      typescript: 'const buildProductArray = buildProductArrayWithDivision;',
      python: 'build_product_array = build_product_array_with_division',
    },
  },
  'sum-digits/RecursiveExpression': {
    skip: 'a one-line recurrence shown in the text, not a program',
  },
};

// The versions behind the language ids in src/services/server/coderunner/judge0/index.ts:
// JavaScript 63 (Node.js 12.14.0), TypeScript 74 (TypeScript 3.7.4 run on that Node)
// and Python 71 (Python 3.8.1).
const JUDGE0_IMAGES = {
  node: 'node:12.14.0-slim',
  python: 'python:3.8.1-slim',
};
const SCRIPTS_MODULES_DIR = path.join(__dirname, 'node_modules');
const JUDGE0_TSC = '/tools/typescript-3.7/bin/tsc';
// Mirrors compilerOptionsForLanguage in src/services/server/coderunner/judge0/index.ts
const JUDGE0_TYPESCRIPT_OPTIONS = ['--target', 'ES2017', '--lib', 'ES2017'];

// Concatenates every fenced code block in an .mdx file
const readCode = (filePath) => {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const blocks = fs.readFileSync(filePath, 'utf8').match(/```[a-zA-Z0-9]*\n[\s\S]*?```/g);

  if (!blocks) {
    return null;
  }

  return blocks.map((block) => block.replace(/^```[a-zA-Z0-9]*\n/, '').replace(/```$/, '')).join('\n');
};

// Runs programs with the node and python3 on this machine. TypeScript is
// transpiled here with type-checking off, then run with the JavaScript tests.
const createLocalRuntime = (tmpDir) => ({
  description: `local (node ${process.version}, ${spawnSync('python3', ['--version'], { encoding: 'utf8' }).stdout.trim()})`,

  run(language, code, name) {
    if (language === 'typescript') {
      code = ts.transpileModule(code, {
        compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.None },
      }).outputText;
    }

    const filePath = path.join(tmpDir, `${name}.${language === 'python' ? 'py' : 'js'}`);
    fs.writeFileSync(filePath, code);

    const command = language === 'python' ? 'python3' : 'node';
    const run = spawnSync(command, [filePath], { encoding: 'utf8', timeout: TIMEOUT_SECONDS * 1000 });

    return {
      stdout: run.stdout || '',
      stderr: run.stderr || '',
      timedOut: Boolean(run.error && run.error.code === 'ETIMEDOUT'),
    };
  },

  stop() {},
});

// Runs programs the way Judge0 does, in containers with the same runtime
// versions. TypeScript goes through `tsc` 3.7.4 with the platform's compiler
// options, and a non-zero exit is a compile error, as it is on Judge0.
const createJudge0Runtime = (tmpDir) => {
  if (spawnSync('docker', ['info'], { stdio: 'ignore' }).status !== 0) {
    throw new Error('--judge0 needs Docker, and Docker is not running.');
  }

  if (!fs.existsSync(path.join(SCRIPTS_MODULES_DIR, 'typescript-3.7'))) {
    throw new Error('--judge0 needs TypeScript 3.7.4. Run `npm install` in scripts/ first.');
  }

  const containers = {};

  const containerFor = (kind) => {
    if (!containers[kind]) {
      const name = `check-lessons-${process.pid}-${kind}`;
      const started = spawnSync(
        'docker',
        [
          'run', '--detach', '--rm', '--name', name, '--network', 'none',
          '--volume', `${tmpDir}:/work`,
          '--volume', `${SCRIPTS_MODULES_DIR}:/tools:ro`,
          JUDGE0_IMAGES[kind], 'sleep', 'infinity',
        ],
        { encoding: 'utf8' },
      );

      if (started.status !== 0) {
        throw new Error(`Could not start ${JUDGE0_IMAGES[kind]}: ${started.stderr.trim()}`);
      }

      containers[kind] = name;
    }

    return containers[kind];
  };

  const exec = (kind, args) => {
    const run = spawnSync(
      'docker',
      ['exec', containerFor(kind), 'timeout', String(TIMEOUT_SECONDS), ...args],
      { encoding: 'utf8' },
    );

    return {
      stdout: run.stdout || '',
      stderr: run.stderr || '',
      timedOut: run.status === 124,
      status: run.status,
    };
  };

  return {
    description: 'Judge0 versions in Docker (Node.js 12.14.0, TypeScript 3.7.4, Python 3.8.1)',

    run(language, code, name) {
      if (language === 'python') {
        fs.writeFileSync(path.join(tmpDir, `${name}.py`), code);
        return exec('python', ['python3', `/work/${name}.py`]);
      }

      if (language === 'typescript') {
        fs.writeFileSync(path.join(tmpDir, `${name}.ts`), code);
        const compiled = exec('node', ['node', JUDGE0_TSC, ...JUDGE0_TYPESCRIPT_OPTIONS, `/work/${name}.ts`]);

        if (compiled.status !== 0) {
          return {
            stdout: '',
            stderr: `Compilation error:\n${(compiled.stdout + compiled.stderr).replace(/\/work\//g, '')}`,
            timedOut: compiled.timedOut,
          };
        }
      } else {
        fs.writeFileSync(path.join(tmpDir, `${name}.js`), code);
      }

      return exec('node', ['node', `/work/${name}.js`]);
    },

    stop() {
      const names = Object.values(containers);

      if (names.length) {
        spawnSync('docker', ['rm', '--force', ...names], { stdio: 'ignore' });
      }
    },
  };
};

// Assembles the program the way src/pages/api/v1/lessons/[id]/submissions/code.ts
// does: file header, then the code, the tests and the validator.
const buildProgram = (language, solution, testsDir) => {
  if (language === 'python') {
    const tests = readCode(path.join(testsDir, 'python.mdx'));
    return tests && `${solution}\n${tests}\n${PYTHON_VALIDATOR}`;
  }

  // TypeScript lessons share the JavaScript tests
  const tests = readCode(path.join(testsDir, 'javascript.mdx'));

  if (!tests) {
    return null;
  }

  const header = language === 'typescript' ? TYPESCRIPT_FILE_HEADER : '';

  return `${header}${solution}\n${tests}\n${JAVASCRIPT_VALIDATOR}`;
};

const checkProgram = (runtime, language, code, name) => {
  const run = runtime.run(language, code, name);
  const separatorIndex = run.stdout.lastIndexOf(SEPARATOR_STRING);

  if (separatorIndex < 0) {
    const reason = run.timedOut ? 'timed out' : run.stderr.trim();
    return { status: 'ERROR', detail: reason.split('\n').slice(0, 6).join('\n') };
  }

  let results;

  try {
    results = JSON.parse(run.stdout.slice(separatorIndex + SEPARATOR_STRING.length).trim()).results;
  } catch (error) {
    return { status: 'ERROR', detail: `could not parse results: ${error.message}` };
  }

  if (results.length === 0) {
    return { status: 'EMPTY', detail: 'the test list is empty, so nothing was checked' };
  }

  const failed = results.filter((result) => !result.passed);

  return {
    status: failed.length ? 'FAIL' : 'PASS',
    passed: results.length - failed.length,
    total: results.length,
    detail: failed
      .map((result) => `${result.description}: expected ${JSON.stringify(result.expected)}, got ${JSON.stringify(result.userAnswer)}`)
      .join('\n'),
  };
};

// A starter should run and fail: it has no solution in it yet. One that passes
// every test means the tests can't tell an empty answer from a correct one.
const asStarterResult = (result) => {
  if (result.status === 'FAIL') {
    return { ...result, status: 'PASS', detail: '' };
  }

  if (result.status === 'PASS') {
    return { ...result, status: 'FAIL', detail: 'the unchanged starter passes every test' };
  }

  return result;
};

const main = () => {
  const args = process.argv.slice(2);
  const flags = args.filter((arg) => arg.startsWith('--'));
  const unknownFlags = flags.filter((flag) => !KNOWN_FLAGS.includes(flag));

  if (unknownFlags.length) {
    console.error(`Unknown option ${unknownFlags.join(', ')}. Options: ${KNOWN_FLAGS.join(', ')}`);
    process.exit(1);
  }

  const useJudge0 = flags.includes('--judge0');
  const checkStarters = flags.includes('--starters');
  const requested = args.filter((arg) => !arg.startsWith('--'));
  const lessons = requested.length
    ? requested
    : fs.readdirSync(LESSONS_DIR).filter((name) => !name.startsWith('.')).sort();
  // realpath, because Docker can only mount the resolved macOS temp directory
  const tmpDir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'check-lessons-')));
  let runtime;

  process.on('exit', () => {
    if (runtime) {
      runtime.stop();
    }
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });
  process.on('SIGINT', () => process.exit(130));

  try {
    runtime = useJudge0 ? createJudge0Runtime(tmpDir) : createLocalRuntime(tmpDir);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }

  const counts = {};

  console.log(`Runtimes: ${runtime.description}\n`);

  for (const lesson of lessons) {
    const testsDir = path.join(LESSONS_DIR, lesson, 'Tests');
    const codeDir = path.join(LESSONS_DIR, lesson, checkStarters ? 'UserAnswer' : 'Solution/code');

    if (!fs.existsSync(codeDir) || !fs.existsSync(testsDir)) {
      if (requested.length) {
        console.log(`SKIP   ${lesson} (no ${path.relative(path.join(LESSONS_DIR, lesson), codeDir)} or Tests directory)`);
      }
      continue;
    }

    // Starters are one set of files; solutions can have several variants
    const variants = checkStarters ? [''] : fs.readdirSync(codeDir).sort();

    for (const variant of variants) {
      const variantConfig = VARIANTS[`${lesson}/${variant}`] || {};
      const label = checkStarters ? `${lesson}/starter` : `${lesson}/${variant}`;

      if (variantConfig.skip) {
        counts.SKIP = (counts.SKIP || 0) + 1;
        console.log(`SKIP   ${label} (${variantConfig.skip})`);
        continue;
      }

      for (const language of LANGUAGES) {
        let code = readCode(path.join(codeDir, variant, `${language}.mdx`));

        if (code && variantConfig.alias) {
          code = `${code}\n${variantConfig.alias[language]}\n`;
        }

        const program = code && buildProgram(language, code, testsDir);

        if (!program) {
          continue;
        }

        const name = `${lesson}.${variant || 'starter'}.${language}`;
        const result = checkStarters
          ? asStarterResult(checkProgram(runtime, language, program, name))
          : checkProgram(runtime, language, program, name);
        const score = result.total ? ` (${result.passed}/${result.total})` : '';
        counts[result.status] = (counts[result.status] || 0) + 1;

        console.log(`${result.status.padEnd(6)} ${label}/${language}${score}`);

        if (result.status !== 'PASS' && result.detail) {
          console.log(result.detail.replace(/^/gm, '         '));
        }
      }
    }
  }

  console.log(`\n${Object.entries(counts).map(([status, count]) => `${count} ${status}`).join(', ')}`);
  process.exitCode = counts.FAIL || counts.ERROR || counts.EMPTY ? 1 : 0;
};

main();
