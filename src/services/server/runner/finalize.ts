import { ExecutionStatus, ResultStatus } from 'utils/constants/codeRunner';
import { UpdateCodeSubmissionResultsMutationVariables } from 'types/generated/server';
import { Evaluation } from './evaluate';
import { RunOutcome, RunProblem, TestVerdict } from './verdict';

// What the new runner stores in code_submissions.results. Rows from the old
// runner hold a plain array instead, and have no runnerVersion.
export interface RunnerResults {
  version: 2;
  tests: TestVerdict[];
  problem: RunProblem | null;
  problemDetail: string | null;
}

const MAX_TEXT = 64 * 1024;

const cap = (text: string) =>
  text.length > MAX_TEXT ? `${text.slice(0, MAX_TEXT)}\n… (truncated)` : text;

// Every column is written, because Hasura sets any column whose variable is
// missing to null (see updateCodeSubmissionResults)
export const submissionUpdate = (
  submissionId: string,
  outcome: RunOutcome,
  evaluation: Evaluation,
): UpdateCodeSubmissionResultsMutationVariables => {
  const { verdict, diagnostics } = evaluation;
  const results: RunnerResults = {
    version: 2,
    tests: verdict.tests.map((test) => ({ ...test, logs: cap(test.logs) })),
    problem: verdict.problem,
    problemDetail: verdict.problemDetail === null ? null : cap(verdict.problemDetail),
  };

  return {
    id: submissionId,
    executionStatus:
      verdict.problem === 'runner_error' ? ExecutionStatus.Error : ExecutionStatus.Complete,
    resultStatus: verdict.passed ? ResultStatus.Passed : ResultStatus.Failed,
    results,
    logs: cap(verdict.outsideLogs),
    stderrDecoded: cap(verdict.stderr),
    compileOutputDecoded: cap(outcome.compileOutput),
    diagnostics,
    codeRunnerStatusId: outcome.statusId,
    codeRunnerStatusDescription: outcome.statusDescription,
    message: outcome.message,
    messageDecoded: outcome.message,
    time: outcome.timeSeconds === null ? null : String(outcome.timeSeconds),
    memory: outcome.memoryKb,
    // The raw streams carry the harness protocol (and its nonce); the decoded
    // columns above are what the learner sees
    stdout: null,
    stdoutDecoded: null,
    stderr: null,
    compileOutput: null,
  };
};
