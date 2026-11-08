import { CodingLanguage } from 'utils/constants/lesson';
import api from './api';
import { CALLBACK_SECRET_QUERY_PARAM } from './callback';

const MAX_WAIT_TIME_SECONDS = 5;
export const CALLBACK_PATH = '/api/v1/judge0/callback';

// Judge0 calls back over the public internet, so the base URL must be one it
// can reach. JUDGE0_CALLBACK_BASE_URL overrides ROOT_URL for local development,
// where it points at a tunnel (ngrok or similar) to localhost.
const getCallbackBaseUrl = () => {
  const baseUrl = process.env.JUDGE0_CALLBACK_BASE_URL || process.env.ROOT_URL;

  if (!baseUrl) {
    throw new Error('ROOT_URL environment variable is required to receive Judge0 callbacks');
  }

  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(baseUrl)) {
    throw new Error(
      'Judge0 cannot call back to localhost. Set JUDGE0_CALLBACK_BASE_URL to a public tunnel URL for this server.',
    );
  }

  return baseUrl.replace(/\/+$/, '');
};

// `extraParams` carry what the callback needs to read the result (the new
// runner's nonce); Judge0 already sees them in the submission
export const buildCallbackUrl = (submissionId: string, extraParams: Record<string, string> = {}) => {
  const callbackSecret = process.env.JUDGE0_CALLBACK_SECRET;

  if (!callbackSecret) {
    throw new Error(
      'JUDGE0_CALLBACK_SECRET environment variable is required to secure Judge0 callbacks'
    );
  }

  const callbackParams = new URLSearchParams({ ...extraParams, [CALLBACK_SECRET_QUERY_PARAM]: callbackSecret });

  return `${getCallbackBaseUrl()}${CALLBACK_PATH}/${encodeURIComponent(submissionId)}?${callbackParams.toString()}`;
};

// The languages the legacy runner sends to Judge0
export const mapLanguageToId: Partial<Record<CodingLanguage, number>> = {
  [CodingLanguage.Javascript]: 63,
  [CodingLanguage.Typescript]: 74,
  [CodingLanguage.Python]: 71,
  // [CodingLanguage.Java]: 62,
};

// Judge0 compiles TypeScript as `tsc <compiler_options> script.ts`. With no
// options, tsc 3.7 targets ES3, where for...of over a Set or Map compiles to a
// loop that never runs. It also loads the DOM types, whose `Node` collides with
// the `Node` class the linked-list lessons declare. That error is reported in
// lib.dom.d.ts, which the file's `// @ts-nocheck` can't reach, so the
// submission fails to compile.
export const compilerOptionsForLanguage: Partial<Record<CodingLanguage, string>> = {
  [CodingLanguage.Typescript]: '--target ES2017 --lib ES2017',
};

// The callback is addressed to the submission row, so the result is written to
// the right row however early it arrives.
export const executeCodeSubmission = async (
  code: string,
  language: CodingLanguage,
  submissionId: string,
) => {
  const languageId = mapLanguageToId[language];
  const compilerOptions = compilerOptionsForLanguage[language];
  const result = await api.post('submissions?base64_encoded=false&fields=*', {
    payload: {
      language_id: languageId,
      source_code: code,
      cpu_time_limit: MAX_WAIT_TIME_SECONDS,
      callback_url: buildCallbackUrl(submissionId),
      ...(typeof compilerOptions === 'string' && { compiler_options: compilerOptions }),
    },
  });
  return result;
};

export const getCodeSubmission = async (token: string) => {
  const result = await api.get(`submissions/${token}?base64_encoded=false&fields=*`);
  return result;
};
