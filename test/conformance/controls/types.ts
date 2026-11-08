import { CodingLanguage } from 'utils/constants/lesson';

// One language's control programs for the shared spec in controls.test.ts:
// addNumbers(a, b) in the language's own signature, where the third test
// (a = 7) is the one each program misbehaves on.
export interface LanguageControls {
  name: string;
  language: CodingLanguage;
  correct: string;
  // Throws on the third test
  throwsOnThird: string;
  // Exits the program with status 3 on the third test
  exitsOnThird: string;
  // Loops forever on the third test
  loopsOnThird: string;
  // Writes 'stuck\n' to stderr, then loops forever, on the third test
  writesStderrThenLoops: string;
  // Prints 'debug <a>' in every test, plus a fake result line where it can
  prints: string;
  // A syntax error on line 7
  syntaxErrorOnLine7: string;
  // Optional: a correct solution that reuses the harness's own names
  shadowsHarnessNames?: string;
  // Optional: a correct solution that recurses deeply (20,000 frames in the
  // interpreted languages, 200,000, the deepest a lesson may need, in most others)
  deepRecursion?: string;
  // Optional (TypeScript): a correct solution iterating a Set and a Map
  iteratesSetsAndMaps?: string;
  // Optional: ignores SIGXCPU, then loops forever on the third test, so only
  // the hard CPU limit's SIGKILL stops it; still a time-out
  ignoresCpuSignalThenLoops?: string;
  // Optional (compiled languages): a correct solution missing its last `}`,
  // which must be reported as a missing brace, not as errors in the harness
  missingClosingBrace?: string;
  // Optional (compiled languages): addNumbers with the wrong parameter types,
  // which must be reported as not matching what the tests call
  wrongSignature?: string;
  // The injected isBelow(value) for the second spec, in this language
  // (JavaScript's serves TypeScript)
  injectedBody?: string;
  // countBelow(n), calling isBelow. Where a learner might keep their own
  // stub of isBelow (JavaScript, Python), with one that returns false; in
  // languages where Solution extends the class providing it, a plain call.
  stubsInjected: string;
}
