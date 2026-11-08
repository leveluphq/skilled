import { CodingLanguage } from 'utils/constants/lesson';
import { Judge0Status } from 'utils/constants/codeRunner';
import { LessonSpec } from 'utils/shared/runner/types';
import { runInDocker } from './backends/docker';
import { runOnService } from './backends/service';
import { runOnSystem } from './backends/system';
import { buildProgram, Program } from './program';
import { parseRun } from './protocol';
import { Diagnostic } from './runtimes/types';
import { judgeRun, RunOutcome, RunVerdict } from './verdict';

export interface Evaluation {
  verdict: RunVerdict;
  diagnostics: Diagnostic[];
}

// Turns what a backend reported into results: how each test did, and any
// compile or syntax errors placed on the learner's lines
export const evaluate = (
  spec: LessonSpec,
  program: Pick<Program, 'runtime' | 'assembled' | 'nonce'>,
  outcome: RunOutcome,
): Evaluation => {
  const parsed = parseRun(outcome.stdout, program.nonce, spec.tests.length);
  const verdict = judgeRun(spec, parsed, outcome);
  let diagnostics: Diagnostic[] = [];

  if (outcome.statusId === Judge0Status.CompilationError) {
    diagnostics = program.runtime.diagnostics(outcome.compileOutput, program.assembled, spec);
  } else if (verdict.problem === 'crashed_before_tests') {
    // Interpreted languages report syntax errors when they start, on stderr
    diagnostics = program.runtime.diagnostics(outcome.stderr, program.assembled, spec);
  }

  return { verdict, diagnostics };
};

export type CheckResult =
  | { ok: true; program: Program; outcome: RunOutcome; evaluation: Evaluation }
  | { ok: false; errors: string[] };

// Builds and runs code start to finish: in Docker on this machine, with this
// machine's own Node.js and Python with CONFORMANCE_RUNNER=system, or on the
// runner service with CONFORMANCE_RUNNER=service (to check a deployment)
export const checkProgram = async (
  spec: LessonSpec,
  language: CodingLanguage,
  code: string,
): Promise<CheckResult> => {
  const built = buildProgram(spec, language, code);

  if (!built.ok) {
    return built;
  }

  const { program } = built;
  const execute =
    { service: runOnService, system: runOnSystem }[process.env.CONFORMANCE_RUNNER || ''] ||
    runInDocker;
  const outcome = await execute(
    program.runtime,
    program.assembled.source,
    program.stdin,
    program.limits,
  );

  return { ok: true, program, outcome, evaluation: evaluate(spec, program, outcome) };
};
