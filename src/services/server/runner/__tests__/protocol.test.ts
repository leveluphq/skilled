import { buildStdin, parseRun } from 'services/server/runner/protocol';
import { defineSpec } from 'utils/shared/runner/spec';

const NONCE = '0123456789abcdef0123456789abcdef';
const line = (message: object) => `${NONCE}${JSON.stringify(message)}\n`;

describe('buildStdin', () => {
  it('writes the nonce, then each test as JSON, keeping big integers exact', () => {
    const spec = defineSpec({
      kind: 'function',
      entry: 'f',
      params: [{ name: 'n', type: 'long' }],
      returns: 'long',
      tests: [{ description: 'big', args: [{ $int: '9223372036854775807' }], expected: 0 }],
    });

    expect(buildStdin(NONCE, spec)).toBe(
      `${NONCE}\n{"tests":[{"args":[9223372036854775807],"hidden":[]}]}\n`,
    );
  });

  it('writes a design test as its constructor arguments and operations', () => {
    const spec = defineSpec({
      kind: 'design',
      className: 'Cache',
      ctor: [{ name: 'capacity', type: 'int' }],
      methods: [{ name: 'get', params: [{ name: 'key', type: 'int' }], returns: 'int' }],
      tests: [{ description: 'x', ctorArgs: [2], ops: [['get', 1]], expected: [-1] }],
    });

    expect(buildStdin(NONCE, spec)).toBe(
      `${NONCE}\n{"tests":[{"ctorArgs":[2],"ops":[["get",1]]}]}\n`,
    );
  });
});

describe('parseRun', () => {
  it('reads each test, its result and what it printed', () => {
    const stdout =
      line({ t: 'start', i: 0 }) +
      'debug 1\n' +
      line({ t: 'result', i: 0, ok: true, out: [1, 2], ms: 0.5 }) +
      line({ t: 'start', i: 1 }) +
      line({ t: 'result', i: 1, ok: false, error: 'TypeError: x', ms: 0.1 }) +
      line({ t: 'done' });

    expect(parseRun(stdout, NONCE, 2)).toEqual({
      tests: [
        { started: true, result: { ok: true, out: [1, 2], ms: 0.5 }, logs: 'debug 1\n' },
        { started: true, result: { ok: false, error: 'TypeError: x', ms: 0.1 }, logs: '' },
      ],
      outsideLogs: '',
      done: true,
      anomalies: [],
    });
  });

  it('keeps 64-bit integers in results exact', () => {
    const stdout = `${line({ t: 'start', i: 0 })}${NONCE}{"t":"result","i":0,"ok":true,"out":-9223372036854775808}\n`;

    expect(parseRun(stdout, NONCE, 1).tests[0].result).toEqual({
      ok: true,
      out: { $int: '-9223372036854775808' },
      ms: null,
    });
  });

  it('finds the nonce mid-line, after a print with no newline', () => {
    const stdout = `${line({ t: 'start', i: 0 })}no newline${line({ t: 'result', i: 0, ok: true, out: 1 })}`;
    const run = parseRun(stdout, NONCE, 1);

    expect(run.tests[0].logs).toBe('no newline');
    expect(run.tests[0].result).toEqual({ ok: true, out: 1, ms: null });
  });

  it('treats a line without the nonce as logs, however much it looks like a result', () => {
    const stdout = `${line({ t: 'start', i: 0 })}{"t":"result","i":0,"ok":true,"out":999}\n`;
    const run = parseRun(stdout, NONCE, 1);

    expect(run.tests[0].result).toBeNull();
    expect(run.tests[0].logs).toBe('{"t":"result","i":0,"ok":true,"out":999}\n');
  });

  it('puts top-level prints outside any test', () => {
    expect(parseRun(`loaded\n${line({ t: 'start', i: 0 })}`, NONCE, 1).outsideLogs).toBe(
      'loaded\n',
    );
  });

  it('records a stop mid-test as started with no result, and later tests as not started', () => {
    const run = parseRun(
      line({ t: 'start', i: 0 }) +
        line({ t: 'result', i: 0, ok: true, out: 1 }) +
        line({ t: 'start', i: 1 }),
      NONCE,
      3,
    );

    expect(run.tests.map((test) => [test.started, test.result !== null])).toEqual([
      [true, true],
      [true, false],
      [false, false],
    ]);
    expect(run.done).toBe(false);
  });

  it.each([
    [
      'a duplicate start',
      line({ t: 'start', i: 0 }) + line({ t: 'start', i: 0 }),
      'Test 0 started out of order',
    ],
    ['a skipped test', line({ t: 'start', i: 1 }), 'Test 1 started out of order'],
    [
      'a result before its start',
      line({ t: 'result', i: 0, ok: true, out: 1 }),
      'A result for test 0 arrived out of order',
    ],
    [
      'output after done',
      line({ t: 'done' }) + line({ t: 'start', i: 0 }),
      'Output continued after the tests finished',
    ],
    [
      'an unreadable harness line',
      `${NONCE}{not json\n`,
      'The harness wrote a line that could not be read',
    ],
  ])('flags %s as an anomaly', (_label, stdout, anomaly) => {
    expect(parseRun(stdout, NONCE, 2).anomalies).toEqual([anomaly]);
  });

  it('reads invalid UTF-8 without throwing', () => {
    const stdout = Buffer.concat([
      Buffer.from(line({ t: 'start', i: 0 })),
      Buffer.from([0xff, 0xfe, 0x0a]),
    ]);

    expect(parseRun(stdout, NONCE, 1).tests[0].logs).toBe('��\n');
  });

  it('caps what one test can print', () => {
    const run = parseRun(line({ t: 'start', i: 0 }) + 'x'.repeat(200 * 1024), NONCE, 1);

    expect(run.tests[0].logs.length).toBeLessThan(70 * 1024);
    expect(run.tests[0].logs).toMatch(/output truncated/);
  });
});
