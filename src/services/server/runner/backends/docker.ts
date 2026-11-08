import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';
import { LanguageRuntime, Limits } from '../runtimes/types';
import { RunOutcome } from '../verdict';
import {
  COMPILE_SECONDS,
  Phase,
  RUN_OUTPUTS,
  RUN_SCRIPT,
  internalError,
  outcomeFromOutputs,
  scriptEnv,
} from './runScript';

// Runs a program in a throwaway container from the language's image, and
// reports it the way Judge0 would. This is how the open-source app runs code
// with no Judge0 account, and how the conformance suite checks
// every lesson in every language.
//
// It's a sandbox for a person running their own code on their own machine.
// It is not hardened for running strangers' code on a public server; the
// runner service is (docs/runner-service.md).

interface ProcessResult {
  code: number | null;
  stdout: string;
  stderr: string;
}

const run = (command: string, args: string[], timeoutMs: number): Promise<ProcessResult> =>
  new Promise((resolve) => {
    const child = spawn(command, args);
    let stdout = '';
    let stderr = '';
    const timer = setTimeout(() => child.kill('SIGKILL'), timeoutMs);
    child.stdout.on('data', (chunk) => (stdout += chunk));
    child.stderr.on('data', (chunk) => (stderr += chunk));
    child.on('error', (error) => {
      clearTimeout(timer);
      resolve({ code: null, stdout, stderr: stderr + error.message });
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({ code, stdout, stderr });
    });
  });

const readOptional = async (file: string) => {
  try {
    return await fs.readFile(file);
  } catch (error) {
    return null;
  }
};

// What to tell whoever runs this app when Docker can't start a run. The
// editor shows it in place of a generic error.
const dockerProblem = (stderr: string, image: string) => {
  if (/ENOENT/.test(stderr)) {
    return "Docker isn't installed. Lessons run code in Docker, or JavaScript, TypeScript and Python with this machine's own Node.js and Python (CODE_RUNNER=system): see Run Lesson Code in docs/README.md.";
  }

  if (
    /Cannot connect to the Docker daemon|docker daemon is not running|error during connect|failed to connect to the docker API/i.test(
      stderr,
    )
  ) {
    return "Docker isn't running. Start it, then run your code again (or, for JavaScript, TypeScript and Python, set CODE_RUNNER=system to run code without Docker).";
  }

  if (/Unable to find image|pull access denied|manifest unknown|No such image/i.test(stderr)) {
    return `The Docker image ${image} isn't available. Run \`npm run runner:images\` to build it.`;
  }

  return `Docker could not run the code: ${stderr.trim().slice(0, 500)}`;
};

export const isDockerAvailable = async () =>
  (await run('docker', ['info', '--format', '{{.ServerVersion}}'], 15000)).code === 0;

export const runInDocker = async (
  runtime: LanguageRuntime,
  source: string,
  stdin: string,
  limits: Limits = runtime.limits,
): Promise<RunOutcome> => {
  // realpath: Docker Desktop can only mount the resolved macOS temp directory
  const dir = await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(), 'skilled-run-')));

  try {
    // The container runs as nobody and writes its results here
    await fs.chmod(dir, 0o777);
    await fs.writeFile(path.join(dir, runtime.docker.sourceFile), source);
    await fs.writeFile(path.join(dir, '.stdin'), stdin);
    await fs.writeFile(path.join(dir, '.run.sh'), RUN_SCRIPT);

    const id = path.basename(dir).slice('skilled-run-'.length).toLowerCase();
    const { docker } = runtime;
    const separateCompile = !!docker.compile && !!docker.compileMemoryKb;
    const container = (phase: Phase) => {
      const compiling = phase === 'compile';
      const memoryKb = compiling ? (docker.compileMemoryKb as number) : limits.memoryKb;
      const env = scriptEnv(runtime, limits, phase);

      return [
        'run',
        '--rm',
        // Images come from `npm run runner:images`, never from a pull mid-run
        '--pull',
        'never',
        '--name',
        `skilled-${phase}-${id}`,
        '--network',
        'none',
        '--cpus',
        compiling ? '2' : '1',
        '--memory',
        `${memoryKb}k`,
        '--memory-swap',
        `${memoryKb}k`,
        '--pids-limit',
        compiling ? '512' : '256',
        '--read-only',
        '--tmpfs',
        '/tmp:rw,exec,size=512m',
        '--user',
        '65534:65534',
        '--cap-drop',
        'ALL',
        '--security-opt',
        'no-new-privileges',
        ...Object.entries(env).reduce<string[]>(
          (all, [key, value]) => all.concat('-e', `${key}=${value}`),
          [],
        ),
        '-v',
        `${dir}:/box`,
        '-w',
        '/box',
        docker.image,
        'sh',
        '/box/.run.sh',
      ];
    };
    const runContainer = async (phase: Phase) => {
      const seconds =
        (phase === 'run' ? 0 : COMPILE_SECONDS) + (phase === 'compile' ? 0 : limits.wallSeconds);
      const result = await run('docker', container(phase), (seconds + 30) * 1000);

      if (result.code !== 0) {
        await run('docker', ['rm', '--force', `skilled-${phase}-${id}`], 15000);
      }

      return result;
    };

    let finished = await runContainer(separateCompile ? 'compile' : 'both');

    if (
      finished.code === 0 &&
      separateCompile &&
      !(await readOptional(path.join(dir, '.compile_status')))
    ) {
      finished = await runContainer('run');
    }

    if (finished.code !== 0) {
      return internalError(dockerProblem(finished.stderr, docker.image));
    }

    const outputs = new Map<string, Buffer | null>();
    for (const name of RUN_OUTPUTS) {
      outputs.set(name, await readOptional(path.join(dir, name)));
    }

    return outcomeFromOutputs((name) => outputs.get(name) || null, limits);
  } finally {
    // Best effort: a file left behind mustn't cost the learner their result
    await fs.rm(dir, { recursive: true, force: true }).catch(() => undefined);
  }
};
