# Scripts

Utility scripts for Skilled.dev. Run them from the repo root.

| Script                                                                             | What it does                                                                                                                                                                         |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `setup-env.js` (`npm run setup:env`)                                               | Makes `.env.local` from `.env.example` with a new `JWT_SECRET` and `ENCRYPTION_KEY`, keeping any value you've set (docs/README.md, step 2)                                           |
| `check-setup.js` (`npm run check:setup`)                                           | Checks each local setup step and says how to fix the first that isn't done, then runs a lesson's code through the running app in each language that can run (docs/README.md, step 5) |
| `course-seed.js`                                                                   | Keeps a database's categories and lessons in step with `hasura/seeds/course.json` (below)                                                                                            |
| `runner-images.js` (`npm run runner:images`)                                       | Pulls or builds the Docker image for each language the code runner runs                                                                                                              |
| `generate-runner-*.js`, `generate-lesson-languages.js` (`npm run runner:generate`) | Regenerates the harness bundle, the lesson spec registry and each lesson's languages                                                                                                 |
| `runner-starter.js`                                                                | Prints a lesson's starting code in a language, generated from its spec (docs/adding-a-language.md)                                                                                   |
| `lesson-snippets.js`, `add-language-imports.js`                                    | Lists lesson code snippets missing in a language, and adds new snippet files to the lessons' code maps (docs/adding-a-language.md)                                                   |
| `runner-service.js`                                                                | Builds the runner service's images and runs its Docker-host dispatcher (docs/runner-service.md)                                                                                      |
| `check-lessons.js`                                                                 | Runs lessons' reference solutions against the old runner's tests (below)                                                                                                             |
| `rotate-secrets.js`                                                                | Prints new random secrets and a checklist for rotating them on a deployment                                                                                                          |
| `rcgen`                                                                            | Makes a React component folder (`index.ts`, the component, `styles.ts`, `props.ts`)                                                                                                  |

## course-seed.js

Keeps a database's course categories and lessons (titles, order, access level, published status, video links) in step with `hasura/seeds/course.json`, the source of truth for them. `diff` shows what differs, `apply` inserts and updates rows to match the file, and `export` writes a database's rows into the file. It replaced `upload-lessons.js` and `lessons.json`. See "Change a Lesson's Title, Order or Access" in `docs/README.md`.

```bash
node scripts/course-seed.js diff     # from the repo root
```

## check-lessons.js

Runs every coding lesson's reference solution (each `Solution/code/<Variant>` in JavaScript, TypeScript, and Python) against that lesson's own `Tests`, the same way the platform runs learner code (see `src/utils/constants/codeRunner.ts`).

### Usage

Requires `node` and `python3`, plus the repo root's `npm install` (for `typescript`).

```bash
npm run check-lessons
# or only some lessons
node check-lessons.js valid-brackets target-two-sum
```

By default it uses the `node` and `python3` on your machine, which are newer than what the platform runs. To check against the versions Judge0 actually uses, add `--judge0`:

```bash
node check-lessons.js --judge0
```

That runs each program in Docker on Node.js 12.14.0 and Python 3.8.1, and compiles TypeScript with `tsc` 3.7.4 and the platform's compiler options, so code that only works on newer runtimes fails here the way it would for a learner. It needs Docker running and this folder's `npm install` (for TypeScript 3.7.4). Keep it in step with `mapLanguageToId` and `compilerOptionsForLanguage` in `src/services/server/coderunner/judge0/index.ts`.

To check the starter code learners begin with instead of the reference solutions, add `--starters` (it combines with `--judge0`):

```bash
node check-lessons.js --starters
```

A starter has no solution in it yet, so it should run and fail at least one test. A starter that crashes is an `ERROR` (the learner would see an error instead of test results), and one that passes every test is a `FAIL` (the tests can't tell an empty answer from a correct one).

Each line is `PASS`, `FAIL` (with the failing test cases), `ERROR` (the code crashed, failed to compile, or didn't produce results), `EMPTY` (the lesson has no tests), or `SKIP` (a solution variant that isn't meant to run against the tests; see `VARIANTS` in the script). The script exits with code 1 on any `FAIL`, `ERROR` or `EMPTY`.

Passing a lesson's tests doesn't prove a solution is correct, since some suites have only a few cases.
