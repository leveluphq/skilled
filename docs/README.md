# Running Skilled.dev Locally

## Table of Contents

- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [1. Install Dependencies](#1-install-dependencies)
- [2. Configure Environment Variables](#2-configure-environment-variables)
- [3. Start Hasura and Postgres](#3-start-hasura-and-postgres)
- [4. Apply Migrations, Metadata, and Seed Data](#4-apply-migrations-metadata-and-seed-data)
- [5. Run the Web App](#5-run-the-web-app)
- [6. Run Lesson Code](#6-run-lesson-code)
  - [Running Code Without Docker](#running-code-without-docker)
- [Change a Lesson's Title, Order or Access](#change-a-lessons-title-order-or-access)
- [Optional Integrations](#optional-integrations)
  - [Logging In](#logging-in)
- [Tests and Checks](#tests-and-checks)
- [Common Commands](#common-commands)
- [Troubleshooting](#troubleshooting)

## Architecture

Skilled.dev is organized as:

- `src/` (main app): Next.js app, API routes, GraphQL proxy, UI, MDX course content
- `src/content/lessons/<lesson>/`: each lesson's text, code snippets, starting code, solutions and tests (`runner.spec.ts`)
- `src/services/server/runner/`: the code runner, which runs learners' code in ten languages
- `hasura/`: Postgres + Hasura schema/migrations/metadata, and the course seed (`hasura/seeds/course.json`)
- `docker/runner/`, `runner/`: the code runner's Docker images, and the runner service the website uses ([The Runner Service](runner-service.md))
- `test/conformance/`: checks every lesson's solutions and starting code in every language
- `scripts/`: the course seed, runner images and generators, and lesson checks ([scripts/README.md](../scripts/README.md))

Core request flow:

1. Browser calls Next.js app (`http://localhost:3000`)
2. App GraphQL requests go through `/api/graphql`
3. `/api/graphql` forwards to Hasura (`http://localhost:8080/v1/graphql`) with role headers

## Prerequisites

- Node.js 24 (`.nvmrc`, so `nvm use` picks it; `next dev` doesn't run on Node.js 26)
- npm
- Docker + Docker Compose (Docker Desktop on macOS and Windows), for Hasura and Postgres and, by default, for running lesson code
- Hasura CLI v2.48.10, the version of the Hasura that `hasura/docker-compose.yml` runs. Install it with
  ```bash
  curl -L https://github.com/hasura/graphql-engine/raw/stable/cli/get.sh | VERSION=v2.48.10 bash
  ```
  or, if you have another version, `hasura update-cli --version v2.48.10`.
- macOS or Linux. On Windows, use WSL.

## 1. Install Dependencies

From repo root:

```bash
npm ci
```

`npm ci` installs exactly what `package-lock.json` lists. The repo's `.npmrc` accepts one old peer dependency range (focus-trap-react asks for React 16), so no flags are needed. It ends by reporting vulnerabilities in old dependencies. Leave the `npm audit fix` it suggests for a pull request of its own: it rewrites `package-lock.json`.

## 2. Configure Environment Variables

Create `.env.local`, the app's settings for local development:

```bash
npm run setup:env
```

It copies `.env.example` to `.env.local` and generates a `JWT_SECRET` and an `ENCRYPTION_KEY`, each 64 random bytes in base64. Run it again at any time: it never replaces a value you've set. To do it by hand instead, copy the file and generate each secret with `openssl rand -base64 64 | tr -d '\n'` (without `tr`, `openssl` splits the value over two lines).

The copy works as it is for local development. These are the variables the app needs; `.env.example` has all of them:

```env
APP_STAGE=development
ROOT_DOMAIN=localhost
ROOT_URL=http://localhost:3000
GRAPHQL_URL=http://localhost:8080/v1/graphql
HASURA_GRAPHQL_ADMIN_SECRET=<the local-only value in hasura/docker-compose.yml, as .env.example has it>
JWT_TOKEN_NAME=stoken-local
JWT_SECRET=<64-byte base64 secret>
ENCRYPTION_KEY=<64-byte base64 secret>
OPEN_ALL_LESSONS=true
```

`OPEN_ALL_LESSONS=true` opens every lesson to everyone, logged in or not, so you can read and run the whole course without setting up login. Without it, as on skilled.dev, only the free lessons open until you log in, and logging in needs an OAuth app (see [Logging In](#logging-in)).

## 3. Start Hasura and Postgres

From repo root:

```bash
docker compose -f hasura/docker-compose.yml up -d
```

Health check (it takes a few seconds to start; `OK` means it's up):

```bash
curl http://localhost:8080/healthz
```

Important:

- `HASURA_GRAPHQL_ADMIN_SECRET` in `.env.local` must match the Hasura admin secret set in `hasura/docker-compose.yml`. `.env.example` already has it.
- Hasura uses port 8080 and Postgres stays inside Docker. If 8080 is taken, see [Troubleshooting](#troubleshooting).

## 4. Apply Migrations, Metadata, and Seed Data

Do this once after bringing up local Hasura, and again whenever schema metadata changes.

From repo root, tell the Hasura CLI and the seed script where Hasura is. The admin secret is the local-only one from `hasura/docker-compose.yml`:

```bash
export HASURA_GRAPHQL_ENDPOINT=http://localhost:8080
export HASURA_GRAPHQL_ADMIN_SECRET=changeme_changeme_changeme_changeme_changeme_changeme_changeme_changeme_changeme_changeme
```

These last for this terminal. To keep them, `cp hasura/.env.example hasura/.env`: the Hasura CLI reads that file itself, and `course-seed.js` reads it with `--env-file hasura/.env`.

Apply database migrations:

```bash
hasura --project hasura migrate apply --database-name default --skip-update-check
```

Apply Hasura metadata:

```bash
hasura --project hasura metadata apply --skip-update-check
```

Load the course's categories and lessons (titles, order, access level, published status) from `hasura/seeds/course.json`:

```bash
node scripts/course-seed.js apply
```

It uses the same `HASURA_GRAPHQL_ENDPOINT` and `HASURA_GRAPHQL_ADMIN_SECRET`. The lessons themselves are in `src/content/lessons`; the database holds only these rows, plus learners' accounts, progress and code runs.

## 5. Run the Web App

From repo root:

```bash
npm run dev
```

Open:

- `http://localhost:3000` (web app; the lessons are at `/course`). The first visit to each page compiles it, which takes a while.
- `http://localhost:8080/console` (Hasura console)

To check the whole setup, run this while the app is running:

```bash
npm run check:setup
```

It checks each step on this page and says how to fix the first one that isn't done. With the runner images from step 6, it also runs a free lesson's reference solution through the app in every language you have, the way Run Code does. `npm run check:setup -- --no-app` stops before the app, and `npm run check:setup -- java` runs code in only the languages you name. It reads `.env.local` without printing any secret. When code runs on Judge0 or the runner service, it runs none, so it uses none of their runs.

## 6. Run Lesson Code

The code editor in each lesson runs the learner's code on your machine, in Docker, in any of ten languages. There's nothing to sign up for. Pull or build the images for the languages you'll use, once:

```bash
npm run runner:images javascript python java   # or with no names, all ten
```

| Language   | Name for `runner:images` | Image                                                                    | Runs                            | Disk                        |
| ---------- | ------------------------ | ------------------------------------------------------------------------ | ------------------------------- | --------------------------- |
| JavaScript | `javascript`             | `node:24.22.0-slim`                                                      | Node.js 24                      | 350 MB                      |
| TypeScript | `typescript`             | `skilled-runner/typescript:7.0.2`, built from `docker/runner/typescript` | TypeScript 7.0, then Node.js 24 | +40 MB on the Node.js image |
| Python     | `python`                 | `python:3.14.8-slim`                                                     | Python 3.14                     | 210 MB                      |
| Java       | `java`                   | `eclipse-temurin:25.0.4.1_1-jdk-noble`                                   | Java 25                         | 590 MB                      |
| C++        | `cpp`                    | `skilled-runner/cpp:16.2.0-2`, built from `docker/runner/cpp`            | GCC 16, C++23                   | 2.4 GB                      |
| C#         | `csharp`                 | `mcr.microsoft.com/dotnet/sdk:10.0.402-noble`                            | .NET 10                         | 1.4 GB                      |
| Go         | `go`                     | `skilled-runner/go:1.27.2`, built from `docker/runner/go`                | Go 1.27                         | 1.5 GB                      |
| Kotlin     | `kotlin`                 | `skilled-runner/kotlin:2.4.21`, built from `docker/runner/kotlin`        | Kotlin 2.4 on Java 25           | +260 MB on the Java image   |
| Swift      | `swift`                  | `swift:6.4.1-noble`                                                      | Swift 6.4                       | 5.5 GB                      |
| Rust       | `rust`                   | `rust:1.99.0-slim`                                                       | Rust 1.99                       | 1.1 GB                      |

These are current stable releases. All ten take about 13 GB of disk, most of it Swift. If a lesson is run in a language whose image isn't there, the editor says which command to run. The built images (C++, Go, Kotlin) precompile what they can, so a compile takes about a second or less.

Each run gets a new container with no network, a read-only filesystem apart from its own folder, the `nobody` user, and limits on CPU time, memory, processes and output. The result is saved before the editor asks for it, so no callback or tunnel is needed.

**This is for running your own code on your own machine.** Containers share the host's kernel, so this is not a safe way to run strangers' code on a public server. For that, use Judge0 (below) or a sandbox built for it, such as gVisor or Firecracker.

How it works, and how to add a lesson:

- Each lesson's tests are in `src/content/lessons/<lesson>/runner.spec.ts`, written once for every language. The Tests tab shows them read-only.
- After changing a spec, run `npm run runner:generate` to update the registry the app loads (`src/content/runnerSpecs.gen.ts`).
- `npm run conformance` checks every lesson in Docker: each spec is valid, the reference solutions pass, the starter code fails cleanly, the harnesses handle crashes, time-outs and prints, and the specs keep every test the old runner had. `npm run conformance -- -t count-islands` checks one lesson.

To run code somewhere other than this machine, as the hosted site does, use the runner service (`CODE_RUNNER=service`; see [The Runner Service](runner-service.md): Cloudflare Containers, or any Docker host), or Judge0 for JavaScript, TypeScript and Python (`JUDGE0_API_KEY` and `JUDGE0_CALLBACK_SECRET`, see Optional Integrations). `CODE_RUNNER` overrides the choice.

**Rate limits.** Where code runs on a shared service (the runner service or Judge0), the run-code route limits how often each learner runs code, counted from their recent runs in `code_submissions`: 120 runs per 10 minutes for a logged-in learner, and 30 per 10 minutes for a logged-out visitor, counted by a keyed hash of their IP address. Everyone together may run code 2000 times an hour, a guard on the bill if many addresses run code at once. `RUN_LIMIT_USER`, `RUN_LIMIT_ANONYMOUS` and `RUN_LIMIT_TOTAL` change them (`off` turns one off); see `.env.example`. A learner over the limit is told when they can run code again. Visitors' addresses come from `X-Forwarded-For`, which Vercel sets itself; behind another proxy, make sure it replaces that header rather than appending to it, or a visitor could forge their address.

### Running Code Without Docker

JavaScript, TypeScript and Python lessons can also run with this machine's own Node.js and Python instead of the runner images, which saves their downloads and disk (Hasura and Postgres still run in Docker, step 3). In `.env.local`:

```env
CODE_RUNNER=system
```

Then restart `npm run dev`. JavaScript runs on the Node.js running the app, TypeScript compiles with the same tsc as the Docker image (7.0.2, installed by `npm install`), and Python runs with `python3` from your `PATH`. `RUNNER_NODE` and `RUNNER_PYTHON` point at others. Every lesson has been checked on Node.js 18 to 26 and Python 3.9 to 3.14; older versions are refused with a message saying so. The language picker offers only these three languages; the other seven need Docker.

Each run gets a temporary folder of its own and none of the app's environment variables, and is held to the same time and output limits as in Docker (CPU time on Linux and macOS, and a wall-clock limit), but nothing else: **the program runs as you, with your files and the network.** That's fine for your own code on your own machine, and nowhere else, so the run-code route only runs code for a browser on the same machine (not through a proxy or tunnel), and code doesn't run at all when `ROOT_URL` isn't localhost. It needs macOS or Linux (on Windows, use WSL or Docker).

`CONFORMANCE_RUNNER=system npx jest -c jest.conformance.config.js test/conformance/javascript.test.ts test/conformance/typescript.test.ts test/conformance/python.test.ts` checks every lesson this way, with the Node.js and Python you have.

## Change a Lesson's Title, Order or Access

The course's categories and lessons are rows in the database, and `hasura/seeds/course.json` is the source of truth for them: each lesson's slug, title, category, position in the course, `status` (`ACTIVE` is published), `accessLevel` (`FREE` opens without an account; `TRIAL` and `SUBSCRIPTION` need one on the website) and video links. To change one, edit the file, then bring a database in step with it:

```bash
node scripts/course-seed.js diff    # what would change, changing nothing
node scripts/course-seed.js apply   # make the changes
```

Both use `HASURA_GRAPHQL_ENDPOINT` (default `http://localhost:8080`) and `HASURA_GRAPHQL_ADMIN_SECRET`, or `--env-file <file>`. Changes go through a pull request like any other. Once one is merged, someone with the production admin secret applies it there:

```bash
node scripts/course-seed.js diff --env-file hasura/.env.prod.local
node scripts/course-seed.js apply --env-file hasura/.env.prod.local --yes
```

Applying to a database that isn't on this machine needs `--yes`, after reading the diff. All the changes go in one transaction, so a lesson never shows half-changed, and lessons can trade positions or slugs. Rows in the database that the file doesn't have are reported and left alone, since learners' progress points at them; to take a lesson down, set its `status` to `INACTIVE`. If a database was changed directly (in the Hasura console, say), `node scripts/course-seed.js export --env-file <file>` writes its rows into the file, to review with `git diff`.

A new lesson needs a row (with a new id from `node -e "console.log(crypto.randomUUID())"`), its content in `src/content/lessons/<slug>/` and its page, which `node src/scripts/generateLessonPages.js` writes. A test checks that every published lesson in the file has both.

## Optional Integrations

You can run the app with minimal env setup, then add integrations as needed.

### Logging In

Every lesson opens without logging in when `OPEN_ALL_LESSONS=true` (the default in `.env.example`). Logging in saves a learner's progress and code. To log in locally, create a GitHub OAuth app:

1. Go to https://github.com/settings/developers and choose **New OAuth App**.
2. Set the homepage URL to `http://localhost:3000` and the authorization callback URL to `http://localhost:3000/api/auth/github/callback`.
3. Put its client ID and a new client secret in `.env.local` as `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`, and restart `npm run dev`.

Logging in also needs `JWT_SECRET` and `ENCRYPTION_KEY` (step 2). Google (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`) and Facebook (`FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`) work the same way; `.env.example` has their steps. Stripe isn't needed: without `STRIPE_SECRET_KEY`, new users simply have no Stripe customer until they buy something.

Stripe checkout/webhooks, for selling the course:

- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

Without them the pricing page says there's nothing for sale.

Code execution on Judge0 instead of Docker (see [6. Run Lesson Code](#6-run-lesson-code)):

- `JUDGE0_API_KEY`. With it set, code runs on Judge0 unless `CODE_RUNNER=docker`.
- `JUDGE0_CALLBACK_SECRET`
- `RUNNER_V2_LESSONS`: which lessons use the new runner on Judge0, `all` or a comma-separated list of slugs. The rest use the old runner, which sends each lesson's test code from its `Tests/` folder.
- `JUDGE0_CALLBACK_BASE_URL` for local development. Judge0 sends each result to `<base URL>/api/v1/judge0/callback/<submission id>`, and the base URL defaults to `ROOT_URL`. Judge0 can't reach localhost, so locally point this at a tunnel to your dev server (for example `ngrok http 3000`). With a localhost base URL and no tunnel, running code fails straight away with an error saying so.

If a callback never arrives, the editor asks the app to fetch the result from Judge0 after 10 and 25 seconds (`/api/v1/judge0/refresh/<token>`), so a run still finishes; each of those is a Judge0 request.

To check lesson solutions against the old runner's tests, see `check-lessons.js` in `scripts/README.md`.

Email notifications (Brevo/Sendinblue):

- `SENDINBLUE_API_KEY`
- `INTERNAL_NOTIFICATION_EMAIL`

Error tracking:

- `SENTRY_DSN`
- `SENTRY_DSN_CLIENT`

## Tests and Checks

Before opening a pull request, run what CI runs (`.github/workflows/ci.yml`):

```bash
npm run ts       # typecheck
npm test         # unit tests; no services needed
npm run build    # the production build; needs Hasura with the course seed (steps 3 and 4)
```

The conformance suite runs every lesson's reference solutions and starting code, and each harness's control programs, in Docker, with the runner images from [step 6](#6-run-lesson-code). It's slow, so it's separate from `npm test`:

```bash
npm run conformance                                      # every lesson in every language
npm run conformance -- test/conformance/python.test.ts   # one language
npm run conformance -- -t count-islands                  # one lesson
```

After changing a lesson's `runner.spec.ts` or a harness, run `npm run runner:generate` and commit what it changes; a test fails until you do. [Adding a Language](adding-a-language.md) covers the runner in depth.

## Common Commands

Web app:

```bash
npm run dev
npm run check:setup   # checks every setup step, then runs a lesson's code through the app
npm run ts
npm test
npm run build
```

Hasura and Postgres:

```bash
docker compose -f hasura/docker-compose.yml up -d     # start
docker compose -f hasura/docker-compose.yml down      # stop, keeping the data
docker compose -f hasura/docker-compose.yml down -v   # stop and delete the data; then repeat step 4
```

Generated files:

```bash
npm run runner:generate           # after changing a lesson's runner.spec.ts or a harness
npm run contentgen:lesson:pages   # a page in src/pages/course for each folder in src/content/lessons
npm run contentgen:blog:slugs     # the list of blog posts
npm run codegen:all               # src/types/generated, after changing a GraphQL query or the schema
```

`codegen:all` reads the schema from local Hasura with the step 4 settings: it uses `HASURA_GRAPHQL_ENDPOINT` (default `http://localhost:8080`) and the local admin secret.

## Troubleshooting

Start with `npm run check:setup` ([step 5](#5-run-the-web-app)), which finds most of these and says what to run.

Port 8080 is already in use (`docker compose` says `port is already allocated` or `address already in use`)

- Another program has Hasura's port. Stop it (`docker ps` lists other containers), or start Hasura on another port and point the app and the CLI at it:
  ```bash
  HASURA_PORT=8090 docker compose -f hasura/docker-compose.yml up -d
  export HASURA_GRAPHQL_ENDPOINT=http://localhost:8090
  ```
  and point the app at it, which sets `GRAPHQL_URL=http://localhost:8090/v1/graphql` in `.env.local`:
  ```bash
  npm run setup:env -- --hasura-port 8090
  ```
  The console is then at `http://localhost:8090/console`. A later `docker compose ... up` needs the same `HASURA_PORT`. When another project's container holds 8080, `npm run check:setup` names it and a free port.

Port 3000 is already in use

- `next dev` stops with `EADDRINUSE`. Stop the other program: `ROOT_URL` and the OAuth callback URLs expect port 3000.

`GraphQL proxy is missing GRAPHQL_URL or HASURA_GRAPHQL_ADMIN_SECRET`

- Confirm `.env.local` values for:
  - `GRAPHQL_URL=http://localhost:8080/v1/graphql`
  - `HASURA_GRAPHQL_ADMIN_SECRET=<same as Hasura>`

`JWT_SECRET must be a valid 64-byte base64-encoded string` (or the same for `ENCRYPTION_KEY`)

- The value isn't 64 bytes of base64, often because it was pasted from `openssl rand -base64 64`, which splits it over two lines. Delete its line from `.env.local` and run `npm run setup:env`, or replace it with the output of `openssl rand -base64 64 | tr -d '\n'`. A bad `JWT_SECRET` is only a warning in `npm run dev`, but `npm run build` and `npm start` refuse to run; a bad `ENCRYPTION_KEY` stops logging in.

Hasura commands fail with auth/connection errors

- Verify local Hasura is up:
  ```bash
  curl http://localhost:8080/healthz
  ```
- Verify shell env vars before Hasura CLI commands:
  ```bash
  echo "$HASURA_GRAPHQL_ENDPOINT"
  echo "$HASURA_GRAPHQL_ADMIN_SECRET"
  ```
- A `hasura/.env` from an older copy of the repo can hold another secret. Variables you export take precedence over it.

OAuth callback or login issues

- Check `ROOT_URL`
- Check provider callback URLs match `ROOT_URL` exactly
- Ensure `ENCRYPTION_KEY` is set

A lesson asks you to log in

- Set `OPEN_ALL_LESSONS=true` in `.env.local` and restart `npm run dev` (for `npm run build`, set it before building), or set up [Logging In](#logging-in).

`course-seed.js` says it couldn't reach Hasura, or to check the admin secret

- Start Hasura (step 3), and check `HASURA_GRAPHQL_ENDPOINT` and `HASURA_GRAPHQL_ADMIN_SECRET` (step 4).

`npm run runner:images` fails with `no space left on device`

- All ten images take about 13 GB, and building C++, Go and Kotlin needs more while they build. On Docker Desktop, the limit is its own disk size (Settings → Resources), not your computer's free space. Pull fewer languages, raise the limit, or free space with `docker system prune`.
