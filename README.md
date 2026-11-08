# Skilled.dev

Skilled.dev is an interactive coding interview prep course: 66 published lessons on data structures, algorithms and interview questions, including 28 published coding problems with runner assets in JavaScript, TypeScript, Python, Java, C++, C#, Go, Kotlin, Swift and Rust. Two additional runner exercises remain drafts. The languages available to execute depend on the configured runner backend.

It's a full-stack TypeScript app:

- a Next.js web app, with the lessons written in MDX
- a Hasura + Postgres backend
- a code runner that runs learners' code in a throwaway container per run: on your machine in Docker, or on a hosted runner service for a public site
- optional integrations for OAuth login, Stripe payments, email and error tracking

## Explore the learning library

The official site is [skilled.dev](https://skilled.dev). Start with the [course](https://skilled.dev/course), [public guides](https://skilled.dev/learn), or [preparation paths for all ten languages](https://skilled.dev/interview-prep).

The public library has 88 resources, including 16 interactive tools: graph and tree traversal, linked-list pointers, sorting comparisons, recursion, dynamic programming, event timing, complexity, quizzes, spaced review, study planning, interview rehearsal, and accessible frontend components. Public articles render without an account or client-side JavaScript. Tools add browser interactions, with explanations available independently of them.

Normal lessons keep `/course/<lesson>` URLs. Optional reading walkthroughs use `/course/<lesson>/<language>` and preserve the learner's editor preference. A supported exercise practice action can explicitly select its language. All 66 published lessons have reading coverage: 28 runnable problems, 23 concepts, and seven implementation lessons in ten languages, plus eight JavaScript-focused lessons in JavaScript and TypeScript, for 596 reading pages. The [video library](https://skilled.dev/watch) includes all 65 published recordings, free without an account, with topic browsing, search, chapters, corrections, and reading notes.

Self-hosted deployments configure their own origin, identity, indexing policy, access rules, runner, and optional analytics. See [Publishing Guides and Tools](./docs/publishing-resources.md) for content generation, checks, structured data, and the anonymous public-site audit.

## Quick Start

You need Node.js 24, Docker and the Hasura CLI v2.48.10; [Prerequisites](./docs/README.md#prerequisites) has the install commands. Then, from the repo root:

```bash
nvm use                 # Node.js 24, from .nvmrc
npm ci
npm run setup:env       # .env.local from .env.example, with new secrets

docker compose -f hasura/docker-compose.yml up -d     # Hasura and Postgres, on port 8080

# The local-only admin secret from hasura/docker-compose.yml
export HASURA_GRAPHQL_ENDPOINT=http://localhost:8080   # or the port you moved Hasura to
export HASURA_GRAPHQL_ADMIN_SECRET=changeme_changeme_changeme_changeme_changeme_changeme_changeme_changeme_changeme_changeme
hasura --project hasura migrate apply --database-name default
hasura --project hasura metadata apply
node scripts/course-seed.js apply                     # the course's categories and lessons

npm run runner:images javascript python   # Docker images to run lesson code; with no names, all ten languages
npm run dev
```

Open http://localhost:3000/course. Every lesson opens without an account, and Run Code runs in Docker on your machine. Logging in is optional and needs an OAuth app; see [Logging In](./docs/README.md#logging-in).

`npm run check:setup` checks each of these steps and says how to fix the first one that isn't done. If another program has port 8080, it names a free port and the commands that move Hasura there ([Troubleshooting](./docs/README.md#troubleshooting)). With the app running, it also runs a lesson's code in every language you have images for.

With a coding agent, ask it to set up the repo. The steps it needs are in [`.agents/skills/local-setup`](./.agents/skills/local-setup/SKILL.md), which is also at `.claude/skills/local-setup` for Claude Code.

## Documentation

- [Running Skilled.dev Locally](./docs/README.md): setup step by step, environment variables, running lesson code (with or without Docker), changing lessons, tests, and troubleshooting. The running app has a shorter version at `/docs`.
- [Adding a Language](./docs/adding-a-language.md): how the code runner works, and what a new language needs.
- [The Runner Service](./docs/runner-service.md): running learners' code for a public website, on Cloudflare Containers or any Docker host.
- [Scripts](./scripts/README.md): the course seed, lesson checks and generators.
- [Publishing Guides and Tools](./docs/publishing-resources.md): resource content, editorial checks, metadata, and configuring a public deployment or fork.
- [Operating a Public Learning Site](./docs/seo-operations.md): release verification, public access checks, Search Console, learning events, and maintenance.

## Tech Stack

- Next.js 12 + React 17 + TypeScript (`src/`)
- Apollo Client + GraphQL proxy (`src/pages/api/graphql.ts`)
- Hasura GraphQL Engine v2 + Postgres 16 (`hasura/`)
- Styled Components + MDX content system
- The code runner (`src/services/server/runner/`): Docker locally; the runner service (`runner/`, a Go agent and a Cloudflare Worker) on the website
- Optional: OAuth (GitHub, Google, Facebook), Stripe, Brevo (Sendinblue) email, Sentry, Judge0

## Repo Layout

- `src/`: web app pages, API routes, UI components, services
- `src/content/lessons/`: the lessons: text, code snippets in every language, starting code, solutions and tests
- `hasura/`: Docker setup, migrations, metadata, and the course seed (`hasura/seeds/course.json`)
- `docker/runner/`, `runner/`: the code runner's images, and the runner service
- `test/conformance/`: runs every lesson's solutions and starting code in every language
- `scripts/`: the course seed, runner images, generators and lesson checks
- `docs/`: developer documentation

## About the Instructor

Skilled.dev is created and taught by [Trey Huffine](https://x.com/treyhuffine).

I have been a professional software engineer since 2015, worked as an engineer at early-stage and large startups, and interviewed hundreds of candidates while helping shape hiring processes. This curriculum reflects what consistently works in real interviews.

You can find all lessons and more free content here:

- YouTube: [youtube.com/@levelupdev](https://www.youtube.com/@levelupdev?sub_confirmation=1)
- X (Twitter): [@treyhuffine](https://x.com/treyhuffine)
- LinkedIn: [@treyhuffine](https://www.linkedin.com/in/treyhuffine)

## Contributing

Contributions are welcome. High-impact areas:

- additional lesson content and explanations
- more language support for coding problem solutions/tests ([Adding a Language](./docs/adding-a-language.md))
- developer experience improvements in local setup and tooling

Start with the [local setup](./docs/README.md). Before opening a pull request, run `npm run ts` and `npm test`, and for changes to lessons' code or the runner, the conformance suite for what you changed ([Tests and Checks](./docs/README.md#tests-and-checks)). CI runs all of them on every pull request.

## License

[MIT](./LICENSE)
