import { Container } from '@cloudflare/containers';
import { json, runWithRetry } from './retry';
import { authorized, bindingFor, Language, languageFromPath } from './routing';

// The runner service on Cloudflare Containers (docs/runner-service.md).
// POST /run/{language} runs one lesson program in a fresh container of the
// language's image (runner/Dockerfile.service: the language image plus the
// runner agent), then destroys the container. Each container is its own VM,
// with no internet, so programs can't see each other or reach out.
//
// This Worker is only routing: the agent inside the image does the work, and
// the app speaks the same API to any other host (the agent's dispatch mode on
// a Docker host, say). Moving off Cloudflare doesn't touch it or the app.

class LanguageContainer extends Container {
  defaultPort = 8080;
  // Each run destroys its container when it's done; this only cleans up after
  // a run whose Worker died before it could
  sleepAfter = '2m';
  enableInternet = false;
}

// One class per language: Cloudflare binds each class to one image
export class JavascriptRunner extends LanguageContainer {}
export class TypescriptRunner extends LanguageContainer {}
export class PythonRunner extends LanguageContainer {}
export class JavaRunner extends LanguageContainer {}
export class CppRunner extends LanguageContainer {}
export class CsharpRunner extends LanguageContainer {}
export class GoRunner extends LanguageContainer {}
export class KotlinRunner extends LanguageContainer {}
export class SwiftRunner extends LanguageContainer {}
export class RustRunner extends LanguageContainer {}

type Env = {
  RUNNER_SERVICE_SECRET: string;
} & Record<Uppercase<Language>, DurableObjectNamespace<LanguageContainer>>;

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (request.method === 'GET' && pathname === '/health') {
      return new Response('ok');
    }

    const language = languageFromPath(pathname);

    if (request.method !== 'POST' || !language) {
      return json(404, { error: 'Not found' });
    }

    if (!authorized(request.headers.get('authorization'), env.RUNNER_SERVICE_SECRET)) {
      return json(401, { error: 'Unauthorized' });
    }

    const namespace = env[bindingFor(language)];
    const body = await request.arrayBuffer();

    // A fresh container for every run, and for a second try if one fails
    // (src/retry.ts)
    return runWithRetry(async () => {
      const container = namespace.get(namespace.newUniqueId());

      try {
        const response = await container.fetch(
          new Request('http://container/run', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body,
          }),
        );
        // Read all of it before the container goes
        return new Response(await response.arrayBuffer(), response);
      } finally {
        ctx.waitUntil(container.destroy().catch(() => undefined));
      }
    });
  },
} satisfies ExportedHandler<Env>;
