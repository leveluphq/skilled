import { createHash } from 'crypto';
import updateCodeSubmissionResults from 'services/server/graphql/mutations/updateCodeSubmissionResults';
import { LessonSpec } from 'utils/shared/runner/types';
import { getRunnerBackend } from 'utils/shared/runner/settings';
import { stringifyJson } from 'utils/shared/runner/values';
import { runInDocker } from './backends/docker';
import { submitToJudge0 } from './backends/judge0';
import { runOnService } from './backends/service';
import { runOnSystem } from './backends/system';
import { evaluate } from './evaluate';
import { submissionUpdate } from './finalize';
import { Program } from './program';

// Stored in the submission's `tests` column, to trace a result to the tests it ran
export const specHash = (spec: LessonSpec) =>
  `spec:${createHash('sha256').update(stringifyJson(spec.tests)).digest('hex').slice(0, 16)}`;

// Runs a saved submission. With Docker, the system runner or the runner
// service the result is written before this returns; with Judge0 it arrives at
// the callback route.
// Returns the token the editor polls with.
export const startRun = async (
  spec: LessonSpec,
  program: Program,
  submissionId: string,
): Promise<string> => {
  const backend = getRunnerBackend();

  if (backend !== 'judge0') {
    const execute = { docker: runInDocker, system: runOnSystem, service: runOnService }[backend];
    const outcome = await execute(
      program.runtime,
      program.assembled.source,
      program.stdin,
      program.limits,
    );
    await updateCodeSubmissionResults(
      submissionUpdate(submissionId, outcome, evaluate(spec, program, outcome)),
    );
    return submissionId;
  }

  return submitToJudge0(program, submissionId);
};
