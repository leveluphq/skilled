import { timingSafeEqual } from 'crypto';
import { NextApiRequest } from 'next';
import {
  ExecutionStatus,
  ResultStatus,
  Judge0Status,
  SEPARATOR_STRING,
  isRuntimeError,
} from 'utils/constants/codeRunner';
import { UpdateCodeSubmissionResultsMutationVariables } from 'types/generated/server';

export const CALLBACK_SECRET_QUERY_PARAM = 'callback_secret';

// What Judge0 PUTs to a submission's callback_url. Judge0 always sends the
// callback base64-encoded with its default fields, whatever the submission
// itself asked for.
export interface Judge0Callback {
  token?: string;
  stdout?: string | null;
  stderr?: string | null;
  compile_output?: string | null;
  message?: string | null;
  time?: string | null;
  memory?: number | null;
  status?: { id: number; description: string } | null;
}

interface TestResult {
  passed?: unknown;
}

// Only a string counts: a repeated parameter uses its first value, and anything
// else (such as an object from a crafted query string) is no secret at all.
const getQueryStringValue = (value: unknown) => {
  const first = Array.isArray(value) ? value[0] : value;
  return typeof first === 'string' ? first : '';
};

export const hasValidCallbackSecret = (req: NextApiRequest) => {
  const expected = Buffer.from(process.env.JUDGE0_CALLBACK_SECRET || '');
  const received = Buffer.from(getQueryStringValue(req.query[CALLBACK_SECRET_QUERY_PARAM]));

  return (
    expected.length > 0 &&
    expected.length === received.length &&
    timingSafeEqual(expected, received)
  );
};

// Judge0 can call back before it has a result. Those callbacks carry nothing
// to record and are followed by the real one.
export const isPendingCallback = (payload: Judge0Callback) =>
  payload.status?.id === Judge0Status.InQueue || payload.status?.id === Judge0Status.Processing;

const decode = (value?: string | null) =>
  value ? Buffer.from(value, 'base64').toString('utf8') : undefined;

// The validator prints the separator and then the results JSON as the last
// thing the program does, so the results follow the LAST separator. Taking the
// first would let a program print its own separator and fake a passing run.
const parseStdout = (stdoutDecoded?: string) => {
  if (!stdoutDecoded) {
    return { logs: undefined, results: undefined };
  }

  const separatorIndex = stdoutDecoded.lastIndexOf(SEPARATOR_STRING);

  if (separatorIndex < 0) {
    return { logs: stdoutDecoded.trim(), results: undefined };
  }

  try {
    const parsed = JSON.parse(stdoutDecoded.slice(separatorIndex + SEPARATOR_STRING.length).trim());
    const results: TestResult[] | undefined = Array.isArray(parsed?.results)
      ? parsed.results
      : undefined;

    return { logs: stdoutDecoded.slice(0, separatorIndex).trim(), results };
  } catch (error) {
    // Output after the separator that isn't JSON: show the learner all of it
    return { logs: stdoutDecoded.trim(), results: undefined };
  }
};

// A run passes only if it finished normally and every test reported a strict
// `passed: true`. No tests at all is a failure, not a pass.
const getResultStatus = (statusId: number | undefined, results?: TestResult[]) =>
  statusId === Judge0Status.Accepted &&
  !!results &&
  results.length > 0 &&
  results.every((result) => result?.passed === true)
    ? ResultStatus.Passed
    : ResultStatus.Failed;

// Every status Judge0 can finish with is a result the learner should see. Its
// own failures (internal error, exec format error) and callbacks with no status
// are errors on our side.
const getExecutionStatus = (statusId?: number) =>
  statusId === Judge0Status.Accepted ||
  statusId === Judge0Status.WrongAnswer ||
  statusId === Judge0Status.TimeLimitExceeded ||
  statusId === Judge0Status.CompilationError ||
  isRuntimeError(statusId)
    ? ExecutionStatus.Complete
    : ExecutionStatus.Error;

export const buildSubmissionUpdate = (
  submissionId: string,
  payload: Judge0Callback,
): UpdateCodeSubmissionResultsMutationVariables => {
  const statusId = payload.status?.id;
  const stdoutDecoded = decode(payload.stdout);
  const { logs, results } = parseStdout(stdoutDecoded);

  return {
    id: submissionId,
    time: payload.time,
    memory: payload.memory,
    stdout: payload.stdout,
    stdoutDecoded,
    stderr: payload.stderr,
    stderrDecoded: decode(payload.stderr),
    message: payload.message,
    messageDecoded: decode(payload.message),
    compileOutput: payload.compile_output,
    codeRunnerStatusId: statusId,
    codeRunnerStatusDescription: payload.status?.description,
    executionStatus: getExecutionStatus(statusId),
    resultStatus: getResultStatus(statusId, results),
    results,
    logs,
  };
};
