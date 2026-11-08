import { CodingLanguage } from 'utils/constants/lesson';
import { LessonSpec } from 'utils/shared/runner/types';
import { buildStdin, createNonce } from './protocol';
import { runtimeFor } from './runtimes';
import { Assembled, LanguageRuntime, Limits } from './runtimes/types';

export interface Program {
  runtime: LanguageRuntime;
  assembled: Assembled;
  stdin: string;
  nonce: string;
  limits: Limits;
}

export type BuildResult =
  | { ok: true; program: Program }
  // Problems found before running anything, such as an unsupported language
  | { ok: false; errors: string[] };

export const buildProgram = (
  spec: LessonSpec,
  language: CodingLanguage,
  code: string,
): BuildResult => {
  const runtime = runtimeFor(language);

  if (!runtime) {
    return { ok: false, errors: [`This lesson can't run ${language} code yet`] };
  }

  const normalized = runtime.normalize(code);

  if (normalized.errors.length) {
    return { ok: false, errors: normalized.errors };
  }

  const nonce = createNonce();
  const limits = {
    ...runtime.limits,
    ...(spec.limits && spec.limits.cpuTimeLimit ? { cpuSeconds: spec.limits.cpuTimeLimit } : {}),
  };

  return {
    ok: true,
    program: {
      runtime,
      assembled: runtime.assemble(normalized.code, spec),
      stdin: buildStdin(nonce, spec),
      nonce,
      limits,
    },
  };
};
