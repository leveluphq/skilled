import * as React from 'react';
import { Checkmark16, Close16 } from '@carbon/icons-react';
import { formatValue } from 'utils/shared/runner/values';
import { ResultItem, ResultText, AnswerText, OutputText, LineButton } from './styles';

// Results from the new code runner (submissions with a runnerVersion). Rows
// from the old runner render with Results in ExecutionResults instead.

export type TestStatus = 'passed' | 'failed' | 'error' | 'timeout' | 'crashed' | 'not_run';

export interface RunnerTest {
  description: string;
  status: TestStatus;
  expected: unknown;
  actual?: unknown;
  error?: string;
  logs: string;
  ms: number | null;
}

export interface RunnerResultsData {
  version: 2;
  tests: RunnerTest[];
  problem: string | null;
  problemDetail: string | null;
}

export interface Diagnostic {
  line: number | null;
  column: number | null;
  message: string;
}

const STATUS_TEXT: Record<TestStatus, string> = {
  passed: 'passed',
  failed: 'failed',
  error: 'error',
  timeout: 'ran out of time',
  crashed: 'crashed',
  not_run: 'not run',
};

// What a run-level problem means, in plain words
const PROBLEMS: Record<string, { title: string; detail?: string }> = {
  crashed_before_tests: { title: 'Your code crashed before the tests ran' },
  timed_out: {
    title: 'Time limit exceeded',
    detail:
      'A test ran out of time. Look for an infinite loop, or a step that does much more work than it needs to.',
  },
  out_of_memory: { title: 'Your code ran out of memory' },
  output_limit: { title: 'Your code printed too much output' },
  crashed: { title: 'Your code crashed' },
  exited_early: {
    title: 'Your code stopped before all the tests finished',
    detail: 'Check for a call that exits the program.',
  },
  anomaly: { title: "The test results couldn't be read" },
  runner_error: {
    title: 'Something went wrong',
    detail: "The code runner couldn't run your code. Please try again in a moment.",
  },
};

const short = (value: unknown) => {
  const text = formatValue(value);
  return text.length > 2000 ? `${text.slice(0, 2000)}…` : text;
};

export const Diagnostics = ({
  diagnostics,
  onSelectLine,
}: {
  diagnostics: Diagnostic[];
  onSelectLine?: (line: number, column: number | null) => void;
}) => (
  <ul>
    {diagnostics.map((diagnostic, i) => (
      <li key={i}>
        {diagnostic.line !== null && onSelectLine ? (
          <LineButton onClick={() => onSelectLine(diagnostic.line as number, diagnostic.column)}>
            Line {diagnostic.line}
            {diagnostic.column !== null ? `, column ${diagnostic.column}` : ''}
          </LineButton>
        ) : diagnostic.line !== null ? (
          <strong>Line {diagnostic.line}</strong>
        ) : null}
        {diagnostic.line !== null ? ': ' : ''}
        {diagnostic.message}
      </li>
    ))}
  </ul>
);

interface Props {
  results: RunnerResultsData;
  outsideLogs?: string | null;
  stderr?: string | null;
  compileOutput?: string | null;
  diagnostics?: Diagnostic[] | null;
  onSelectLine?: (line: number, column: number | null) => void;
}

const RunnerResults: React.FC<Props> = ({
  results,
  outsideLogs,
  stderr,
  compileOutput,
  diagnostics,
  onSelectLine,
}) => {
  const placed = diagnostics || [];

  if (results.problem === 'compile_error') {
    return (
      <>
        <p>Your code didn't compile:</p>
        {/* The compiler's own output counts lines from the top of the whole
            program, so it's only shown when none of it could be placed */}
        {placed.length ? (
          <Diagnostics diagnostics={placed} onSelectLine={onSelectLine} />
        ) : compileOutput ? (
          <OutputText>{compileOutput.trim()}</OutputText>
        ) : null}
      </>
    );
  }

  const problem = results.problem
    ? PROBLEMS[results.problem] || { title: 'Your code stopped' }
    : null;
  // Running locally (in Docker, or with the system runner), whoever sees this
  // runs the app too, so say what went wrong (Docker isn't running, Python
  // isn't installed). Judge0's errors mean nothing to a learner.
  const runsLocally = process.env.CODE_RUNNER === 'docker' || process.env.CODE_RUNNER === 'system';
  const detail =
    results.problem === 'runner_error' && runsLocally
      ? results.problemDetail || (problem && problem.detail)
      : (problem && problem.detail) || results.problemDetail;

  return (
    <>
      {problem && (
        <>
          <p>
            <strong>{problem.title}</strong>
          </p>
          {detail && <p>{detail}</p>}
          {placed.length ? <Diagnostics diagnostics={placed} onSelectLine={onSelectLine} /> : null}
          {results.problem === 'crashed_before_tests' && stderr ? (
            <OutputText>{stderr.trim()}</OutputText>
          ) : null}
        </>
      )}
      {!!outsideLogs && <OutputText>{outsideLogs}</OutputText>}
      <ol>
        {results.tests.map((test, i) => (
          <ResultItem key={`${i}-${test.description}`} passed={test.status === 'passed'}>
            <ResultText>
              {test.description} {' ----- '}
              {STATUS_TEXT[test.status]} {test.status === 'passed' ? <Checkmark16 /> : <Close16 />}
            </ResultText>
            {test.status === 'failed' && (
              <AnswerText>
                <div>Your Answer: {short(test.actual)}</div>
                <div>Expected: {short(test.expected)}</div>
              </AnswerText>
            )}
            {/* The test the program stopped in carries the run's explanation, shown above */}
            {test.error && test.status !== 'passed' && test.error !== results.problemDetail && (
              <AnswerText>{test.error}</AnswerText>
            )}
            {!!test.logs && <OutputText>{test.logs}</OutputText>}
          </ResultItem>
        ))}
      </ol>
      {results.problem !== 'crashed_before_tests' && stderr ? (
        <OutputText>{stderr.trim()}</OutputText>
      ) : null}
    </>
  );
};

export default RunnerResults;
