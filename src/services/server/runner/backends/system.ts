import { execFile, spawn, StdioOptions } from 'child_process';
import { constants as fsConstants, promises as fs, openSync, closeSync } from 'fs';
import os from 'os';
import path from 'path';
import { performance } from 'perf_hooks';
import { LanguageName } from 'utils/constants/lesson';
import { LanguageRuntime, Limits } from '../runtimes/types';
import { RunOutcome } from '../verdict';
import { COMPILE_SECONDS, internalError, outcomeFromOutputs } from './runScript';

// Runs a program with this machine's own Node.js and Python, for people
// without Docker (CODE_RUNNER=system), and reports it the way
// Judge0 would, so it's judged exactly as a run in Docker is. JavaScript,
// TypeScript and Python only: the other languages' harnesses rely on what
// their images set up (GCC's bits/stdc++.h, Swift's Glibc, Kotlin's compiler
// cache).
//
// There's no sandbox. The program runs as you, with your files and the
// network; only its time, output and (for Node.js) heap are limited, and it
// gets none of the app's environment variables. So it's only for running
// your own code on your own machine: the run-code route accepts only
// requests from this machine (isRequestFromThisMachine), and this refuses to
// run for a copy of the app that isn't at localhost.

// The oldest versions every lesson runs on (checked with the conformance
// suite, CONFORMANCE_RUNNER=system)
export const MINIMUM_NODE = [18, 0];
export const MINIMUM_PYTHON = [3, 9];

const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '[::1]', '::1']);

const isLocalUrl = (url: string) => {
  try {
    return LOCAL_HOSTNAMES.has(new URL(url).hostname);
  } catch (error) {
    return false;
  }
};

// Headers a proxy or tunnel adds. A request that has any came from somewhere
// else, even though it arrives on the loopback interface.
const PROXY_HEADERS = ['x-forwarded-for', 'forwarded', 'x-real-ip', 'cf-connecting-ip', 'true-client-ip'];
const LOOPBACK = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1']);

interface RequestLike {
  socket?: { remoteAddress?: string };
  headers: Record<string, string | string[] | undefined>;
}

/** Whether a request comes from a browser on this machine, not through a proxy or tunnel. */
export const isRequestFromThisMachine = (req: RequestLike) =>
  LOOPBACK.has((req.socket && req.socket.remoteAddress) || '') &&
  PROXY_HEADERS.every((header) => req.headers[header] === undefined);

const formatVersion = (version: number[]) => version.join('.');

const atLeast = (version: number[], minimum: number[]) => {
  for (let i = 0; i < minimum.length; i += 1) {
    if ((version[i] || 0) !== minimum[i]) {
      return (version[i] || 0) > minimum[i];
    }
  }

  return true;
};

const parseVersion = (text: string) => {
  const match = text.match(/(\d+)\.(\d+)(?:\.(\d+))?/);

  return match ? match.slice(1).filter(Boolean).map(Number) : null;
};

/** Runs a command for its version: the version, or null with whether it's missing. */
const versionOf = (command: string, args: string[]) =>
  new Promise<{ version: number[] | null; missing: boolean }>((resolve) => {
    execFile(command, args, { timeout: 15000 }, (error, stdout, stderr) => {
      const missing = !!error && (error as NodeJS.ErrnoException).code === 'ENOENT';

      resolve({ version: missing ? null : parseVersion(`${stdout} ${stderr}`), missing });
    });
  });

interface Toolchain {
  node: string;
  tsc: string;
  python: string;
}

// The same tsc as the TypeScript image, 7.0.2. Its native compiler comes in a
// package per platform, in package.json's optionalDependencies, which npm
// installs only for this machine. (The typescript package itself would put a
// second `tsc` command next to the app's own TypeScript.)
export const TSC_PACKAGE = `@typescript/typescript-${process.platform}-${process.arch}`;

export const toolchain = (): Toolchain => ({
  node: process.env.RUNNER_NODE || process.execPath,
  tsc: path.join(process.cwd(), 'node_modules', TSC_PACKAGE, 'lib', 'tsc'),
  python: process.env.RUNNER_PYTHON || 'python3',
});

type Tool = keyof Toolchain;

const TOOLS: Tool[] = ['node', 'tsc', 'python'];

// A tool that works is checked once; one that doesn't is checked again on the
// next run, so installing it doesn't need a restart
const working = new Set<string>();

/** Why a tool can't run lessons, or null when it can. */
const toolProblem = async (tool: Tool, tools: Toolchain): Promise<string | null> => {
  const key = `${tool}:${tools[tool]}`;

  if (working.has(key)) {
    return null;
  }

  let problem: string | null = null;

  if (tool === 'tsc') {
    try {
      await fs.access(tools.tsc, fsConstants.X_OK);
    } catch (error) {
      problem = `TypeScript 7 isn't installed for this machine (${TSC_PACKAGE}). Run \`npm install\`. On a platform other than macOS or Linux on Intel or ARM, add ${TSC_PACKAGE} 7.0.2 to optionalDependencies in package.json.`;
    }
  } else if (tool === 'node') {
    const { version, missing } =
      tools.node === process.execPath
        ? { version: parseVersion(process.versions.node), missing: false }
        : await versionOf(tools.node, ['--version']);

    if (!version) {
      problem = missing
        ? `RUNNER_NODE is ${tools.node}, which doesn't exist. Point it at a Node.js ${formatVersion(MINIMUM_NODE)} or later.`
        : `Couldn't run ${tools.node} --version. Point RUNNER_NODE at a Node.js ${formatVersion(MINIMUM_NODE)} or later.`;
    } else if (!atLeast(version, MINIMUM_NODE)) {
      problem = `Lessons need Node.js ${formatVersion(MINIMUM_NODE)} or later to run JavaScript and TypeScript, and ${tools.node} is ${formatVersion(version)}. Set RUNNER_NODE to a newer one, or run code in Docker.`;
    }
  } else {
    const { version, missing } = await versionOf(tools.python, [
      '-c',
      'import sys; print("%d.%d.%d" % sys.version_info[:3])',
    ]);

    if (!version) {
      problem = missing
        ? `Python isn't installed, or isn't on your PATH as ${tools.python}. Install Python ${formatVersion(MINIMUM_PYTHON)} or later (or set RUNNER_PYTHON to one), or run code in Docker: see Run Lesson Code in docs/README.md.`
        : `Couldn't run ${tools.python}. Set RUNNER_PYTHON to a Python ${formatVersion(MINIMUM_PYTHON)} or later, or run code in Docker.`;
    } else if (!atLeast(version, MINIMUM_PYTHON)) {
      problem = `Lessons need Python ${formatVersion(MINIMUM_PYTHON)} or later, and ${tools.python} is ${formatVersion(version)}. Install a newer one and set RUNNER_PYTHON to it, or run code in Docker.`;
    }
  }

  if (!problem) {
    working.add(key);
  }

  return problem;
};

/** Why this machine can't run the language's programs, or null when it can. */
export const systemProblem = async (runtime: LanguageRuntime): Promise<string | null> => {
  if (!runtime.system) {
    return `CODE_RUNNER=system runs JavaScript, TypeScript and Python. ${LanguageName[runtime.language]} runs in Docker: see Run Lesson Code in docs/README.md.`;
  }

  if (process.platform === 'win32') {
    return 'CODE_RUNNER=system needs macOS or Linux. On Windows, run code in Docker, or run the app in WSL.';
  }

  const rootUrl = process.env.ROOT_URL;

  if (rootUrl && !isLocalUrl(rootUrl)) {
    return `CODE_RUNNER=system runs code on this machine with no sandbox, so it only runs for a copy of the app at localhost, and ROOT_URL is ${rootUrl}. On a server, use Docker or the runner service.`;
  }

  const tools = toolchain();
  const commands = [...(runtime.system.compile || []), ...runtime.system.run].join(' ');

  for (const tool of TOOLS) {
    if (commands.includes(`{${tool}}`)) {
      const problem = await toolProblem(tool, tools);

      if (problem) {
        return problem;
      }
    }
  }

  return null;
};

/** A runtime's command with the toolchain and limits filled in. */
export const commandFor = (argv: string[], tools: Toolchain, limits: Limits) =>
  argv.map((arg) =>
    arg
      .replace('{node}', tools.node)
      .replace('{tsc}', tools.tsc)
      .replace('{python}', tools.python)
      .replace('{memoryMb}', String(Math.floor(limits.memoryKb / 1024))),
  );

// The program's whole environment: none of the app's (its secrets included)
const programEnv = (dir: string): Record<string, string> => ({
  PATH: process.env.PATH || '/usr/local/bin:/usr/bin:/bin',
  HOME: dir,
  TMPDIR: dir,
  // UTF-8 in and out, whatever the locale
  PYTHONUTF8: '1',
  PYTHONIOENCODING: 'utf-8',
  PYTHONDONTWRITEBYTECODE: '1',
});

interface Finished {
  // An exit status as a shell reports it: 128 + the signal for a program a
  // signal ended, 124 for the time-out, 153 (SIGXFSZ) for too much output
  status: number;
  stdout: Buffer;
  stderr: Buffer;
  started: number;
  finished: number;
}

interface ProcessOptions {
  dir: string;
  stdinFile?: string;
  cpuSeconds?: number;
  wallSeconds: number;
  outputBytes: number;
}

const killGroup = (pid: number | undefined) => {
  if (pid === undefined) {
    return;
  }

  try {
    // The program leads its own process group, so this ends anything it started too
    process.kill(-pid, 'SIGKILL');
  } catch (error) {
    // It already finished
  }
};

// Runs one command in its own process group. CPU time is limited with
// ulimit, as in Docker: the soft limit sends SIGXCPU, and the hard one, a
// second later, SIGKILL for a program that ignores it. The shell execs the
// program, so no shell reports a signal on its stderr, as on Judge0.
const runProcess = (argv: string[], options: ProcessOptions) =>
  new Promise<Finished>((resolve) => {
    const limitsScript = options.cpuSeconds
      ? // Soft first: a hard limit below the soft one is refused
        `ulimit -S -t ${options.cpuSeconds} && ulimit -H -t ${options.cpuSeconds + 1} && exec "$@"`
      : 'exec "$@"';
    const stdinFd = options.stdinFile ? openSync(options.stdinFile, 'r') : 'ignore';
    const stdio: StdioOptions = [stdinFd, 'pipe', 'pipe'];
    const started = performance.now() / 1000;
    const child = spawn('/bin/sh', ['-c', limitsScript, 'sh', ...argv], {
      cwd: options.dir,
      // The app's ProcessEnv type insists on NODE_ENV, which programs don't get
      env: programEnv(options.dir) as unknown as NodeJS.ProcessEnv,
      detached: true,
      stdio,
    });

    if (typeof stdinFd === 'number') {
      closeSync(stdinFd);
    }

    let timedOut = false;
    let tooMuchOutput = false;
    const chunks = { stdout: [] as Buffer[], stderr: [] as Buffer[] };
    const sizes = { stdout: 0, stderr: 0 };
    const timer = setTimeout(() => {
      timedOut = true;
      killGroup(child.pid);
    }, options.wallSeconds * 1000);

    const collect = (stream: 'stdout' | 'stderr') => (chunk: Buffer) => {
      const room = options.outputBytes - sizes[stream];

      if (room > 0) {
        chunks[stream].push(chunk.length > room ? chunk.subarray(0, room) : chunk);
      }

      sizes[stream] += chunk.length;

      if (sizes[stream] > options.outputBytes && !tooMuchOutput) {
        tooMuchOutput = true;
        killGroup(child.pid);
      }
    };

    // Both are pipes (stdio above)
    child.stdout!.on('data', collect('stdout'));
    child.stderr!.on('data', collect('stderr'));

    const finish = (status: number, extraStderr = '') => {
      clearTimeout(timer);
      resolve({
        status,
        stdout: Buffer.concat(chunks.stdout),
        stderr: Buffer.concat([...chunks.stderr, Buffer.from(extraStderr)]),
        started,
        finished: performance.now() / 1000,
      });
    };

    child.on('error', (error) => finish(127, error.message));
    // Anything the program started dies with it, as in a container. Otherwise
    // a child holding its stdout open would keep the run going.
    child.on('exit', () => killGroup(child.pid));
    child.on('close', (code, signal) => {
      if (timedOut) {
        finish(124);
      } else if (tooMuchOutput) {
        finish(153);
      } else if (signal) {
        finish(128 + (os.constants.signals[signal as keyof typeof os.constants.signals] || 9));
      } else {
        finish(code === null ? 1 : code);
      }
    });
  });

export const runOnSystem = async (
  runtime: LanguageRuntime,
  source: string,
  stdin: string,
  limits: Limits = runtime.limits,
): Promise<RunOutcome> => {
  const problem = await systemProblem(runtime);

  if (problem || !runtime.system) {
    return internalError(problem || '');
  }

  const tools = toolchain();
  // realpath: macOS's temp folder is a symlink, and the program's cwd, HOME
  // and TMPDIR should all name the same place
  const dir = await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(), 'skilled-run-')));

  try {
    await fs.writeFile(path.join(dir, runtime.docker.sourceFile), source);
    await fs.writeFile(path.join(dir, '.stdin'), stdin);

    const outputs = new Map<string, Buffer>();
    const read = (name: string) => outputs.get(name) || null;

    if (runtime.system.compile) {
      const compiled = await runProcess(commandFor(runtime.system.compile, tools, limits), {
        dir,
        wallSeconds: COMPILE_SECONDS,
        outputBytes: limits.maxFileSizeKb * 1024,
      });

      // As in Docker, the compiler's stdout and stderr together
      outputs.set('.compile_output', Buffer.concat([compiled.stdout, compiled.stderr]));

      if (compiled.status !== 0) {
        outputs.set('.compile_status', Buffer.from(String(compiled.status)));
        return outcomeFromOutputs(read, limits);
      }
    }

    const ran = await runProcess(commandFor(runtime.system.run, tools, limits), {
      dir,
      stdinFile: path.join(dir, '.stdin'),
      cpuSeconds: limits.cpuSeconds,
      wallSeconds: limits.wallSeconds,
      outputBytes: limits.maxFileSizeKb * 1024,
    });

    outputs.set('.exit_status', Buffer.from(String(ran.status)));
    outputs.set('.stdout', ran.stdout);
    outputs.set('.stderr', ran.stderr);
    outputs.set('.times', Buffer.from(`${ran.started} ${ran.finished}`));

    return outcomeFromOutputs(read, limits);
  } finally {
    // Best effort: a file left behind mustn't cost the learner their result
    await fs.rm(dir, { recursive: true, force: true }).catch(() => undefined);
  }
};
