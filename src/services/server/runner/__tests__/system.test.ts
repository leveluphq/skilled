/**
 * The system runner (CODE_RUNNER=system): programs run with this
 * machine's own Node.js, TypeScript 7 and Python, held to the same limits and
 * reported the same way as in Docker. These run real processes; Python's need
 * a python3 on the PATH, as CI has. The lessons and harness controls run on it
 * with CONFORMANCE_RUNNER=system.
 */
import fs from 'fs';
import os from 'os';
import path from 'path';
import { Judge0Status } from 'utils/constants/codeRunner';
import { CodingLanguage } from 'utils/constants/lesson';
import { SYSTEM_LANGUAGES } from 'utils/shared/runner/settings';
import {
  MINIMUM_NODE,
  MINIMUM_PYTHON,
  TSC_PACKAGE,
  commandFor,
  isRequestFromThisMachine,
  runOnSystem,
  systemProblem,
  toolchain,
} from '../backends/system';
import { runtimes } from '../runtimes';
import { javascriptRuntime, typescriptRuntime } from '../runtimes/javascript';
import { pythonRuntime } from '../runtimes/python';
import { javaRuntime } from '../runtimes/java';
import { LanguageRuntime, Limits } from '../runtimes/types';

const ENV = process.env;
const LIMITS: Limits = { cpuSeconds: 5, wallSeconds: 10, memoryKb: 256000, maxFileSizeKb: 1024 };

afterEach(() => {
  process.env = { ...ENV };
  jest.restoreAllMocks();
});

const runJs = (source: string, stdin = '', limits: Limits = LIMITS) =>
  runOnSystem(javascriptRuntime, source, stdin, limits);

/** A fake toolchain command that prints `output`, whatever it's asked. */
const fakeCommand = (output: string) => {
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'system-test-')), 'tool');

  fs.writeFileSync(file, `#!/bin/sh\necho "${output}"\n`, { mode: 0o755 });
  return file;
};

const isRunning = (pid: number) => {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return false;
  }
};

describe('runOnSystem', () => {
  it('runs a JavaScript program on its stdin and reports it as Judge0 would', async () => {
    const outcome = await runJs(
      "process.stdin.on('data', (d) => console.log('got ' + d.toString().trim()));",
      'hello\n',
    );

    expect(outcome).toMatchObject({
      statusId: Judge0Status.Accepted,
      statusDescription: 'Accepted',
      stderr: '',
      message: '',
    });
    expect(outcome.stdout.toString()).toBe('got hello\n');
    expect(outcome.timeSeconds).toBeGreaterThan(0);
  });

  it('reports the exit status of a program that fails', async () => {
    const outcome = await runJs("console.error('nope'); process.exit(3);");

    expect(outcome).toMatchObject({
      statusId: Judge0Status.RuntimeErrorNzec,
      stderr: 'nope\n',
      message: 'Exited with error status 3',
    });
  });

  it('stops a program at the wall-clock limit, with the processes it started', async () => {
    const outcome = await runJs(
      "const child = require('child_process').spawn('sleep', ['60']); console.log(child.pid); setInterval(() => {}, 1000);",
      '',
      { ...LIMITS, wallSeconds: 1 },
    );

    expect(outcome.statusId).toBe(Judge0Status.TimeLimitExceeded);
    expect(outcome.stderr).toBe('');

    const sleeper = Number(outcome.stdout.toString().trim());

    expect(sleeper).toBeGreaterThan(0);
    expect(isRunning(sleeper)).toBe(false);
  });

  it('ends what a program started when it exits, as a container would', async () => {
    const started = Date.now();
    const outcome = await runJs(
      "const child = require('child_process').spawn('sleep', ['60'], { stdio: 'inherit' }); console.log(child.pid); process.exit(0);",
    );

    expect(outcome.statusId).toBe(Judge0Status.Accepted);
    expect(Date.now() - started).toBeLessThan(5000);
    expect(isRunning(Number(outcome.stdout.toString().trim()))).toBe(false);
  });

  it('stops a busy program at the CPU limit, before the wall-clock one', async () => {
    const started = Date.now();
    const outcome = await runJs('for (;;) {}', '', { ...LIMITS, cpuSeconds: 1, wallSeconds: 8 });

    expect(outcome.statusId).toBe(Judge0Status.TimeLimitExceeded);
    expect(Date.now() - started).toBeLessThan(6000);
  });

  it('stops a program that writes too much, keeping what fits', async () => {
    const outcome = await runJs("for (;;) process.stdout.write('x'.repeat(1024));", '', {
      ...LIMITS,
      maxFileSizeKb: 4,
    });

    expect(outcome.statusId).toBe(Judge0Status.RuntimeErrorSigxfsz);
    expect(outcome.stdout.length).toBe(4 * 1024);
  });

  it("gives the program none of the app's environment, secrets included", async () => {
    process.env = { ...ENV, JWT_SECRET: 'not-for-learners' };

    const outcome = await runJs('console.log(JSON.stringify(process.env));');
    const env = JSON.parse(outcome.stdout.toString());
    // What the runner sets, plus what the shell (PWD, SHLVL, _) and macOS
    // (__CF_USER_TEXT_ENCODING) add to every process
    const allowed = ['HOME', 'PATH', 'TMPDIR', 'PYTHONDONTWRITEBYTECODE', 'PYTHONIOENCODING', 'PYTHONUTF8'];
    const fromTheSystem = ['PWD', 'SHLVL', '_', '__CF_USER_TEXT_ENCODING'];

    expect(env.JWT_SECRET).toBeUndefined();
    expect(Object.keys(env).filter((key) => !allowed.concat(fromTheSystem).includes(key))).toEqual([]);
    expect(env.PATH).toBe(process.env.PATH);
  });

  it('runs each program in a folder of its own, removed afterwards', async () => {
    const outcome = await runJs("console.log(process.cwd() + ' ' + process.env.HOME);");
    const [cwd, home] = outcome.stdout.toString().trim().split(' ');

    expect(home).toBe(cwd);
    expect(path.basename(cwd)).toMatch(/^skilled-run-/);
    expect(fs.existsSync(cwd)).toBe(false);
  });

  // Programs start with `// @ts-nocheck`, as the runtime assembles them
  it('compiles TypeScript with tsc 7 and runs the result', async () => {
    const outcome = await runOnSystem(
      typescriptRuntime,
      '// @ts-nocheck\nconst total: number = [1, 2, 3].reduce((a, b) => a + b, 0);\nconsole.log(total);\n',
      '',
    );

    expect(outcome.statusId).toBe(Judge0Status.Accepted);
    expect(outcome.stdout.toString()).toBe('6\n');
  });

  it('reports a TypeScript syntax error as a compile error, as in Docker', async () => {
    const outcome = await runOnSystem(typescriptRuntime, '// @ts-nocheck\nconst total: number = ;\n', '');

    expect(outcome.statusId).toBe(Judge0Status.CompilationError);
    expect(outcome.compileOutput).toMatch(/script\.ts\(2,\d+\): error TS1109/);
  });

  it('runs Python, reporting an exception with its traceback', async () => {
    const ok = await runOnSystem(pythonRuntime, 'print("é", input())\n', 'hi\n');

    expect(ok.statusId).toBe(Judge0Status.Accepted);
    expect(ok.stdout.toString()).toBe('é hi\n');

    const failed = await runOnSystem(pythonRuntime, 'raise ValueError("no sevens")\n', '');

    expect(failed.statusId).toBe(Judge0Status.RuntimeErrorNzec);
    expect(failed.stderr).toMatch(/ValueError: no sevens/);
  });

  it('holds Node.js to the memory limit through its heap', () => {
    expect(commandFor(javascriptRuntime.system!.run, toolchain(), LIMITS)).toEqual([
      process.execPath,
      '--max-old-space-size=250',
      'script.js',
    ]);
  });
});

describe('systemProblem', () => {
  it('is null when the toolchain is there', async () => {
    await expect(systemProblem(javascriptRuntime)).resolves.toBeNull();
    await expect(systemProblem(typescriptRuntime)).resolves.toBeNull();
    await expect(systemProblem(pythonRuntime)).resolves.toBeNull();
  });

  it('sends the other languages to Docker', async () => {
    await expect(systemProblem(javaRuntime)).resolves.toBe(
      'CODE_RUNNER=system runs JavaScript, TypeScript and Python. Java runs in Docker: see Run Lesson Code in docs/README.md.',
    );
  });

  it('says how to get Python when it is missing, and runs nothing', async () => {
    process.env = { ...ENV, RUNNER_PYTHON: '/nonexistent/python3' };

    const outcome = await runOnSystem(pythonRuntime, 'print(1)\n', '');

    expect(outcome.statusId).toBe(Judge0Status.InternalError);
    expect(outcome.message).toBe(
      `Python isn't installed, or isn't on your PATH as /nonexistent/python3. Install Python ${MINIMUM_PYTHON.join('.')} or later (or set RUNNER_PYTHON to one), or run code in Docker: see Run Lesson Code in docs/README.md.`,
    );
  });

  it('refuses a Python older than the lessons need', async () => {
    const python = fakeCommand('3.7.9');

    process.env = { ...ENV, RUNNER_PYTHON: python };

    await expect(systemProblem(pythonRuntime)).resolves.toBe(
      `Lessons need Python ${MINIMUM_PYTHON.join('.')} or later, and ${python} is 3.7.9. Install a newer one and set RUNNER_PYTHON to it, or run code in Docker.`,
    );
  });

  it('refuses a Node.js older than the lessons need', async () => {
    const node = fakeCommand('v16.20.2');

    process.env = { ...ENV, RUNNER_NODE: node };

    await expect(systemProblem(javascriptRuntime)).resolves.toBe(
      `Lessons need Node.js ${MINIMUM_NODE.join('.')} or later to run JavaScript and TypeScript, and ${node} is 16.20.2. Set RUNNER_NODE to a newer one, or run code in Docker.`,
    );
  });

  it('says to install TypeScript 7 when it is missing', async () => {
    jest.spyOn(process, 'cwd').mockReturnValue(os.tmpdir());

    await expect(systemProblem(typescriptRuntime)).resolves.toBe(
      `TypeScript 7 isn't installed for this machine (${TSC_PACKAGE}). Run \`npm install\`. On a platform other than macOS or Linux on Intel or ARM, add ${TSC_PACKAGE} 7.0.2 to optionalDependencies in package.json.`,
    );
  });

  it("won't run for a copy of the app that isn't at localhost", async () => {
    process.env = { ...ENV, ROOT_URL: 'https://skilled.example.com' };

    const outcome = await runJs("require('fs').writeFileSync('/tmp/should-not-exist', '1')");

    expect(outcome.statusId).toBe(Judge0Status.InternalError);
    expect(outcome.message).toBe(
      'CODE_RUNNER=system runs code on this machine with no sandbox, so it only runs for a copy of the app at localhost, and ROOT_URL is https://skilled.example.com. On a server, use Docker or the runner service.',
    );

    process.env = { ...ENV, ROOT_URL: 'http://localhost:3000' };
    await expect(systemProblem(javascriptRuntime)).resolves.toBeNull();
  });

  it('needs macOS or Linux', async () => {
    const platform = Object.getOwnPropertyDescriptor(process, 'platform')!;

    Object.defineProperty(process, 'platform', { value: 'win32' });

    try {
      await expect(systemProblem(javascriptRuntime)).resolves.toBe(
        'CODE_RUNNER=system needs macOS or Linux. On Windows, run code in Docker, or run the app in WSL.',
      );
    } finally {
      Object.defineProperty(process, 'platform', platform);
    }
  });
});

describe('isRequestFromThisMachine', () => {
  const request = (remoteAddress: string, headers: Record<string, string> = {}) => ({
    socket: { remoteAddress },
    headers,
  });

  it('accepts a browser on this machine', () => {
    expect(isRequestFromThisMachine(request('127.0.0.1'))).toBe(true);
    expect(isRequestFromThisMachine(request('::1'))).toBe(true);
    expect(isRequestFromThisMachine(request('::ffff:127.0.0.1'))).toBe(true);
  });

  it('refuses another machine', () => {
    expect(isRequestFromThisMachine(request('192.168.1.20'))).toBe(false);
    expect(isRequestFromThisMachine({ headers: {} })).toBe(false);
  });

  it('refuses a request through a proxy or tunnel to this machine', () => {
    expect(isRequestFromThisMachine(request('127.0.0.1', { 'x-forwarded-for': '203.0.113.9' }))).toBe(
      false,
    );
    expect(isRequestFromThisMachine(request('::1', { forwarded: 'for=203.0.113.9' }))).toBe(false);
    expect(isRequestFromThisMachine(request('127.0.0.1', { 'cf-connecting-ip': '203.0.113.9' }))).toBe(
      false,
    );
  });
});

describe('the languages the system runner offers', () => {
  it('are the runtimes with a system entry', () => {
    const withSystem = (Object.values(runtimes) as LanguageRuntime[])
      .filter((runtime) => runtime.system)
      .map((runtime) => runtime.language)
      .sort();

    expect(withSystem).toEqual([...SYSTEM_LANGUAGES].sort());
    expect(SYSTEM_LANGUAGES).toEqual([
      CodingLanguage.Javascript,
      CodingLanguage.Typescript,
      CodingLanguage.Python,
    ]);
  });

  it("compile TypeScript with the image's tsc version, from package.json", () => {
    const { optionalDependencies } = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../../../../../package.json'), 'utf8'),
    );
    const imageVersion = typescriptRuntime.docker.image.split(':')[1];

    expect(imageVersion).toBe('7.0.2');
    for (const platform of ['darwin-arm64', 'darwin-x64', 'linux-arm64', 'linux-x64']) {
      expect(optionalDependencies[`@typescript/typescript-${platform}`]).toBe(imageVersion);
    }
  });
});
