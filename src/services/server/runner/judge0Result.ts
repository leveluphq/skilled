import specs from 'content/runnerSpecs.gen';
import { Judge0Callback } from 'services/server/coderunner/judge0/callback';
import { CodingLanguage } from 'utils/constants/lesson';
import { outcomeFromCallback } from './backends/judge0';
import { evaluate } from './evaluate';
import { submissionUpdate } from './finalize';
import { runtimeFor } from './runtimes';

interface Submission {
  id: string;
  code: string;
  language: string;
  lesson: { slug: string };
}

// A new runner submission's result from Judge0, judged against the lesson's
// spec. The program is rebuilt from the saved code, since building it is
// deterministic. Used by the callback and by the refresh route.
export const runnerResultUpdate = (
  submission: Submission,
  nonce: string,
  payload: Judge0Callback,
) => {
  const { slug } = submission.lesson;
  const spec = Object.prototype.hasOwnProperty.call(specs, slug) ? specs[slug] : null;
  const runtime = runtimeFor(submission.language as CodingLanguage);

  if (!spec || !runtime) {
    throw new Error(`No runner for ${slug} in ${submission.language}`);
  }

  const normalized = runtime.normalize(submission.code);
  const program = { runtime, nonce, assembled: runtime.assemble(normalized.code, spec) };
  const outcome = outcomeFromCallback(payload);

  return submissionUpdate(submission.id, outcome, evaluate(spec, program, outcome));
};
