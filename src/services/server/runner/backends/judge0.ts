import api from 'services/server/coderunner/judge0/api';
import { buildCallbackUrl } from 'services/server/coderunner/judge0';
import { Judge0Callback } from 'services/server/coderunner/judge0/callback';
import { Program } from '../program';

export const NONCE_QUERY_PARAM = 'nonce';

const base64 = (text: string) => Buffer.from(text, 'utf8').toString('base64');

// Submits a program to Judge0, which calls back to the submission's row with
// the result. Returns Judge0's token for the run.
export const submitToJudge0 = async (program: Program, submissionId: string): Promise<string> => {
  const { runtime, limits } = program;

  if (!runtime.judge0) {
    throw new Error(`Judge0 doesn't run ${runtime.language} here; it runs in Docker`);
  }

  const payload: Record<string, unknown> = {
    language_id: runtime.judge0.languageId,
    source_code: base64(program.assembled.source),
    stdin: base64(program.stdin),
    cpu_time_limit: limits.cpuSeconds,
    wall_time_limit: limits.wallSeconds,
    memory_limit: limits.memoryKb,
    // Keeps the callback small; output past it ends the run with SIGXFSZ
    max_file_size: limits.maxFileSizeKb,
    redirect_stderr_to_stdout: false,
    // The JVM, Mono and rustc break under per-process address-space limits
    enable_per_process_and_thread_memory_limit: false,
    callback_url: buildCallbackUrl(submissionId, { [NONCE_QUERY_PARAM]: program.nonce }),
  };

  if (runtime.judge0.compilerOptions) {
    payload.compiler_options = runtime.judge0.compilerOptions;
  }

  if (runtime.judge0.commandLineArguments) {
    payload.command_line_arguments = runtime.judge0.commandLineArguments;
  }

  const result = await api.post('submissions?base64_encoded=true&fields=token', { payload });

  return result.token;
};

// What the refresh route asks Judge0 for: the callback's fields, plus stdin,
// whose first line is the run's nonce
const RESULT_FIELDS = 'stdin,stdout,stderr,compile_output,message,time,memory,status';

// Fetches a run's result from Judge0, for when its callback hasn't arrived.
// Judge0 tokens are UUIDs.
export const fetchFromJudge0 = async (token: string) => {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token)) {
    throw new Error('Not a Judge0 token');
  }

  const result = await api.get(`submissions/${token}?base64_encoded=true&fields=${RESULT_FIELDS}`);
  const stdin = result && result.stdin ? Buffer.from(result.stdin, 'base64').toString('utf8') : '';
  const newline = stdin.indexOf('\n');

  return { payload: result as Judge0Callback, nonce: newline > 0 ? stdin.slice(0, newline) : null };
};

// Turns Judge0's callback body (always base64, with its default fields) into
// the outcome the runner judges
export const outcomeFromCallback = (payload: Judge0Callback) => {
  const decode = (value?: string | null) =>
    value ? Buffer.from(value, 'base64') : Buffer.alloc(0);
  const time = payload.time === null || payload.time === undefined ? null : Number(payload.time);

  return {
    statusId: payload.status ? payload.status.id : 13,
    statusDescription: payload.status ? payload.status.description : 'No status in the callback',
    stdout: decode(payload.stdout),
    stderr: decode(payload.stderr).toString('utf8'),
    compileOutput: decode(payload.compile_output).toString('utf8'),
    message: decode(payload.message).toString('utf8'),
    timeSeconds: time !== null && Number.isFinite(time) ? time : null,
    memoryKb: typeof payload.memory === 'number' ? payload.memory : null,
  };
};
