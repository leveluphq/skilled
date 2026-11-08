import { Judge0Status } from 'utils/constants/codeRunner';
import { LanguageRuntime, Limits } from '../runtimes/types';
import { RunOutcome } from '../verdict';

// What every backend that runs programs in a language image shares: the
// script that compiles and runs inside the container, its environment, and
// reading the files it leaves into an outcome reported the way Judge0 would.
// The local Docker backend and the runner service both use these.

// Runs as .run.sh in the program's folder (SK_DIR, /box by default). SK_PHASE
// is "compile", "run" or "both": a compiler that needs more memory than the
// program may use gets a container of its own.
export const RUN_SCRIPT = `
cd "\${SK_DIR:-/box}"
# Everything the container creates belongs to nobody. On a Linux host that
# includes folders a compiler makes (Kotlin's META-INF), whose files the app
# couldn't delete afterwards unless they're writable by all.
umask 000
# A process limit, where the program has the machine to itself (the runner
# service's one container per run); Docker's --pids-limit does it locally
if [ -n "$SK_NPROC" ]; then
  ulimit -u "$SK_NPROC"
fi
if [ "$SK_PHASE" != run ] && [ -n "$SK_COMPILE" ]; then
  timeout -k 1 "$SK_COMPILE_SECONDS" sh -c "$SK_COMPILE" > .compile_output 2>&1
  status=$?
  if [ "$status" -ne 0 ]; then
    echo "$status" > .compile_status
    exit 0
  fi
fi
if [ "$SK_PHASE" = compile ]; then
  exit 0
fi
# CPU seconds, and output in 512-byte blocks (dash's unit); going over either
# is the same SIGXCPU / SIGXFSZ Judge0 reports. The hard CPU limit is a second
# above the soft one, or the kernel's SIGKILL arrives with the SIGXCPU and a
# time-out looks like running out of memory.
ulimit -H -t "$((SK_CPU_SECONDS + 1))"
ulimit -S -t "$SK_CPU_SECONDS"
ulimit -f "$SK_FILE_BLOCKS"
started=$(date +%s.%N)
# A shell that waits on a program killed by a signal says so ("CPU time limit
# exceeded", "Killed") on its stderr, which Judge0 doesn't. So the program's
# stderr is redirected only inside the shell that execs it.
timeout -k 1 "$SK_WALL_SECONDS" sh -c "exec $SK_RUN 2> .stderr" < .stdin > .stdout
echo $? > .exit_status
finished=$(date +%s.%N)
echo "$started $finished" > .times
`;

export const COMPILE_SECONDS = 30;

// The files the script may leave
export const RUN_OUTPUTS = [
  '.compile_status',
  '.compile_output',
  '.exit_status',
  '.stdout',
  '.stderr',
  '.times',
];

export type Phase = 'compile' | 'run' | 'both';

export const scriptEnv = (
  runtime: LanguageRuntime,
  limits: Limits,
  phase: Phase,
): Record<string, string> => ({
  ...runtime.docker.env,
  HOME: '/tmp',
  SK_PHASE: phase,
  SK_COMPILE: runtime.docker.compile || '',
  SK_COMPILE_SECONDS: String(COMPILE_SECONDS),
  SK_RUN: runtime.docker.run,
  SK_CPU_SECONDS: String(limits.cpuSeconds),
  SK_WALL_SECONDS: String(limits.wallSeconds),
  SK_FILE_BLOCKS: String(limits.maxFileSizeKb * 2),
});

export const internalError = (message: string): RunOutcome => ({
  statusId: Judge0Status.InternalError,
  statusDescription: 'Internal Error',
  stdout: Buffer.alloc(0),
  stderr: '',
  compileOutput: '',
  message,
  timeSeconds: null,
  memoryKb: null,
});

// Exit codes from the container, mapped to Judge0's statuses
export const statusForExit = (code: number): { id: number; description: string } => {
  switch (code) {
    case 0:
      return { id: Judge0Status.Accepted, description: 'Accepted' };
    case 124:
    case 152: // SIGXCPU
      return { id: Judge0Status.TimeLimitExceeded, description: 'Time Limit Exceeded' };
    case 139:
      return { id: Judge0Status.RuntimeErrorSigsegv, description: 'Runtime Error (SIGSEGV)' };
    case 153:
      return { id: Judge0Status.RuntimeErrorSigxfsz, description: 'Runtime Error (SIGXFSZ)' };
    case 136:
      return { id: Judge0Status.RuntimeErrorSigfpe, description: 'Runtime Error (SIGFPE)' };
    case 134:
      return { id: Judge0Status.RuntimeErrorSigabrt, description: 'Runtime Error (SIGABRT)' };
    case 137:
      return { id: Judge0Status.RuntimeErrorOther, description: 'Runtime Error (Other)' };
    default:
      return { id: Judge0Status.RuntimeErrorNzec, description: 'Runtime Error (NZEC)' };
  }
};

// The outcome of a run, from the files the script left. `read` returns a
// file's contents, or null when the script didn't write it.
export const outcomeFromOutputs = (
  read: (name: string) => Buffer | null,
  limits: Limits,
): RunOutcome => {
  const text = (name: string) => (read(name) || Buffer.alloc(0)).toString('utf8');
  const compileStatus = read('.compile_status');

  if (compileStatus) {
    const timedOut = compileStatus.toString().trim() === '124';
    return {
      statusId: Judge0Status.CompilationError,
      statusDescription: 'Compilation Error',
      stdout: Buffer.alloc(0),
      stderr: '',
      compileOutput: timedOut ? 'Compilation time limit exceeded.' : text('.compile_output'),
      message: '',
      timeSeconds: null,
      memoryKb: null,
    };
  }

  const exit = read('.exit_status');

  if (!exit) {
    return internalError('The program did not report how it finished');
  }

  const code = Number(exit.toString().trim());
  const times = text('.times').trim().split(' ');
  const timeSeconds =
    times.length === 2 ? Math.round((Number(times[1]) - Number(times[0])) * 1000) / 1000 : null;
  // A SIGKILL after the CPU limit has passed is the hard CPU limit, or the
  // wall-clock timeout's kill, for a program that ignores SIGXCPU or SIGTERM:
  // a time-out, not running out of memory. (With one CPU, CPU time can't pass
  // wall time.)
  const killedForTime = code === 137 && timeSeconds !== null && timeSeconds >= limits.cpuSeconds;
  const status = killedForTime
    ? { id: Judge0Status.TimeLimitExceeded, description: 'Time Limit Exceeded' }
    : statusForExit(code);

  return {
    statusId: status.id,
    statusDescription: status.description,
    stdout: read('.stdout') || Buffer.alloc(0),
    stderr: text('.stderr'),
    compileOutput: text('.compile_output'),
    message: code === 0 || killedForTime ? '' : `Exited with error status ${code}`,
    timeSeconds: Number.isFinite(timeSeconds as number) ? timeSeconds : null,
    memoryKb: null,
  };
};
