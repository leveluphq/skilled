// Trying a run again when its container didn't answer.
//
// The agent always answers with JSON, even when the program fails. Anything
// else comes from the platform: the container didn't start, no instance was
// free, or the connection dropped. The program then didn't run, or didn't
// finish, and running it again has no side effects, so the run gets one more
// fresh container.

export const ATTEMPTS = 2;
export const RETRY_DELAY_MS = 1000;

export interface Failure {
  status: number;
  message: string;
}

export const fromAgent = (response: Response) =>
  (response.headers.get('content-type') || '').startsWith('application/json');

export const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// One attempt: the agent's answer, or why there wasn't one
const attempt = async (send: () => Promise<Response>): Promise<Response | Failure> => {
  try {
    const response = await send();

    if (fromAgent(response)) {
      return response;
    }

    const text = (await response.text().catch(() => '')).trim();
    return { status: response.status, message: text.slice(0, 300) || `HTTP ${response.status}` };
  } catch (error) {
    return { status: 502, message: error instanceof Error ? error.message : String(error) };
  }
};

// `send` runs the program in a fresh container each time it's called
export const runWithRetry = async (
  send: () => Promise<Response>,
  {
    attempts = ATTEMPTS,
    wait = sleep,
  }: { attempts?: number; wait?: (ms: number) => Promise<void> } = {},
): Promise<Response> => {
  let failure: Failure = { status: 502, message: 'no attempt was made' };

  for (let i = 0; i < attempts; i += 1) {
    if (i > 0) {
      await wait(RETRY_DELAY_MS);
    }

    const result = await attempt(send);

    if (result instanceof Response) {
      return result;
    }

    failure = result;
  }

  // Out of capacity is worth trying again later; anything else is a failure
  const busy = failure.status === 503 || failure.status === 429;
  return json(busy ? 503 : 502, { error: `The run's container failed: ${failure.message}` });
};
