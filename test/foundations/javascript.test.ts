import fs from 'fs';
import path from 'path';
import os from 'os';
import vm from 'vm';
import ts from 'typescript';

const root = path.join(process.cwd(), 'src/content/lesson-walkthroughs');
const names: Record<string, string> = {
  'why-does-javascript-get-its-own-topic': 'parseScore',
  'javascript-interview-questions': 'scopeIdentityQuiz',
  'fix-this': 'Presenter, meetingCallbacks',
  'array-methods': 'summarize',
  'pub-sub-and-event-driven-programming': 'Dispatcher',
  'build-a-javascript-promise': 'TeachingPromise',
  debounce: 'debounce',
  throttle: 'throttle',
};
function code(lesson: string, language: string) {
  const source = fs.readFileSync(
    path.join(root, 'foundations/examples', lesson, `${language}.mdx`),
    'utf8',
  );
  const match = source.match(/```\w+\n([\s\S]*?)```/)!;
  expect(match).toBeTruthy();
  if (process.env.FOUNDATION_SOURCE_ONLY !== '1')
    expect(fs.readFileSync(path.join(root, lesson, `${language}.mdx`), 'utf8')).toContain(
      `\`\`\`${language}\n${match[1].trimEnd()}\n\`\`\``,
    );
  return match[1];
}
function api(lesson: string, language: string): any {
  const source = code(lesson, language);
  const script =
    language === 'typescript'
      ? ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2020 } })
          .outputText
      : source;
  const context = vm.createContext({ setTimeout, clearTimeout });
  vm.runInContext(script + `\nglobalThis.api={${names[lesson]}}`, context);
  return context.api;
}
afterEach(() => jest.useRealTimers());
for (const language of ['javascript', 'typescript'])
  describe(language, () => {
    it('validates untrusted values before treating them as scores', () => {
      const { parseScore } = api('why-does-javascript-get-its-own-topic', language);
      for (const input of [null, undefined, '8', {}, [], true, NaN, Infinity, -1, 101])
        expect(parseScore(input)).toBeNull();
      for (const input of [0, 8, 99.5, 100]) expect(parseScore(input)).toBe(input);
    });
    it('demonstrates live bindings, identity, and NaN equality', () => {
      expect(api('javascript-interview-questions', language).scopeIdentityQuiz()).toEqual({
        originalCount: 2,
        reboundCount: 9,
        varResults: [3, 3, 3],
        letResults: [0, 1, 2],
        nanEqualsItself: false,
        nanSameValue: true,
        distinctObjectsEqual: false,
      });
    });
    it('preserves the presenter receiver and each seat binding', () => {
      const { Presenter, meetingCallbacks } = api('fix-this', language);
      const presenter = new Presenter('Ada');
      const callbacks = meetingCallbacks(presenter, ['Lin', 'Grace']);
      expect(callbacks.readPresenter()).toBe('Ada');
      presenter.name = 'Alan';
      expect(callbacks.readPresenter()).toBe('Alan');
      expect(callbacks.seats.map((read: () => string) => read())).toEqual([
        'Seat 1: Lin',
        'Seat 2: Grace',
      ]);
      expect(meetingCallbacks(presenter, []).seats).toEqual([]);
    });
    it('handles empty and mixed arrays without mutating them', () => {
      const { summarize } = api('array-methods', language);
      expect(summarize([])).toEqual({
        doubled: [],
        positives: [],
        hasZero: false,
        firstPositive: null,
        allNonNegative: true,
        anyNegative: false,
      });
      const values = Object.freeze([-2, 0, 3, 1]);
      expect(summarize(values)).toEqual({
        doubled: [-4, 0, 6, 2],
        positives: [3, 1],
        hasZero: true,
        firstPositive: 3,
        allNonNegative: false,
        anyNegative: true,
      });
    });
    it('dispatches duplicate subscriptions independently, including prototype-like event names', () => {
      const { Dispatcher } = api('pub-sub-and-event-driven-programming', language);
      const bus = new Dispatcher();
      const read = jest.fn();
      const stop = bus.subscribe('__proto__', read);
      bus.subscribe('__proto__', read);
      bus.publish('__proto__', 0);
      expect(read.mock.calls).toEqual([[0], [0]]);
      stop();
      stop();
      bus.publish('__proto__', false);
      expect(read.mock.calls).toEqual([[0], [0], [false]]);
      bus.publish('missing', 42);
      expect(read).toHaveBeenCalledTimes(3);
    });
    it('uses a publication snapshot and stops on synchronous listener errors', () => {
      const { Dispatcher } = api('pub-sub-and-event-driven-programming', language);
      const bus = new Dispatcher();
      const log: string[] = [];
      let stop = () => {};
      bus.subscribe('e', () => {
        log.push('first');
        stop();
        bus.subscribe('e', () => log.push('new'));
      });
      stop = bus.subscribe('e', () => log.push('second'));
      bus.publish('e', null);
      expect(log).toEqual(['first', 'second']);
      log.length = 0;
      bus.publish('e', null);
      expect(log).toEqual(['first', 'new']);
      bus.subscribe('error', () => {
        throw new Error('boom');
      });
      bus.subscribe('error', () => log.push('unreached'));
      expect(() => bus.publish('error', null)).toThrow('boom');
      expect(log).not.toContain('unreached');
    });
    it('settles once and asynchronously delivers early and late observers', () => {
      jest.useFakeTimers();
      const { TeachingPromise } = api('build-a-javascript-promise', language);
      const log: unknown[] = [];
      let resolve: any, reject: any;
      const promise = new TeachingPromise((yes: any, no: any) => {
        resolve = yes;
        reject = no;
      });
      promise.observe(
        (value: any) => log.push(value),
        (reason: any) => log.push(reason),
      );
      resolve(0);
      reject('ignored');
      resolve(99);
      promise.observe(
        (value: any) => log.push(value),
        (reason: any) => log.push(reason),
      );
      expect(log).toEqual([]);
      jest.runAllTimers();
      expect(log).toEqual([0, 0]);
      promise.observe(
        (value: any) => log.push(value),
        () => {},
      );
      expect(log).toEqual([0, 0]);
      jest.runAllTimers();
      expect(log).toEqual([0, 0, 0]);
    });
    it('catches executor errors and retains the first settlement', () => {
      jest.useFakeTimers();
      const { TeachingPromise } = api('build-a-javascript-promise', language);
      const log: unknown[] = [];
      new TeachingPromise(() => {
        throw 'executor failure';
      }).observe(
        () => log.push('bad'),
        (reason: any) => log.push(reason),
      );
      new TeachingPromise((resolve: any) => {
        resolve(false);
        throw 'late error';
      }).observe(
        (value: any) => log.push(value),
        () => log.push('bad'),
      );
      jest.runAllTimers();
      expect(log).toEqual(['executor failure', false]);
    });
    it('debounces the latest args and receiver; cancel and flush release pending work', () => {
      jest.useFakeTimers();
      const { debounce } = api('debounce', language);
      const log: unknown[] = [];
      const wrapped = debounce(function (this: any, value: any) {
        log.push([this.id, value]);
        return value;
      }, 100);
      wrapped.call({ id: 1 }, 'a');
      jest.advanceTimersByTime(80);
      wrapped.call({ id: 2 }, 0);
      jest.advanceTimersByTime(99);
      expect(log).toEqual([]);
      jest.advanceTimersByTime(1);
      expect(log).toEqual([[2, 0]]);
      wrapped(false);
      wrapped.cancel();
      jest.runAllTimers();
      expect(log).toHaveLength(1);
      wrapped.call({ id: 3 }, false);
      expect(wrapped.flush()).toBe(false);
      expect(wrapped.flush()).toBeUndefined();
      jest.runAllTimers();
      expect(log).toEqual([
        [2, 0],
        [3, false],
      ]);
    });
    it('keeps newly scheduled debounced work during callback reentry', () => {
      jest.useFakeTimers();
      const { debounce } = api('debounce', language);
      const log: number[] = [];
      const wrapped = debounce((value: number) => {
        log.push(value);
        if (value === 1) wrapped(2);
      }, 10);
      wrapped(1);
      jest.advanceTimersByTime(10);
      expect(log).toEqual([1]);
      jest.advanceTimersByTime(10);
      expect(log).toEqual([1, 2]);
    });
    it('throttles leading and latest trailing calls without moving the existing deadline', () => {
      jest.useFakeTimers();
      const { throttle } = api('throttle', language);
      const log: unknown[] = [];
      const wrapped = throttle(function (this: any, value: any) {
        log.push([this.id, value]);
      }, 100);
      wrapped.call({ id: 1 }, 'a');
      jest.advanceTimersByTime(20);
      wrapped.call({ id: 2 }, false);
      jest.advanceTimersByTime(60);
      wrapped.call({ id: 3 }, 0);
      expect(log).toEqual([[1, 'a']]);
      jest.advanceTimersByTime(20);
      expect(log).toEqual([
        [1, 'a'],
        [3, 0],
      ]);
      jest.advanceTimersByTime(100);
      wrapped.call({ id: 4 }, undefined);
      expect(log).toEqual([
        [1, 'a'],
        [3, 0],
        [4, undefined],
      ]);
      wrapped.call({ id: 5 }, 'discarded');
      wrapped.cancel();
      jest.runAllTimers();
      expect(log).toHaveLength(3);
    });
    it('handles a single throttle event, callback reentry, and invalid delays', () => {
      jest.useFakeTimers();
      const { throttle } = api('throttle', language);
      const { debounce } = api('debounce', language);
      const log: number[] = [];
      const wrapped = throttle((value: number) => {
        log.push(value);
        if (value === 1) wrapped(2);
      }, 10);
      wrapped(1);
      expect(log).toEqual([1]);
      jest.advanceTimersByTime(10);
      expect(log).toEqual([1, 2]);
      jest.runAllTimers();
      expect(log).toEqual([1, 2]);
      wrapped(3);
      jest.runAllTimers();
      expect(log).toEqual([1, 2, 3]);
      for (const wait of [-1, NaN, Infinity, 2147483648])
        for (const wrap of [throttle, debounce]) expect(() => wrap(() => {}, wait)).toThrow();
      for (const wrap of [throttle, debounce]) expect(() => wrap(null, 1)).toThrow();
    });
  });
it('type-checks all eight complete TypeScript examples under strict settings', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'skilled-foundation-types-'));
  try {
    const file = path.join(dir, 'examples.ts');
    fs.writeFileSync(
      file,
      Object.keys(names)
        .map((lesson) => code(lesson, 'typescript'))
        .join('\n'),
    );
    const program = ts.createProgram([file], {
      noEmit: true,
      strict: true,
      target: ts.ScriptTarget.ES2020,
      types: [],
      lib: ['lib.es2020.d.ts', 'lib.dom.d.ts'],
    });
    const diagnostics = ts.getPreEmitDiagnostics(program);
    expect(diagnostics.map((d) => ts.flattenDiagnosticMessageText(d.messageText, '\n'))).toEqual(
      [],
    );
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
