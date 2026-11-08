import fetch from 'isomorphic-unfetch';
import { LanguageRuntime, Limits } from '../runtimes/types';
import { RunOutcome } from '../verdict';
import {
  COMPILE_SECONDS,
  RUN_OUTPUTS,
  RUN_SCRIPT,
  internalError,
  outcomeFromOutputs,
  scriptEnv,
} from './runScript';

// Runs a program on the runner service (docs/runner-service.md): the language
// images with the runner agent, behind POST /run/{language}. Cloudflare
// Containers hosts it (runner/cloudflare), and a Docker host can, with the
// agent's dispatcher; the app only knows RUNNER_SERVICE_URL and
// RUNNER_SERVICE_SECRET, so moving hosts changes nothing here.

// A new container can take a while to start (Cloudflare's cold starts)
const START_ALLOWANCE_SECONDS = 45;

interface ServiceResponse {
  outputs?: Record<string, string | null>;
  error?: string;
}

export const serviceRequest = (
  runtime: LanguageRuntime,
  source: string,
  stdin: string,
  limits: Limits,
) => ({
  files: { [runtime.docker.sourceFile]: source, '.stdin': stdin, '.run.sh': RUN_SCRIPT },
  // One container compiles and runs, so it gets the larger of the two
  env: scriptEnv(runtime, limits, 'both'),
  timeoutSeconds: COMPILE_SECONDS + limits.wallSeconds + 15,
  outputs: RUN_OUTPUTS,
  memoryKb: Math.max(limits.memoryKb, runtime.docker.compileMemoryKb || 0),
});

export const runOnService = async (
  runtime: LanguageRuntime,
  source: string,
  stdin: string,
  limits: Limits = runtime.limits,
): Promise<RunOutcome> => {
  const url = process.env.RUNNER_SERVICE_URL;
  const secret = process.env.RUNNER_SERVICE_SECRET;

  if (!url || !secret) {
    return internalError(
      'Set RUNNER_SERVICE_URL and RUNNER_SERVICE_SECRET to run code on the runner service',
    );
  }

  const request = serviceRequest(runtime, source, stdin, limits);
  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(),
    (request.timeoutSeconds + START_ALLOWANCE_SECONDS) * 1000,
  );

  let status: number;
  let body: ServiceResponse | null = null;

  try {
    const response = await fetch(
      `${url.replace(/\/+$/, '')}/run/${runtime.language.toLowerCase()}`,
      {
        method: 'POST',
        headers: { authorization: `Bearer ${secret}`, 'content-type': 'application/json' },
        body: JSON.stringify(request),
        signal: controller.signal,
      } as RequestInit,
    );
    status = response.status;
    body = (await response.json().catch(() => null)) as ServiceResponse | null;
  } catch (error) {
    return internalError(
      `The runner service couldn't be reached: ${error instanceof Error ? error.message : error}`,
    );
  } finally {
    clearTimeout(timer);
  }

  if (status !== 200 || !body || body.error || !body.outputs) {
    return internalError(
      `The runner service couldn't run the code: ${(body && body.error) || `HTTP ${status}`}`,
    );
  }

  const outputs = body.outputs;
  return outcomeFromOutputs((name) => {
    const encoded = outputs[name];
    return typeof encoded === 'string' ? Buffer.from(encoded, 'base64') : null;
  }, limits);
};
