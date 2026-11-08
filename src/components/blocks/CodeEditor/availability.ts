import lessonLanguages from 'content/lessonLanguages.gen';
import specs from 'content/runnerSpecs.gen';
import { CodingLanguage } from 'utils/constants/lesson';
import { runnableLanguages, usesNewRunner } from 'utils/shared/runner/settings';

// Whether a lesson on the new runner can't run code in a language yet: it
// lacks starter code or a reference solution in it, or this server's code
// runner (Judge0) doesn't support it
export const isUnavailableIn = (slug: string | undefined, language: CodingLanguage) =>
  !!slug &&
  Object.prototype.hasOwnProperty.call(specs, slug) &&
  usesNewRunner(slug, true) &&
  !runnableLanguages(lessonLanguages[slug] || []).includes(language);
