---
name: local-setup
description: Set up Skilled.dev to run on this machine, from a fresh clone to lessons that open and run code. Covers Node.js, npm ci, .env.local, Hasura and Postgres in Docker, migrations, metadata, the course seed, the code runner's Docker images and the dev server, then checks it all with npm run check:setup. Use when asked to set up, install, bootstrap or run this repo locally, or when local Hasura, the course seed, the dev server or Run Code isn't working.
---

# Set up Skilled.dev locally

The goal is the app at http://localhost:3000/course, with every lesson open and Run Code working. You're done when `npm run check:setup` passes every check while the app is running. `docs/README.md` is the guide for people. This file is the same setup written for an agent: the order, how to check each step, and what to ask the user first.

Every step is safe to repeat. Start by finding out what's already done:

```bash
npm run check:setup -- --no-app   # needs npm ci first; before that it says so
```

It checks each step in order and prints `✓`, `✗` with the fix underneath, `!` for a note, or `-` for a step it skipped. Fix the first `✗` and run it again.

## Ground rules

- **Secrets.** Never print, paste or commit what's in `.env.local` or `.env`. Check them with `npm run check:setup`, which only gives names. The Hasura admin secret `changeme_…` in `hasura/docker-compose.yml` is a published local-only value, so it's fine to use in commands.
- **The user's values.** Don't replace a value the user has set in `.env.local`; `npm run setup:env` never does. Change only the lines a step needs, such as `GRAPHQL_URL` after moving Hasura's port.
- **Ask the user** which languages they want to run code in (step 5) and, when another setup's database is already on the machine, whether this clone should share it (step 3).
- **Ask first** before:
  - installing system software (Node.js, Docker, the Hasura CLI);
  - stopping a program or container that holds a port;
  - pulling more than a couple of runner images (all ten take about 13 GB);
  - deleting the database (`docker compose ... down -v`);
  - changing where code runs (`CODE_RUNNER`).
- **Commits.** Setup changes no tracked file. Use `npm ci`, not `npm install`. If `git status` shows a tracked file changed afterwards, tell the user instead of committing it.
- **Shells.** Your shell may not keep exported variables from one command to the next. Run each block below as a single command.
- **This machine only.** `OPEN_ALL_LESSONS=true` and `CODE_RUNNER=system` are for a copy on this machine. They don't belong on a deployed site.

## 1. Prerequisites

Check each one, and ask before installing anything:

- **Node.js 24:** `node -v`. To install: `nvm install`, then `nvm use`; both read `.nvmrc`. `next dev` doesn't run on Node.js 26.
- **Docker, running:** `docker info --format '{{.ServerVersion}}'`. To install: Docker Desktop (macOS, Windows) or Docker Engine (Linux). If it's installed but not running, ask the user to start it.
- **Hasura CLI v2.48.10:** `hasura version --skip-update-check`. To install:
  ```bash
  curl -L https://github.com/hasura/graphql-engine/raw/stable/cli/get.sh | VERSION=v2.48.10 bash
  ```
  This installs to `/usr/local/bin` with sudo. To skip sudo, add `INSTALL_PATH=$HOME/.local/bin` before `VERSION`; that folder needs to be on the `PATH`. To change an existing CLI's version: `hasura update-cli --version v2.48.10`.
- **macOS or Linux.** On Windows, use WSL.

## 2. Install, and make `.env.local`

```bash
npm ci
npm run setup:env
```

`setup:env` copies `.env.example` to `.env.local` with a new `JWT_SECRET` and `ENCRYPTION_KEY`, and keeps any value already there. The copy works as it is: Hasura at `localhost:8080`, the local admin secret, and `OPEN_ALL_LESSONS=true`, so every lesson opens without an account.

`npm ci` reports vulnerabilities in old dependencies. Don't run `npm audit fix`: it rewrites the tracked `package-lock.json`.

## 3. Start Hasura and Postgres

Every clone of this repo uses the same Docker Compose project, `skilled-hasura`, and so the same database volume, `skilled-hasura_db_data`. If that volume exists, it's this repo's database from an earlier setup or another clone, and step 4 brings it up to date. Ask whether this clone should share it. If the user wants a database of its own, pick a project name such as `skilled-2` and add `-p skilled-2` to every `docker compose` command from here on:

- the ones in this file, including "When something fails" and "Stop, or start again";
- the ones `check:setup` prints, which never have it.

Tell the user the name. `docker compose ls` lists the projects, in case it's forgotten.

Find out what's already there, and what holds port 8080:

```bash
docker volume ls --filter name=skilled-hasura --format '{{.Name}}'               # this repo's shared database, if a setup made it
docker compose -f hasura/docker-compose.yml ps --format '{{.Name}} {{.State}}'   # this repo's containers (add your -p); no output means they aren't running
docker ps --filter publish=8080 --format '{{.Names}}'                            # a container on 8080, from any project
lsof -nP -iTCP:8080 -sTCP:LISTEN                                                 # any program on 8080 (Linux: ss -ltnp | grep :8080)
```

- **This repo's containers are running** (`skilled-hasura-…`, or your `-p` name): skip to step 4.
- **Nothing holds 8080:** start it:
  ```bash
  docker compose -f hasura/docker-compose.yml up -d
  ```
- **Something else holds 8080:** don't stop it. Pick a free port. When another project's container holds 8080, `npm run check:setup -- --no-app` names one it has checked is free. Otherwise, no output from `lsof -nP -iTCP:<port> -sTCP:LISTEN` means a port is free. Then, with that port:
  ```bash
  HASURA_PORT=8091 docker compose -f hasura/docker-compose.yml up -d
  npm run setup:env -- --hasura-port 8091   # points GRAPHQL_URL in .env.local at it
  ```
  From here on, use that port wherever this file says 8080: in step 4, in the console's URL, and in any later `docker compose ... up`, which needs the same `HASURA_PORT`. Tell the user the port.

It takes a few seconds to start. This waits up to two minutes, and says so if Hasura doesn't come up (macOS has no `timeout`):

```bash
PORT=8080   # or the port you chose
for i in $(seq 60); do curl -sf -o /dev/null http://localhost:$PORT/healthz && break; sleep 2; done
curl -sf -o /dev/null http://localhost:$PORT/healthz && echo "Hasura is up" || echo "Hasura isn't up: docker compose -f hasura/docker-compose.yml logs graphql-engine"
```

## 4. The schema, metadata and course seed

Run this as one command, with your port if you moved it:

```bash
export HASURA_GRAPHQL_ENDPOINT=http://localhost:8080 \
  HASURA_GRAPHQL_ADMIN_SECRET=changeme_changeme_changeme_changeme_changeme_changeme_changeme_changeme_changeme_changeme
hasura --project hasura migrate apply --database-name default --skip-update-check &&
hasura --project hasura metadata apply --skip-update-check &&
node scripts/course-seed.js apply
```

This applies the migrations, then the metadata, then loads the 12 categories and 70 lessons from `hasura/seeds/course.json`. The lessons' text and code are in `src/content/lessons/`; the database holds only these rows, plus accounts, progress and code runs. Then run `npm run check:setup -- --no-app`: everything through the course seed should show `✓`.

## 5. Where lesson code runs

By default, Run Code runs each program in a throwaway Docker container, with no network, a read-only filesystem and limits. That needs one image per language. **Ask the user which languages they want**; JavaScript and Python together are about 560 MB:

```bash
npm run runner:images javascript python
```

The names are `javascript typescript python java cpp csharp go kotlin swift rust`; with no names, it gets all ten. `check:setup` lists every runner image already on the machine, including ones pulled for another reason, so if the user's languages are listed, there's nothing to pull. Images already on the machine work whichever languages the user picked, and step 6's check runs code in every language that has one; `npm run check:setup -- javascript python` checks only theirs. TypeScript, C++, Go and Kotlin are built rather than pulled, which takes a few minutes each. If one fails with `no space left on device`, Docker Desktop's disk limit is full (Settings → Resources): pull fewer, or ask the user to free space.

**Without the runner images**, JavaScript, TypeScript and Python can run with this machine's own `node` and `python3`, by setting `CODE_RUNNER=system` in `.env.local`. There's no sandbox, so a program runs as the user, with their files and the network. Ask before choosing this. Only a browser on this machine can run code this way, and the other seven languages stay off.

If `check:setup` says code runs on Judge0 or the runner service, that's from a key or a `CODE_RUNNER` the user set (often a `JUDGE0_API_KEY` in `.env`). Each run then counts against that service's limits. Point this out, and ask before adding `CODE_RUNNER=docker` to `.env.local`.

## 6. Start the app, and check everything

`npm run dev` keeps running. Start it in the background, with its output going to a file you can read: use your tool's background mode, or `nohup`, as below. `*.log` is gitignored. It needs port 3000, which `ROOT_URL` and the OAuth callbacks expect. `lsof -nP -iTCP:3000 -sTCP:LISTEN` shows what holds it. If anything does, ask the user instead of moving the app.

```bash
nohup npm run dev > skilled-dev.log 2>&1 &
for i in $(seq 90); do curl -s -o /dev/null http://localhost:3000/ && break; sleep 2; done
curl -s -o /dev/null http://localhost:3000/ || { echo "The app isn't up:"; tail -20 skilled-dev.log; }
npm run check:setup
```

On a first run this can take four minutes or more, so give it a long timeout, or run the last line on its own. The last check runs a free lesson's reference solution through the app, in every language that can run here, the way Run Code does. It expects every test to pass. A page's first visit compiles it, so the first check can take a minute. To check only some languages: `npm run check:setup -- javascript python`. The dev server's log has React warnings about props such as `isFocused`; they're expected.

When it passes, tell the user:

- the URL, http://localhost:3000/course;
- which languages run code, and how to add more (`npm run runner:images <name>`);
- the Hasura console, at http://localhost:8080/console (or your port). Its admin secret is `HASURA_GRAPHQL_ADMIN_SECRET` in `hasura/docker-compose.yml`;
- the port and the `-p` name, if you changed them;
- how to stop everything (below).

## Optional: logging in

Logging in isn't needed, since every lesson opens without an account. It saves a learner's progress and code, and it needs an OAuth app that the user creates themselves. GitHub's is quickest ("Logging In" in docs/README.md); its callback URL is `http://localhost:3000/api/auth/github/callback`. Have the user put `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` into `.env.local` themselves, so the secret doesn't pass through you. Then restart `npm run dev`.

## When something fails

If this clone has its own database, add its `-p` to each `docker compose` command below.

- **`port is already allocated` from `docker compose`:** use another port with `HASURA_PORT` (step 3).
- **`check:setup` says another project's Hasura holds the port:** run the two commands it gives (step 3).
- **`check:setup` says Hasura "refuses HASURA_GRAPHQL_ADMIN_SECRET":** `.env.local` has a different secret from this repo's Hasura. Compare its line with `.env.example`'s without printing either.
- **`hasura` commands say `access-denied` or `invalid x-hasura-admin-secret`:** the secret didn't reach the CLI (step 4 is one command), or an old `hasura/.env` holds another one. Exported values take precedence over that file.
- **`migrate apply` fails partway:** read the error. If the database holds nothing of the user's yet, the simplest fix is `docker compose -f hasura/docker-compose.yml down -v`, then steps 3 and 4. That deletes the data, so ask first.
- **`JWT_SECRET must be a valid 64-byte base64-encoded string`:** delete that line from `.env.local` and run `npm run setup:env`.
- **A lesson asks the user to log in:** set `OPEN_ALL_LESSONS=true` in `.env.local` and restart `npm run dev`.
- **Run Code says "The Docker image … isn't available":** `npm run runner:images <language>`.
- **`next dev` stops with `EADDRINUSE`:** something else holds port 3000. Ask the user.
- **Anything else:** run `npm run check:setup` and read the end of `skilled-dev.log`, then see "Troubleshooting" in `docs/README.md`.

## Stop, or start again

If this clone has its own database, add its `-p` to each `docker compose` command below. Without it, they act on the shared `skilled-hasura` project.

- **Stop the app:** kill the process ID that `lsof -nP -iTCP:3000 -sTCP:LISTEN` shows; `npm run dev` exits with it.
- **Stop Hasura and Postgres, keeping the data:** `docker compose -f hasura/docker-compose.yml down`. To start them again, use step 3's command with the same `HASURA_PORT`, which is the port in `GRAPHQL_URL` in `.env.local`.
- **Delete the data:** `docker compose -f hasura/docker-compose.yml down -v`, then steps 3 and 4. Ask first. It deletes local accounts, progress and code runs, and without `-p` that's the database every clone of this repo shares.

## More

- `docs/README.md`: the same setup for people, plus changing lessons, tests, and every integration.
- `docs/runner-service.md`: running learners' code for a public site.
- `scripts/README.md`: every script, including `check-setup.js`.
