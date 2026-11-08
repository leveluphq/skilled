import { CodingLanguage, LanguageName } from 'utils/constants/lesson';

// Where code runs, and which lessons use the new runner. next.config.js passes
// both settings to the browser (without any secret), so the editor can tell
// whether a lesson's tests come from the server.

//   docker   on this machine, in Docker (a fresh clone's default, D10)
//   system   on this machine, with its own Node.js and Python, for
//            JavaScript, TypeScript and Python without Docker (D14). No
//            sandbox, so only for a copy of the app at localhost
//   service  on the runner service at RUNNER_SERVICE_URL: Cloudflare
//            Containers for the website (D11), or any host of the same API
//            (docs/runner-service.md)
//   judge0   on Judge0, the website's bridge for JavaScript, TypeScript and Python
export type RunnerBackend = 'judge0' | 'docker' | 'system' | 'service';

// CODE_RUNNER picks the backend. Without it, a server that has a Judge0 key
// uses Judge0, and anything else (a fresh clone, say) runs code locally in
// Docker.
export const getRunnerBackend = (): RunnerBackend => {
  const setting = process.env.CODE_RUNNER;

  if (setting === 'docker' || setting === 'judge0' || setting === 'system' || setting === 'service') {
    return setting;
  }

  return process.env.JUDGE0_API_KEY ? 'judge0' : 'docker';
};

// Whether a lesson with a spec runs on the new runner. Docker runs nothing
// else. On Judge0 the website moves over lesson by lesson: RUNNER_V2_LESSONS is
// "all" or a comma-separated list of slugs, and lessons not in it keep the old
// runner.
export const usesNewRunner = (slug: string, hasSpec: boolean) => {
  if (!hasSpec) {
    return false;
  }

  // Docker, the system runner and the runner service run nothing else
  if (getRunnerBackend() !== 'judge0') {
    return true;
  }

  const setting = (process.env.RUNNER_V2_LESSONS || '').trim();

  return (
    setting === 'all' ||
    setting
      .split(',')
      .map((item) => item.trim())
      .includes(slug)
  );
};

// Judge0, the website's bridge, runs only these; every language runs in Docker
export const JUDGE0_LANGUAGES = [
  CodingLanguage.Javascript,
  CodingLanguage.Typescript,
  CodingLanguage.Python,
];

// The system runner runs only these, with this machine's Node.js and Python.
// A test keeps it in step with the runtimes that have a `system` entry.
export const SYSTEM_LANGUAGES = [
  CodingLanguage.Javascript,
  CodingLanguage.Typescript,
  CodingLanguage.Python,
];

// The languages learners can pick, given where code runs
export const runnableLanguages = (languages: CodingLanguage[]) => {
  const backend = getRunnerBackend();

  if (backend === 'judge0') {
    return languages.filter((language) => JUDGE0_LANGUAGES.includes(language));
  }

  if (backend === 'system') {
    return languages.filter((language) => SYSTEM_LANGUAGES.includes(language));
  }

  return languages;
};

// Why a lesson can't run code in a language here, for the editor and the run
// route. On the system runner the other languages need Docker; elsewhere the
// lesson doesn't have the language yet.
export const unavailableMessage = (language: CodingLanguage) =>
  getRunnerBackend() === 'system' && !SYSTEM_LANGUAGES.includes(language)
    ? `${LanguageName[language]} runs only in Docker. With CODE_RUNNER=system, this app runs JavaScript, TypeScript and Python.`
    : `This lesson isn't available in ${LanguageName[language]} yet.`;
