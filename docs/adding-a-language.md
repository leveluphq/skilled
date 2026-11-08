# Adding a Language to the Code Runner

Lessons are written once, as a language-neutral spec, and run in every language the runner supports. This guide covers what a language needs. Java (`src/services/server/runner/runtimes/java.ts`) is the reference implementation; read it alongside this guide.

## How a run works

1. Each runnable lesson has a spec, `src/content/lessons/<lesson>/runner.spec.ts`: the function (or class) the learner writes, its parameter and return types, and the tests, with each test's inputs and expected answer.
2. When the learner clicks Run Code, the server builds **one source file**: the learner's code, then the language's **harness** (the prelude), then a **driver** generated from the spec that calls the learner's code once per test.
3. The program reads every test's inputs from stdin, runs them one at a time, and prints one line per event. Expected answers never reach the program; the server compares the answers it reports.
4. Locally the program runs in a throwaway Docker container from the language's image (`backends/docker.ts`). Errors from the compiler are mapped back to the learner's lines.

## Files a language adds

| File                                                      | What it is                                                                                                                                                                                                |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/services/server/runner/preludes/<lang>.core.<ext>`   | The harness: stdin and JSON parsing, the test loop, output, error reporting                                                                                                                               |
| `src/services/server/runner/preludes/<lang>.<Type>.<ext>` | One file per runner type (`ListNode`, `BinaryNode`, `Interval`, `Item`): the type and its converters. Only the types a lesson uses are added, so a learner's own `ListNode` stays legal in other lessons. |
| `src/services/server/runner/runtimes/<lang>.ts`           | The `LanguageRuntime`: type mapping, driver generator, normalizer, compiler diagnostics, starting code, Docker settings and limits                                                                        |
| `src/services/server/runner/runtimes/index.ts`            | One line registering the runtime                                                                                                                                                                          |
| `docker/runner/<lang>/Dockerfile`                         | Only if no official image fits; otherwise pin an official image's exact tag                                                                                                                               |
| `scripts/runner-images.js`                                | One line: the image to pull or build                                                                                                                                                                      |
| `test/conformance/controls/<lang>.ts`                     | The control programs (below)                                                                                                                                                                              |
| `test/conformance/<lang>.test.ts`                         | `defineConformanceTests(CodingLanguage.X)`                                                                                                                                                                |
| `src/services/server/runner/__tests__/<lang>.test.ts`     | Unit tests for the parts that don't need Docker                                                                                                                                                           |

After adding or changing a harness file, run `npm run runner:generate`: it embeds the harness files in `preludes.gen.ts`, which a test keeps current.

The language's constants (name, CodeMirror mode, tab size) are already in `src/utils/constants/lesson.ts`. A language appears in the picker when it is in `codingLanguageList`, and a lesson offers it once the lesson has starting code and a reference solution in it.

## The harness contract

**stdin** is two lines: a 32-character hex nonce, then one JSON document:

```json
{"tests": [{"args": [[1, 2], 3], "hidden": []}, ...]}
```

For a class-design lesson each test is `{"ctorArgs": [...], "ops": [["push", 3], ["pop"], ...]}`, and the answer is one value per operation (`null` for a void method). The harness reads all of stdin before running any learner code.

**stdout**: every harness line is the nonce followed by compact JSON, flushed immediately so results survive a later crash:

```
<nonce>{"t":"start","i":0}
<nonce>{"t":"result","i":0,"ok":true,"out":<answer as JSON>,"ms":0.42}
<nonce>{"t":"result","i":1,"ok":false,"error":"ArithmeticException: / by zero (line 5)","ms":0.1}
<nonce>{"t":"done"}
```

Everything else on stdout is the learner's printing, shown as the logs of the test that was running. So the harness must flush the learner's output before each harness line, cap what each test prints (64 KB) and in total (256 KB), and start each harness line on a new line.

**Each test is isolated**: an exception fails only that test, and the next one runs. Catch everything the language lets you catch. Run the tests on a thread with a large stack (32–256 MB, depending on what the language's runtime tolerates) so recursive solutions on the deepest inputs (200,000 frames) don't overflow. A crash, a call to exit or a time-out ends the run; the server keeps the finished tests' results and blames the running one.

**Errors** read `ExceptionType: message (line N)`, with the line of the learner's code where it was thrown when the language can tell. Keep them under 500 characters.

**Answers** are JSON: integers exactly (64-bit), doubles round-trippable (NaN and infinity as `null`), strings escaped, map keys sorted. A list or tree is reported as an array, and an empty one (null) as `[]`. A `BinaryNodeRef` (a node of the input tree) is reported as its `data`. Accept whatever collection type the learner returns where the language has several (Java takes `int[]` or `List<Integer>`).

**Timing**: `ms` measures only the learner's call, not converting inputs or answers.

## Types

| Neutral                            | Java                                  | Notes for other languages                                                                                                           |
| ---------------------------------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `int`                              | `int`                                 | 32-bit, range-checked on input                                                                                                      |
| `long`                             | `long`                                | 64-bit; values beyond 2^53 arrive as exact JSON integers                                                                            |
| `double`, `bool`, `string`, `char` | `double`, `boolean`, `String`, `char` | `char` arrives as a one-character string                                                                                            |
| `T[]`                              | `T[]`                                 | Inputs as the language's usual array or list type                                                                                   |
| `map<string,T>`                    | `Map<String, T>`                      |                                                                                                                                     |
| `T?`                               | boxed `T`                             | May be null                                                                                                                         |
| `ListNode`                         | `ListNode`                            | Fields `data` and `next` (Go: `Data`, `Next`). Inputs may be `{"values": [...], "cycleIndex": n}`, linking the tail back to node n. |
| `BinaryNode`                       | `BinaryNode`                          | Fields `data`, `left`, `right`; level order with `null` for missing children                                                        |
| `Interval`                         | `Interval`                            | `start` and `end`, doubles                                                                                                          |
| `Item`                             | `Item`                                | `weight` and `value`, ints                                                                                                          |

**Lists with a loop** (detect-a-loop's `cycleIndex` inputs) need care where a language's lists own their nodes. Rust can't hold a loop in `Option<Box<ListNode>>`, so a parameter that a test gives a loop is passed by reference (`&Option<Box<ListNode>>`), and the harness builds the loop with unsafe code and never drops it.

**Signatures follow LeetCode**, which is what people preparing for interviews know: `class Solution` with the method in Java, C++, C#, Kotlin and Swift; `impl Solution` with associated functions in Rust; a free function in Go. Method names follow `utils/shared/runner/naming.ts` (snake_case in Rust and Python, PascalCase in C#). Starting code shows the runner types a lesson uses as a comment, LeetCode-style.

**Helper functions the tests provide** (`isBadVersion`): in Java, C#, Kotlin and Swift, `Solution` extends the spec's `injected.baseClass` (`VersionControl`), which the driver defines with the helper (final, so a learner's copy can't replace it). In C++ and Go it's a free function defined before the learner's code; in Rust, a method on `Solution` in its own `impl` block, called as `self.is_bad_version(v)`. The body comes from `injected.body[language]`, falling back to JavaScript's.

## Line numbers

The learner's line N must be line N of the file the compiler sees, so compiler errors and stack traces point at the right line. Put the learner's code first, with the harness after it using fully qualified names and no imports. Where the language needs declarations or imports first, use its line directive: `#line` in C++ and C#, `//line` in Go, `#sourceLocation` in Swift. Swift is the exception that runs the other way: its top-level code runs in order, so the harness goes first (learner code placed first could read the nonce from stdin), and `#sourceLocation` restarts the learner's part at line 1. Anything that must precede the learner's code goes on line 1 before it (as Java's automatic imports do), and the diagnostics subtract it from line 1's columns.

## The normalizer

`normalize()` makes only edits that keep every character on its line: it strips a byte-order mark, converts line endings, adds a final newline, and blanks out text that can't compile in the combined file (a `package` line, a second `public` class in Java). Use `lexer.ts` to skip comments and strings. Don't reject code here; let the compiler report it, and explain it in the diagnostics.

## Compiler diagnostics

`diagnostics(output, assembled, spec)` turns compiler output into `{line, column, message}`:

- Errors on the learner's lines are shown as they are, with the column where the compiler gives one.
- If every error is in the harness, the code doesn't fit around it. Lex the learner's code and explain, in this order: an unterminated comment or string; a missing `}` (pointing at the `{` that is never closed); an extra `}`; a redefined runner type (`ListNode` is provided...); a missing `class Solution`; and otherwise "Your code doesn't match what the tests call. They expect:" followed by the expected declarations.

## Starting code

`starter(spec)` generates the declarations the tests call, with placeholder bodies that compile and fail the tests (`return 0;`). It's the basis for each lesson's `UserAnswer/<lang>.mdx`. Print it with:

```bash
node scripts/runner-starter.js count-islands JAVA
```

## Docker image and limits

Use the language's current stable release and pin the exact image tag. The container has no network, a read-only filesystem apart from its working folder and `/tmp`, runs as `nobody`, and `HOME` is `/tmp`. If the compiler needs more memory than the program should get (the JVM, `swiftc`, `rustc`), set `docker.compileMemoryKb`: the compile then runs in a container of its own. The `run` command is exec'd, so it must be a single command (use `env` for variables, or `docker.env`).

Set `limits` (CPU seconds, wall seconds, memory) so a correct solution has headroom: interpreted languages use 256 MB, the JVM 512 MB.

## Running without Docker (optional)

`CODE_RUNNER=system` runs a language with the toolchain installed on the learner's machine (`backends/system.ts`; docs/README.md, Running Code Without Docker). JavaScript, TypeScript and Python have it. To add a language, give its runtime a `system` entry, argument lists for `compile` and `run` with placeholders for the toolchain, teach `systemProblem` to find that toolchain and check its version, and add the language to `SYSTEM_LANGUAGES` in `src/utils/shared/runner/settings.ts`. Only do it where the harness works with what learners typically have installed: C++'s needs GCC's `bits/stdc++.h`, which Apple's clang lacks, and Swift's imports `Glibc`. Then check every lesson with `CONFORMANCE_RUNNER=system` on the oldest version you'll accept, and set its minimum to that.

## Controls and conformance

`test/conformance/controls/<lang>.ts` gives `addNumbers(a, b)` in the language, misbehaving on the third test. Every language passes: a correct solution, a test that throws, an exit mid-run, an infinite loop, stderr before a time-out, prints (including a fake result line), a syntax error on line 7, deep recursion, and the injected helper. Compiled languages also pass a missing closing brace and a wrong signature.

```bash
npm run runner:images java                 # pull or build the image
npx jest -c jest.conformance.config.js test/conformance/controls.test.ts -t "Java "
npm run conformance -- test/conformance/java.test.ts   # every lesson in Java
```

The lesson suite checks, for each lesson with code in the language: the spec is valid, every reference solution passes every test, and the unchanged starting code runs every test and fails at least one.

## Lesson content

For each lesson, add:

- `UserAnswer/<lang>.mdx`: the starting code in a fenced block (` ```java `), starting from `runner-starter.js` and adding a short doc comment like the JavaScript version's.
- `Solution/code/<Variant>/<lang>.mdx` for each solution variant: a reference solution that passes, written the way the lesson explains it.

Then run `node scripts/add-language-imports.js` (adds the files to the lessons' code maps) and `npm run runner:generate` (updates the list of languages each lesson offers).

The lesson text follows the selected language too, so every code snippet needs a version in the new language:

- **Code blocks:** each folder with a `javascript.mdx`, `python.mdx` and an `index.tsx` code map (question examples, explanation code, article code) gets `<lang>.mdx`. Write it the way someone fluent in the language would, with the same comments, and keep the prose around it true: if a paragraph says something only true in JavaScript (integer overflow, `null`, garbage collection), change it to cover every language.
- **Inline code:** each `generateInlineCode` map (function and variable names in the text, such as `walkMatrix` or `walk_matrix`) gets the language's entry, following the spec's naming rules.

`node scripts/lesson-snippets.js --missing <LANGUAGE>` lists what's still missing, and `node scripts/add-language-imports.js` adds the new files to the code maps. A test per language (`lesson snippets` in `src/services/server/runner/__tests__/generated.test.ts`) fails until every snippet has one.

For the website to run the new language, the runner service needs it too ([the runner service](runner-service.md)). The dispatcher and the Cloudflare deploy build from `scripts/runner-images.js`; also add the language to `LANGUAGES` in `runner/cloudflare/src/routing.ts` and export its container class from `runner/cloudflare/src/index.ts` (the Worker's tests check the three agree). `deploy.js` gives the new class a Cloudflare migration of its own.
