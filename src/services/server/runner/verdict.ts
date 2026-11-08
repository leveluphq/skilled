import { Judge0Status } from 'utils/constants/codeRunner';
import { compareOutput } from 'utils/shared/runner/compare';
import { LessonSpec } from 'utils/shared/runner/types';
import { ParsedRun } from './protocol';

// What an execution backend reports for one run. Both backends use Judge0's
// status ids, so everything after this point is shared.
export interface RunOutcome {
  statusId: number;
  statusDescription: string;
  stdout: Buffer;
  stderr: string;
  compileOutput: string;
  // Judge0's own explanation, such as "Exited with error status 139"
  message: string;
  timeSeconds: number | null;
  memoryKb: number | null;
}

export type TestStatus = 'passed' | 'failed' | 'error' | 'timeout' | 'crashed' | 'not_run';

export interface TestVerdict {
  description: string;
  status: TestStatus;
  expected: unknown;
  actual?: unknown;
  error?: string;
  logs: string;
  ms: number | null;
}

export type RunProblem =
  | 'compile_error'
  | 'crashed_before_tests'
  | 'timed_out'
  | 'out_of_memory'
  | 'output_limit'
  | 'crashed'
  | 'exited_early'
  | 'anomaly'
  | 'runner_error';

export interface RunVerdict {
  passed: boolean;
  tests: TestVerdict[];
  // Set when something went wrong outside a single test, with a readable reason
  problem: RunProblem | null;
  problemDetail: string | null;
  // Printed outside any test (top-level code)
  outsideLogs: string;
  stderr: string;
}

// Judge0 only reports exit codes inside `message`
const exitCodeFrom = (message: string): number | null => {
  const status = /exited with error status (\d+)/i.exec(message);
  if (status) {
    return Number(status[1]);
  }
  const signal = /signal (\d+)/i.exec(message);
  return signal ? 128 + Number(signal[1]) : null;
};

const describeCrash = (outcome: RunOutcome): { problem: RunProblem; detail: string } => {
  const code = exitCodeFrom(outcome.message);
  const stderr = outcome.stderr;

  if (outcome.statusId === Judge0Status.TimeLimitExceeded) {
    return { problem: 'timed_out', detail: 'Time limit exceeded' };
  }
  if (outcome.statusId === Judge0Status.RuntimeErrorSigxfsz || code === 153) {
    return { problem: 'output_limit', detail: 'Your code printed too much output' };
  }
  if (code === 137) {
    return { problem: 'out_of_memory', detail: 'Your code ran out of memory' };
  }
  if (
    /has overflowed its stack|stack overflow|StackOverflowError|maximum recursion depth/i.test(
      stderr,
    )
  ) {
    return { problem: 'crashed', detail: 'Stack overflow: the recursion went too deep' };
  }
  if (outcome.statusId === Judge0Status.RuntimeErrorSigsegv || code === 139) {
    return {
      problem: 'crashed',
      detail: 'Segmentation fault (an invalid memory access, or recursion that went too deep)',
    };
  }
  if (outcome.statusId === Judge0Status.RuntimeErrorSigfpe || code === 136) {
    return { problem: 'crashed', detail: 'Arithmetic error, such as dividing by zero' };
  }
  if (outcome.statusId === Judge0Status.RuntimeErrorSigabrt || code === 134) {
    return { problem: 'crashed', detail: 'The program aborted' };
  }
  if (code !== null && code !== 0) {
    return { problem: 'crashed', detail: `Exited with error status ${code}` };
  }
  return {
    problem: 'crashed',
    detail: outcome.message || outcome.statusDescription || 'The program stopped',
  };
};

export const judgeRun = (spec: LessonSpec, parsed: ParsedRun, outcome: RunOutcome): RunVerdict => {
  const base = {
    outsideLogs: parsed.outsideLogs,
    stderr: outcome.stderr,
  };

  const notRun = (): TestVerdict[] =>
    spec.tests.map((test) => ({
      description: test.description,
      status: 'not_run' as const,
      expected: test.expected,
      logs: '',
      ms: null,
    }));

  if (outcome.statusId === Judge0Status.CompilationError) {
    return {
      ...base,
      passed: false,
      tests: notRun(),
      problem: 'compile_error',
      problemDetail: outcome.compileOutput,
    };
  }

  if (
    outcome.statusId === Judge0Status.InternalError ||
    outcome.statusId === Judge0Status.ExecFormatError
  ) {
    return {
      ...base,
      passed: false,
      tests: notRun(),
      problem: 'runner_error',
      problemDetail: outcome.message || outcome.statusDescription,
    };
  }

  const finishedNormally = outcome.statusId === Judge0Status.Accepted;
  const crash = finishedNormally ? null : describeCrash(outcome);

  const tests = spec.tests.map((test, i): TestVerdict => {
    const ran = parsed.tests[i];
    const shared = { description: test.description, expected: test.expected, logs: ran.logs };

    if (ran.result && ran.result.ok) {
      const args = spec.kind === 'function' ? spec.tests[i].args : [];
      const passed = compareOutput(spec.compare, ran.result.out, test.expected, args as unknown[]);
      return {
        ...shared,
        status: passed ? 'passed' : 'failed',
        actual: ran.result.out,
        ms: ran.result.ms,
      };
    }

    if (ran.result) {
      return { ...shared, status: 'error', error: ran.result.error, ms: ran.result.ms };
    }

    if (ran.started) {
      // The test that was running when the program stopped
      return {
        ...shared,
        status: crash && crash.problem === 'timed_out' ? 'timeout' : 'crashed',
        error: crash ? crash.detail : 'The program stopped during this test',
        ms: null,
      };
    }

    return { ...shared, status: 'not_run', ms: null };
  });

  let problem: RunProblem | null = null;
  let problemDetail: string | null = null;

  if (parsed.anomalies.length) {
    problem = 'anomaly';
    problemDetail = parsed.anomalies[0];
  } else if (!parsed.tests.some((test) => test.started)) {
    problem = crash && crash.problem === 'timed_out' ? 'timed_out' : 'crashed_before_tests';
    problemDetail = crash ? crash.detail : 'Your code stopped the program before any test ran';
  } else if (crash) {
    problem = crash.problem;
    problemDetail = crash.detail;
  } else if (!parsed.done) {
    problem = 'exited_early';
    problemDetail = 'The program exited before all the tests finished';
  }

  const passed =
    problem === null && tests.length > 0 && tests.every((test) => test.status === 'passed');

  return { ...base, passed, tests, problem, problemDetail };
};
