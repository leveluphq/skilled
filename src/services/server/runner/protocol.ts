import { randomBytes } from 'crypto';
import { LessonSpec } from 'utils/shared/runner/types';
import { parseJson, stringifyJson } from 'utils/shared/runner/values';

// The runner protocol (docs/adding-a-language.md, "The harness contract").
//
// stdin:   NONCE\n{"tests":[{"args":[...],"hidden":[...]} | {"ctorArgs":[...],"ops":[...]}, ...]}
// stdout:  NONCE{"t":"start","i":0}
//          <anything the user prints, which is test 0's logs>
//          NONCE{"t":"result","i":0,"ok":true,"out":<json>,"ms":1.2}
//          NONCE{"t":"result","i":1,"ok":false,"error":"...","ms":0.3}
//          NONCE{"t":"done"}
//
// The nonce stops a printed line being mistaken for the harness's own. It
// doesn't make results tamper-proof (a determined program can read it), which
// is fine while passing gates nothing.

export const createNonce = () => randomBytes(16).toString('hex');

export const buildStdin = (nonce: string, spec: LessonSpec) => {
  const tests =
    spec.kind === 'function'
      ? spec.tests.map((test) => ({ args: test.args, hidden: test.hidden || [] }))
      : spec.tests.map((test) => ({ ctorArgs: test.ctorArgs || [], ops: test.ops }));

  return `${nonce}\n${stringifyJson({ tests })}\n`;
};

export type TestResult =
  { ok: true; out: unknown; ms: number | null } | { ok: false; error: string; ms: number | null };

export interface ParsedTest {
  started: boolean;
  result: TestResult | null;
  // What the program printed while this test ran
  logs: string;
}

export interface ParsedRun {
  tests: ParsedTest[];
  // Printed before the first test started (top-level code) or after the last
  // harness line
  outsideLogs: string;
  done: boolean;
  // Harness lines out of sequence. A run with any can't pass.
  anomalies: string[];
}

const MAX_LOGS_PER_TEST = 64 * 1024;

const appendLog = (current: string, text: string) => {
  if (current.length >= MAX_LOGS_PER_TEST) {
    return current;
  }
  const next = current + text;
  return next.length > MAX_LOGS_PER_TEST
    ? `${next.slice(0, MAX_LOGS_PER_TEST)}\n… (output truncated)`
    : next;
};

interface HarnessLine {
  t?: unknown;
  i?: unknown;
  ok?: unknown;
  out?: unknown;
  error?: unknown;
  ms?: unknown;
}

export const parseRun = (stdout: Buffer | string, nonce: string, testCount: number): ParsedRun => {
  const run: ParsedRun = {
    tests: Array.from({ length: testCount }, () => ({ started: false, result: null, logs: '' })),
    outsideLogs: '',
    done: false,
    anomalies: [],
  };
  const bytes = typeof stdout === 'string' ? Buffer.from(stdout, 'utf8') : stdout;
  let current = -1;
  let lineStart = 0;

  const log = (text: string) => {
    if (current >= 0 && !run.done) {
      run.tests[current].logs = appendLog(run.tests[current].logs, text);
    } else {
      run.outsideLogs = appendLog(run.outsideLogs, text);
    }
  };

  const handle = (line: string, hasNewline: boolean) => {
    const at = line.indexOf(nonce);

    if (at < 0) {
      log(hasNewline ? `${line}\n` : line);
      return;
    }

    // A print with no newline puts the user's text in front of the harness line
    if (at > 0) {
      log(line.slice(0, at));
    }

    let message: HarnessLine;

    try {
      message = parseJson(line.slice(at + nonce.length)) as HarnessLine;
    } catch (error) {
      run.anomalies.push('The harness wrote a line that could not be read');
      return;
    }

    if (run.done) {
      run.anomalies.push('Output continued after the tests finished');
      return;
    }

    const i = message.i;

    if (message.t === 'done') {
      run.done = true;
      current = -1;
    } else if (message.t === 'start') {
      if (
        i !== current + 1 ||
        typeof i !== 'number' ||
        i >= testCount ||
        (current >= 0 && !run.tests[current].result)
      ) {
        run.anomalies.push(`Test ${String(i)} started out of order`);
        return;
      }
      current = i;
      run.tests[i].started = true;
    } else if (message.t === 'result') {
      if (i !== current || current < 0 || run.tests[current].result) {
        run.anomalies.push(`A result for test ${String(i)} arrived out of order`);
        return;
      }
      const ms = typeof message.ms === 'number' ? message.ms : null;
      run.tests[current].result =
        message.ok === true
          ? { ok: true, out: message.out === undefined ? null : message.out, ms }
          : {
              ok: false,
              error: typeof message.error === 'string' ? message.error : 'Unknown error',
              ms,
            };
    } else {
      run.anomalies.push('The harness wrote a line of an unknown kind');
    }
  };

  for (let index = 0; index < bytes.length; index++) {
    if (bytes[index] === 0x0a) {
      // toString('utf8') replaces invalid bytes rather than throwing
      handle(bytes.slice(lineStart, index).toString('utf8'), true);
      lineStart = index + 1;
    }
  }

  if (lineStart < bytes.length) {
    handle(bytes.slice(lineStart).toString('utf8'), false);
  }

  return run;
};
