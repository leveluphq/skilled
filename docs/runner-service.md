# The Runner Service

Locally, the app runs learners' code in Docker on your own machine ([6. Run Lesson Code](README.md#6-run-lesson-code)). A public website can't do that: Vercel has no Docker, and strangers' code needs stronger isolation than containers sharing a kernel. So the website sends each program to the **runner service**, and the service runs it in a fresh, locked-down container of the language's image.

The service is built so that its host can change without changing the app:

- **One HTTP API**, below. The app only knows `RUNNER_SERVICE_URL` and `RUNNER_SERVICE_SECRET`.
- **The same images everywhere.** Each language's image (the one local Docker uses) gets the runner agent added (`runner/Dockerfile.service`). The agent is a small Go binary (`runner/agent`) that runs the program exactly as local Docker does, with the same script.
- **Two hosts implemented today**: Cloudflare Containers (`runner/cloudflare`), which the website uses, and any Docker host (the agent's `dispatch` mode), the cheaper option at high volume. Anything else that can run a container per request can host it too.

Moving hosts means deploying the images somewhere else and changing `RUNNER_SERVICE_URL`.

## Using it from the app

```env
CODE_RUNNER=service
RUNNER_SERVICE_URL=https://skilled-runner.<your-subdomain>.workers.dev
RUNNER_SERVICE_SECRET=<the service's shared secret>
```

Each run happens inside the run-code request, so the request waits for it: a cold start, compiling and running take a few seconds, up to about 45 s at worst. `vercel.json` gives that route 60 seconds.

## The API

`POST /run/{language}`, where `language` is `javascript`, `typescript`, `python`, `java`, `cpp`, `csharp`, `go`, `kotlin`, `swift` or `rust`, with `Authorization: Bearer <RUNNER_SERVICE_SECRET>`:

```json
{
  "files": { "Main.java": "...", ".stdin": "...", ".run.sh": "..." },
  "env": { "SK_PHASE": "both", "SK_RUN": "java ... Main", "SK_CPU_SECONDS": "5", "...": "..." },
  "timeoutSeconds": 55,
  "outputs": [".compile_status", ".compile_output", ".exit_status", ".stdout", ".stderr", ".times"],
  "memoryKb": 1024000
}
```

The response has each requested output file base64-encoded, or `null` if the program didn't write it, and `error` if the service couldn't run it:

```json
{ "outputs": { ".exit_status": "MAo=", ".stdout": "...", ".compile_status": null } }
```

The app builds the request (`src/services/server/runner/backends/service.ts`) and reads the outputs with the same code as local Docker (`backends/runScript.ts`). So the service knows nothing about languages, lessons or tests: it writes files, runs `.run.sh` as `nobody`, and returns files. `GET /health` answers `ok`.

## Cloudflare Containers (the website)

Each run gets a fresh container, its own VM, with no internet access. The container is destroyed when the run is done. A cold start adds 1–3 seconds, sometimes more. If a container fails to start or its connection drops, the Worker tries the run once more in another container (`src/retry.ts`); a program that fails gets no second try, since that answer comes from the agent.

### One-time setup

1. In the Cloudflare dashboard, switch to the account for Skilled.
2. **Workers & Pages → Plans:** subscribe to Workers Paid ($5/month). Containers need it.
3. **Workers & Pages:** if asked, choose a `workers.dev` subdomain.
4. Copy the **Account ID** from the account's home page.
5. **My Profile → API Tokens → Create Token → Create Custom Token**. Give it these Account permissions: Workers Scripts: Edit; Containers: Edit; Cloudchamber: Edit; Workers Tail: Read; Account Settings: Read. Under Account Resources, include only the Skilled account.
6. Put both in the repo's `.env.local`, which is gitignored:

   ```env
   CLOUDFLARE_ACCOUNT_ID=<account id>
   CLOUDFLARE_API_TOKEN=<token>
   ```

   Wrangler uses this token instead of any `wrangler login`, so other Cloudflare accounts on the machine aren't affected.

### Deploy

```bash
cd runner/cloudflare
npm install
npm run deploy
```

`deploy.js` writes `wrangler.jsonc` from `scripts/runner-images.js`, with one container class per language, each with 1 vCPU (as each local run gets) and 3 GiB of memory, or 2 vCPUs and 6 GiB for Kotlin, whose compiler is a third faster with them. It then:

- builds the language images for Cloudflare's `linux/amd64` machines;
- deploys the Worker;
- sets its `RUNNER_SERVICE_SECRET`, making one in `.env.local` if there isn't one.

Then set the app's `CODE_RUNNER=service`, `RUNNER_SERVICE_URL` (the URL it prints) and `RUNNER_SERVICE_SECRET` (from `.env.local`) wherever the app runs; for the website, that's Vercel's environment variables.

To serve it at your own hostname too, put `RUNNER_CUSTOM_DOMAIN=runner.example.com` in `.env.local` before deploying. The domain's zone must be in the same Cloudflare account; Cloudflare creates the DNS record and the certificate itself. The website uses `https://runner.skilled.dev`.

Builds on an ARM Mac go through emulation, which is slow the first time; layers are cached after that.

### Limits and costs

Cloudflare allows 50 GB of images per account, and ours are about 13 GB; delete old versions with `npx wrangler containers delete` if a redeploy runs short. `RUNNER_MAX_INSTANCES` (default 20) caps the containers running at once per language. Billing is per 10 ms while a container runs: memory and disk for the whole time, CPU only while it's busy. A run keeps its container about 5 s and uses about 2 s of CPU, so it costs roughly $0.08 per 1,000 runs beyond what the $5 plan includes (about 6,000 runs a month).

## A Docker host (a VPS)

The agent's `dispatch` mode serves the same API on any Linux machine with Docker. Each run gets a fresh container from the language's service image, with no network, a read-only filesystem, `nobody`, no capabilities, and limits on CPU, memory and processes.

Use [gVisor](https://gvisor.dev) on a public server: plain containers share the host's kernel, and gVisor puts a user-space kernel in between.

1. Install Docker and gVisor (`runsc`), and register it as a Docker runtime (`runsc install`, then restart Docker).
2. Clone the repo and build the service images: `node scripts/runner-service.js build`.
3. Run the dispatcher behind HTTPS (a reverse proxy such as Caddy), with a secret:

   ```bash
   RUNNER_SERVICE_SECRET=<secret> node scripts/runner-service.js dispatch --addr 127.0.0.1:8787 --runtime runsc
   ```

   Keep it running with systemd or similar. `--concurrency` caps runs at once; it defaults to the number of CPUs.

4. Point the app's `RUNNER_SERVICE_URL` at it.

A small VPS (about €5–15 a month) handles far more runs than Cloudflare does for the same money, but you keep it patched and running.

## Other hosts

Anything that runs a container per request can host the images in `serve` mode (`ENTRYPOINT skilled-runner-agent serve`, port 8080). For example, Google Cloud Run (with one request per instance), Fly.io Machines, or AWS ECS or Lambda container images. `serve` handles one run and then refuses more (`--max-runs`), so a host that reuses containers must start a new one per run, or every run after the first fails.

Push the images from `node scripts/runner-service.js build --platform linux/amd64` to the host's registry. `node scripts/runner-service.js images` lists their tags. Then put a small router in front, as the Cloudflare Worker is: it maps `/run/{language}` to the language's container and checks the secret.

## Checking a deployment

The `Runner canary` workflow (`.github/workflows/canary.yml`) runs count-islands in every language through `https://runner.skilled.dev` once a day, with the service's secret from the repository's `RUNNER_SERVICE_SECRET`, and GitHub emails when it fails. Run it by hand from the Actions tab after a deploy.

The conformance suite can run every lesson's reference solutions, starters and harness controls through any deployment:

```bash
CONFORMANCE_RUNNER=service RUNNER_SERVICE_URL=<url> RUNNER_SERVICE_SECRET=<secret> npm run conformance
```

To try the service locally, build the images (`node scripts/runner-service.js build`), start the dispatcher (`RUNNER_SERVICE_SECRET=test node scripts/runner-service.js dispatch`) and run the suite against `http://localhost:8787`.

To try the Cloudflare Worker itself without an account, run it with `wrangler dev`, which runs each container in local Docker:

```bash
cd runner/cloudflare
RUNNER_SERVICE_SECRET=test node deploy.js --dev
```

It serves on `http://localhost:8787` too. The images are built for `linux/amd64`, as on Cloudflare, so on an ARM Mac they run under emulation: the first build takes a while, and the compiled languages run slower than they will on Cloudflare.

## Security

- **Each run is a fresh container:** a VM on Cloudflare, and gVisor on a Docker host. Nothing a program leaves behind reaches the next one.
- **Program limits:** programs run as `nobody`, with no network and no capabilities, and with limits on CPU time, wall-clock time, output size, processes and memory.
- **The shared secret** keeps others from using the service to run their code. The run-code route also limits how often each learner can run code (see the rate limits in `docs/README.md`).
- **Not sandboxed:** the app's local Docker backend is for running your own code on your own machine.
