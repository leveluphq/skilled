/**
 * The runner service backend: what it sends to POST /run/{language} and how
 * it reads the answer. The real thing is checked end to end by the conformance
 * suite with CONFORMANCE_RUNNER=service (docs/runner-service.md).
 */
jest.mock('isomorphic-unfetch', () => jest.fn());

import fetch from 'isomorphic-unfetch';
import { RUN_SCRIPT } from 'services/server/runner/backends/runScript';
import { runOnService, serviceRequest } from 'services/server/runner/backends/service';
import { javaRuntime } from 'services/server/runner/runtimes/java';
import { pythonRuntime } from 'services/server/runner/runtimes/python';
import { Judge0Status } from 'utils/constants/codeRunner';

const mockFetch = fetch as unknown as jest.Mock;
const ENV = process.env;
const base64 = (text: string) => Buffer.from(text).toString('base64');

const respond = (status: number, body: unknown) =>
  mockFetch.mockResolvedValue({ status, json: async () => body });

beforeEach(() => {
  jest.clearAllMocks();
  process.env = {
    ...ENV,
    RUNNER_SERVICE_URL: 'https://runner.example/',
    RUNNER_SERVICE_SECRET: 's3cret',
  };
});

afterAll(() => {
  process.env = ENV;
});

describe('serviceRequest', () => {
  it('sends the program, its input and the run script, to compile and run in one container', () => {
    const request = serviceRequest(
      javaRuntime,
      'class Solution {}',
      'nonce\n{}',
      javaRuntime.limits,
    );

    expect(request.files).toEqual({
      'Main.java': 'class Solution {}',
      '.stdin': 'nonce\n{}',
      '.run.sh': RUN_SCRIPT,
    });
    expect(request.env).toMatchObject({ SK_PHASE: 'both', SK_RUN: javaRuntime.docker.run });
    // The compiler needs more memory than the program, and they share the container
    expect(request.memoryKb).toBe(javaRuntime.docker.compileMemoryKb);
    expect(request.outputs).toContain('.exit_status');
  });
});

describe('runOnService', () => {
  it('posts to the language with the secret, and reads the outcome', async () => {
    respond(200, {
      outputs: {
        '.exit_status': base64('0\n'),
        '.stdout': base64('hello'),
        '.stderr': base64(''),
        '.times': base64('1.0 1.25\n'),
        '.compile_status': null,
        '.compile_output': null,
      },
    });

    const outcome = await runOnService(pythonRuntime, 'print(1)', '', pythonRuntime.limits);

    expect(mockFetch).toHaveBeenCalledWith(
      'https://runner.example/run/python',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ authorization: 'Bearer s3cret' }),
      }),
    );
    expect(outcome).toMatchObject({
      statusId: Judge0Status.Accepted,
      stderr: '',
      message: '',
      timeSeconds: 0.25,
    });
    expect(outcome.stdout.toString()).toBe('hello');
  });

  it('reads a compile error', async () => {
    respond(200, {
      outputs: {
        '.compile_status': base64('1\n'),
        '.compile_output': base64('Main.java:1: error'),
      },
    });

    const outcome = await runOnService(javaRuntime, 'x', '', javaRuntime.limits);

    expect(outcome.statusId).toBe(Judge0Status.CompilationError);
    expect(outcome.compileOutput).toBe('Main.java:1: error');
  });

  it("reports the service's own error as a runner error", async () => {
    respond(502, { error: "The run's container failed: no capacity" });

    const outcome = await runOnService(pythonRuntime, 'x', '', pythonRuntime.limits);

    expect(outcome.statusId).toBe(Judge0Status.InternalError);
    expect(outcome.message).toBe(
      "The runner service couldn't run the code: The run's container failed: no capacity",
    );
  });

  it('reports a service that can’t be reached', async () => {
    mockFetch.mockRejectedValue(new Error('ECONNREFUSED'));

    const outcome = await runOnService(pythonRuntime, 'x', '', pythonRuntime.limits);

    expect(outcome.statusId).toBe(Judge0Status.InternalError);
    expect(outcome.message).toBe("The runner service couldn't be reached: ECONNREFUSED");
  });

  it('says what to set when it isn’t configured', async () => {
    delete process.env.RUNNER_SERVICE_URL;

    const outcome = await runOnService(pythonRuntime, 'x', '', pythonRuntime.limits);

    expect(outcome.message).toMatch(/Set RUNNER_SERVICE_URL and RUNNER_SERVICE_SECRET/);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
