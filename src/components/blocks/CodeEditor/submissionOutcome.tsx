import * as React from 'react';
import { GetCodeSubmissionByTokenQuery } from 'types/generated/client';
import {
  ExecutionStatus,
  Judge0Status,
  fileHeaderForLanguage,
  isRuntimeError,
} from 'utils/constants/codeRunner';
import { CodingLanguage } from 'utils/constants/lesson';
import decodeBase64 from 'utils/client/decodeBase64';
import { Results, ErrorMessage, CompileError, RunProblem } from './ExecutionResults';
import RunnerResults, { Diagnostic, RunnerResultsData } from './RunnerResults';

type Submission = GetCodeSubmissionByTokenQuery['code_submissions'][0];

interface Outcome {
  element: JSX.Element;
  // A run that should always have produced something to show. Worth reporting.
  isUnexpected?: boolean;
}

// The compiler counts lines from the top of the file it was given, which starts
// with the language's file header (`// @ts-nocheck` for TypeScript). Shift its
// "script.ts(line,column)" positions back so they match the learner's editor.
const toEditorPositions = (output: string, language?: string | null) => {
  const header = fileHeaderForLanguage[language as CodingLanguage] || '';
  const headerLines = header.split('\n').length - 1;

  return output.replace(
    /script\.ts\((\d+),(\d+)\)/g,
    (_match, line, column) => `Line ${Number(line) - headerLines}, column ${column}`,
  );
};

interface Options {
  // Moves the editor to a line the results point at
  onSelectLine?: (line: number, column: number | null) => void;
}

// Decides what the results pane shows for a finished submission
const getSubmissionOutcome = (submission: Submission, options: Options = {}): Outcome => {
  const { results, logs, stderrDecoded, codeRunnerStatusId } = submission;

  // The new runner stores its own result shape, with the reason for any problem
  if (submission.runnerVersion && results && results.version === 2) {
    const runnerResults = results as RunnerResultsData;

    return {
      element: (
        <RunnerResults
          results={runnerResults}
          outsideLogs={logs}
          stderr={stderrDecoded}
          compileOutput={submission.compileOutputDecoded}
          diagnostics={(submission.diagnostics as Diagnostic[] | null) || []}
          onSelectLine={options.onSelectLine}
        />
      ),
      isUnexpected: runnerResults.problem === 'runner_error' || runnerResults.problem === 'anomaly',
    };
  }

  if (submission.executionStatus === ExecutionStatus.Error) {
    return {
      element: (
        <RunProblem
          title="Something went wrong"
          detail="The code runner couldn't run your code. Please try again in a moment."
        />
      ),
      isUnexpected: true,
    };
  }

  if (codeRunnerStatusId === Judge0Status.CompilationError) {
    const output = decodeBase64(submission.compileOutput).trim();

    return { element: <CompileError output={toEditorPositions(output, submission.language)} /> };
  }

  if (Array.isArray(results) && results.length > 0) {
    return { element: <Results results={results} logs={logs} err={stderrDecoded} /> };
  }

  if (stderrDecoded) {
    return { element: <ErrorMessage message={stderrDecoded} logs={logs} /> };
  }

  if (codeRunnerStatusId === Judge0Status.TimeLimitExceeded) {
    return {
      element: (
        // The limit is the cpu_time_limit sent with each submission
        <RunProblem
          title="Time limit exceeded"
          detail="Your code ran for more than 5 seconds without finishing. Look for an infinite loop, or a step that does much more work than it needs to."
          logs={logs}
        />
      ),
    };
  }

  if (isRuntimeError(codeRunnerStatusId)) {
    return {
      element: (
        <RunProblem
          title="Your code crashed"
          detail={
            submission.messageDecoded ||
            submission.codeRunnerStatusDescription ||
            'It stopped before the tests finished.'
          }
          logs={logs}
        />
      ),
    };
  }

  return {
    element: (
      <RunProblem
        title="No test results"
        detail="Your code finished, but no test results came back."
        logs={logs}
      />
    ),
    isUnexpected: true,
  };
};

export default getSubmissionOutcome;
