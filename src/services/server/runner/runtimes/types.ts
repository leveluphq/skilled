import { CodingLanguage } from 'utils/constants/lesson';
import { LessonSpec } from 'utils/shared/runner/types';

// A compile error or crash located in the learner's code. `line` is the line
// in their editor, or null when the error isn't in their code.
export interface Diagnostic {
  line: number | null;
  column: number | null;
  message: string;
}

export interface Limits {
  cpuSeconds: number;
  wallSeconds: number;
  memoryKb: number;
  // Judge0 output cap; keeps callbacks small
  maxFileSizeKb: number;
}

export interface Judge0Settings {
  languageId: number;
  compilerOptions?: string;
  commandLineArguments?: string;
}

// How the docker backend compiles and runs a program
export interface DockerSettings {
  image: string;
  // Name of the source file inside the container's working directory
  sourceFile: string;
  // Shell commands, run in the working directory. `run` must be a single
  // command, as the Docker backend execs it.
  compile?: string;
  run: string;
  // Compile in a container of its own with this much memory, for compilers
  // that need more than the program may use (the JVM, swiftc, rustc)
  compileMemoryKb?: number;
  // Environment for both steps. HOME is /tmp, the only writable place
  // besides the working directory.
  env?: Record<string, string>;
}

// How the system backend compiles and runs a program with this machine's own
// toolchain (CODE_RUNNER=system), for the languages it supports. Each command
// is an argument list, run in the program's folder on the file named by
// `docker.sourceFile`. {node}, {tsc} and {python} stand for the toolchain the
// backend finds, and {memoryMb} for the run's memory limit
// (backends/system.ts).
export interface SystemSettings {
  compile?: string[];
  run: string[];
}

export interface Assembled {
  source: string;
  // Lines of the learner's code, after normalizing
  userLines: number;
  // File line of the learner's line 1, minus one (a file header shifts it)
  lineOffset: number;
}

export interface LanguageRuntime {
  language: CodingLanguage;
  // Bumped whenever the prelude or driver changes, and stored with each
  // submission, so a result can be traced to the harness that produced it
  version: string;
  limits: Limits;
  // How Judge0 runs it, for the languages Judge0 serves (the website's bridge)
  judge0?: Judge0Settings;
  docker: DockerSettings;
  // How the system backend runs it, for the languages it supports
  system?: SystemSettings;
  // Fixes that keep line numbers unchanged (line endings, a BOM); `errors` are
  // problems to report without running anything
  normalize(code: string): { code: string; errors: string[] };
  assemble(code: string, spec: LessonSpec): Assembled;
  // Compiler output (or a syntax error on stderr) as diagnostics on the
  // learner's lines
  diagnostics(output: string, assembled: Assembled, spec: LessonSpec): Diagnostic[];
  // Starting code for a lesson: the declarations the tests call, with
  // placeholder bodies. The basis for each lesson's UserAnswer file.
  starter?(spec: LessonSpec): string;
}
