/**
 * Where code runs, which lessons use the new runner, and which languages
 * learners can pick as a result.
 */
import { CodingLanguage } from 'utils/constants/lesson';
import {
  getRunnerBackend,
  runnableLanguages,
  unavailableMessage,
  usesNewRunner,
} from '../settings';

const ENV = process.env;

afterEach(() => {
  process.env = { ...ENV };
});

const set = (values: Record<string, string | undefined>) => {
  process.env = {
    ...ENV,
    CODE_RUNNER: undefined,
    JUDGE0_API_KEY: undefined,
    RUNNER_V2_LESSONS: undefined,
    ...values,
  };
};

describe('getRunnerBackend', () => {
  it('runs code in Docker on a fresh clone', () => {
    set({});
    expect(getRunnerBackend()).toBe('docker');
  });

  it('uses Judge0 when the server has a key', () => {
    set({ JUDGE0_API_KEY: 'key' });
    expect(getRunnerBackend()).toBe('judge0');
  });

  it('runs code on the runner service when told to', () => {
    set({ CODE_RUNNER: 'service', JUDGE0_API_KEY: 'key' });
    expect(getRunnerBackend()).toBe('service');
  });

  it('follows CODE_RUNNER over the key', () => {
    set({ JUDGE0_API_KEY: 'key', CODE_RUNNER: 'docker' });
    expect(getRunnerBackend()).toBe('docker');
  });

  it("runs code with this machine's own toolchain when told to", () => {
    set({ CODE_RUNNER: 'system' });
    expect(getRunnerBackend()).toBe('system');
  });

  it('ignores a setting it does not know', () => {
    set({ CODE_RUNNER: 'native' });
    expect(getRunnerBackend()).toBe('docker');
  });
});

describe('usesNewRunner', () => {
  it('uses the new runner for every lesson with a spec in Docker', () => {
    set({ CODE_RUNNER: 'docker' });
    expect(usesNewRunner('count-islands', true)).toBe(true);
    expect(usesNewRunner('an-article', false)).toBe(false);
  });

  it('moves lessons over one by one on Judge0', () => {
    set({ CODE_RUNNER: 'judge0', RUNNER_V2_LESSONS: 'count-islands, walk-a-matrix' });
    expect(usesNewRunner('walk-a-matrix', true)).toBe(true);
    expect(usesNewRunner('age-sort', true)).toBe(false);

    set({ CODE_RUNNER: 'judge0', RUNNER_V2_LESSONS: 'all' });
    expect(usesNewRunner('age-sort', true)).toBe(true);
  });
});

describe('runnableLanguages', () => {
  const all = [
    CodingLanguage.Javascript,
    CodingLanguage.Typescript,
    CodingLanguage.Python,
    CodingLanguage.Java,
    CodingLanguage.Rust,
  ];

  it('offers every language when code runs in Docker', () => {
    set({ CODE_RUNNER: 'docker' });
    expect(runnableLanguages(all)).toEqual(all);
  });

  it('offers every language on the runner service', () => {
    set({ CODE_RUNNER: 'service' });
    expect(runnableLanguages(all)).toEqual(all);
    expect(usesNewRunner('age-sort', true)).toBe(true);
  });

  it('offers only what Judge0 runs on a Judge0 server', () => {
    set({ CODE_RUNNER: 'judge0' });
    expect(runnableLanguages(all)).toEqual([
      CodingLanguage.Javascript,
      CodingLanguage.Typescript,
      CodingLanguage.Python,
    ]);
  });

  it("offers only what this machine's Node.js and Python run with the system runner", () => {
    set({ CODE_RUNNER: 'system' });
    expect(runnableLanguages(all)).toEqual([
      CodingLanguage.Javascript,
      CodingLanguage.Typescript,
      CodingLanguage.Python,
    ]);
    expect(usesNewRunner('age-sort', true)).toBe(true);
  });
});

describe('unavailableMessage', () => {
  it('says a language needs Docker when the system runner is on', () => {
    set({ CODE_RUNNER: 'system' });
    expect(unavailableMessage(CodingLanguage.Java)).toBe(
      'Java runs only in Docker. With CODE_RUNNER=system, this app runs JavaScript, TypeScript and Python.',
    );
  });

  it("otherwise says the lesson doesn't have the language yet", () => {
    set({ CODE_RUNNER: 'judge0' });
    expect(unavailableMessage(CodingLanguage.Rust)).toBe("This lesson isn't available in Rust yet.");
    set({ CODE_RUNNER: 'docker' });
    expect(unavailableMessage(CodingLanguage.Go)).toBe("This lesson isn't available in Go yet.");
  });
});
