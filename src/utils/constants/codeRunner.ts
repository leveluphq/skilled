import { CodingLanguage } from 'utils/constants/lesson';

export enum ExecutionStatus {
  Executing = 'EXECUTING',
  Error = 'ERROR',
  Complete = 'COMPLETE',
  NoResponse = 'NO_RESPONSE',
}

export enum ResultStatus {
  Passed = 'PASSED',
  Failed = 'FAILED',
}

// Judge0's submission statuses (GET /statuses). 7 to 12 are the runtime errors.
export enum Judge0Status {
  InQueue = 1,
  Processing = 2,
  Accepted = 3,
  WrongAnswer = 4,
  TimeLimitExceeded = 5,
  CompilationError = 6,
  RuntimeErrorSigsegv = 7,
  RuntimeErrorSigxfsz = 8,
  RuntimeErrorSigfpe = 9,
  RuntimeErrorSigabrt = 10,
  RuntimeErrorNzec = 11,
  RuntimeErrorOther = 12,
  InternalError = 13,
  ExecFormatError = 14,
}

export const isRuntimeError = (statusId?: number | null) =>
  !!statusId && statusId >= Judge0Status.RuntimeErrorSigsegv && statusId <= Judge0Status.RuntimeErrorOther;

export const SEPARATOR_STRING = '<---+++ CODE RESULT +++--->';

export const JAVASCRIPT_VALIDATOR = `
const items = tests.map(test => validate(test));
const results = { results: items };
console.log("${SEPARATOR_STRING}");
console.log(JSON.stringify(results));`;

export const PYTHON_VALIDATOR = `
import json
runtests()
results = { 'results': test_results }
print("${SEPARATOR_STRING}")
print(json.dumps(results))
`;

// The legacy runner only runs JavaScript, TypeScript and Python
export const validatorForLanguage: Partial<Record<CodingLanguage, string>> = {
  [CodingLanguage.Javascript]: JAVASCRIPT_VALIDATOR,
  [CodingLanguage.Typescript]: JAVASCRIPT_VALIDATOR,
  [CodingLanguage.Python]: PYTHON_VALIDATOR,
};

export const fileHeaderForLanguage: Partial<Record<CodingLanguage, string>> = {
  [CodingLanguage.Javascript]: '',
  [CodingLanguage.Typescript]: '// @ts-nocheck\n',
  [CodingLanguage.Python]: '',
};
