import assert from 'node:assert/strict';
import { test } from 'node:test';
import { json, runWithRetry } from '../src/retry.ts';

const noWait = async () => undefined;

const sender = (answers: Array<Response | Error>) => {
  const calls = { count: 0 };
  const send = async () => {
    const answer = answers[calls.count];
    calls.count += 1;
    if (answer instanceof Error) {
      throw answer;
    }
    return answer;
  };
  return { send, calls };
};

test("returns the agent's answer from the first container", async () => {
  const { send, calls } = sender([json(200, { outputs: {} })]);

  const response = await runWithRetry(send, { wait: noWait });

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { outputs: {} });
  assert.equal(calls.count, 1);
});

test("returns the agent's errors as they are, without running the program again", async () => {
  const { send, calls } = sender([
    json(409, { error: 'this container has already run its program' }),
  ]);

  const response = await runWithRetry(send, { wait: noWait });

  assert.equal(response.status, 409);
  assert.equal(calls.count, 1);
});

test("tries a fresh container when one doesn't start", async () => {
  const { send, calls } = sender([
    new Response('Failed to start container: boom', { status: 500 }),
    json(200, { outputs: {} }),
  ]);

  const response = await runWithRetry(send, { wait: noWait });

  assert.equal(response.status, 200);
  assert.equal(calls.count, 2);
});

test('tries a fresh container when the connection to one fails', async () => {
  const { send, calls } = sender([
    new Error('Network connection lost.'),
    json(200, { outputs: {} }),
  ]);

  const response = await runWithRetry(send, { wait: noWait });

  assert.equal(response.status, 200);
  assert.equal(calls.count, 2);
});

test('gives up after two containers, with the reason as JSON', async () => {
  const { send, calls } = sender([
    new Response('Failed to start container: boom', { status: 500 }),
    new Response('Failed to start container: boom again', { status: 500 }),
  ]);

  const response = await runWithRetry(send, { wait: noWait });

  assert.equal(response.status, 502);
  assert.deepEqual(await response.json(), {
    error: "The run's container failed: Failed to start container: boom again",
  });
  assert.equal(calls.count, 2);
});

test('says the service is busy when no container is free', async () => {
  const { send } = sender([
    new Response('There is no Container instance available at this time.', { status: 503 }),
    new Response('There is no Container instance available at this time.', { status: 503 }),
  ]);

  const response = await runWithRetry(send, { wait: noWait });

  assert.equal(response.status, 503);
});

test('waits a moment before trying again', async () => {
  const waits: number[] = [];
  const { send } = sender([new Response('nope', { status: 500 }), json(200, { outputs: {} })]);

  await runWithRetry(send, { wait: async (ms) => void waits.push(ms) });

  assert.deepEqual(waits, [1000]);
});
