import fs from 'fs';
import path from 'path';
import vm from 'vm';

const load = (slug: string, expression: string, globals: Record<string, unknown> = {}) => {
  const source = fs.readFileSync(
    path.join(process.cwd(), 'src/content/resources/guides', `${slug}.mdx`),
    'utf8',
  );
  const code = [...source.matchAll(/```javascript\n([\s\S]*?)```/g)].map((m) => m[1]).join('\n');
  return vm.runInNewContext(`${code}\n${expression}`, globals, { timeout: 1000 });
};
const deferred = () => {
  let resolve!: (value: unknown) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
};
afterEach(() => jest.useRealTimers());

it('round-trips published short-ID examples across alphabet boundaries and large integers', () => {
  expect(
    load(
      'url-shortener-system-design',
      `(() => {
    for (let value = 0n; value < 5000n; value++) if (decodeShortId(encodeShortId(value)) !== value) return false;
    for (const value of [62n ** 7n - 1n, 62n ** 7n, 2n ** 64n - 1n]) if (decodeShortId(encodeShortId(value)) !== value) return false;
    let invalid = 0;
    for (const operation of [() => encodeShortId(-1n), () => decodeShortId('bad!')]) {
      try { operation(); } catch (error) { if (error instanceof TypeError) invalid++; }
    }
    return invalid === 2 && encodeShortId(0n) === '0' && encodeShortId(61n) === 'Z' && encodeShortId(62n) === '10';
  })()`,
    ),
  ).toBe(true);
});

it('checks the published prototype lookup, ownership, shadowing, and receiver examples', () => {
  expect(load('javascript-prototypes', 'inspectProfile()')).toEqual({
    message: 'User: Ada',
    ownName: true,
    ownDescribe: false,
    hasDescribe: true,
    directPrototype: true,
  });
  expect(load('javascript-prototypes', 'traceShadowing()')).toEqual([
    'blue',
    'green',
    'blue',
    'blue',
  ]);
});

it('checks every named equality result instead of conflating identity, NaN, signed zero, and coercion', () => {
  expect(load('javascript-equality', 'equalityCases()')).toEqual({
    numberAndText: false,
    strictNaN: false,
    sameNaN: true,
    strictZero: true,
    sameZero: false,
    mapNaN: 'nan',
    mapZero: 'zero',
    sameObject: true,
    equalFields: false,
  });
});

it('flushes the published debounce once, releases cancellation state, and preserves reentrant pending calls', async () => {
  jest.useFakeTimers();
  const { debounce } = load('debounce-vs-throttle', '({ debounce })', { setTimeout, clearTimeout });
  const calls: unknown[][] = [];
  const receiver = { id: 3 };
  let wrapped: any;
  wrapped = debounce(function (this: unknown, ...args: unknown[]) {
    calls.push([this, ...args]);
    if (args[0] === 'again') wrapped.call(receiver, 'nested');
    return 42;
  }, 100);
  wrapped.call(receiver, 0, false);
  expect(wrapped.flush()).toBe(42);
  expect(wrapped.flush()).toBeUndefined();
  await jest.advanceTimersByTimeAsync(100);
  expect(calls).toEqual([[receiver, 0, false]]);
  wrapped();
  wrapped.cancel();
  expect(wrapped.flush()).toBeUndefined();
  wrapped.call(receiver, 'again');
  wrapped.flush();
  await jest.advanceTimersByTimeAsync(100);
  expect(calls).toEqual([
    [receiver, 0, false],
    [receiver, 'again'],
    [receiver, 'nested'],
  ]);
  expect(jest.getTimerCount()).toBe(0);
});

it('executes retry backoff with a bounded budget, capped deterministic jitter, and original errors', async () => {
  jest.useFakeTimers();
  const { retry } = load('javascript-retry-backoff', '({ retry })', { setTimeout, clearTimeout });
  const error = new Error('temporary');
  const calls: number[] = [];
  const operation = jest.fn(({ attempt }) => {
    calls.push(attempt);
    if (attempt < 3) throw error;
    return 42;
  });
  const result = retry(operation, {
    retries: 3,
    baseDelayMs: 100,
    maxDelayMs: 250,
    random: () => 0.5,
  });
  await jest.advanceTimersByTimeAsync(49);
  expect(calls).toEqual([0]);
  await jest.advanceTimersByTimeAsync(1);
  expect(calls).toEqual([0, 1]);
  await jest.advanceTimersByTimeAsync(100);
  expect(calls).toEqual([0, 1, 2]);
  await jest.advanceTimersByTimeAsync(125);
  await expect(result).resolves.toBe(42);
  expect(calls).toEqual([0, 1, 2, 3]);
  await expect(
    retry(
      () => {
        throw error;
      },
      { retries: 0 },
    ),
  ).rejects.toBe(error);
  await expect(retry(() => Promise.reject(error), { shouldRetry: () => false })).rejects.toBe(
    error,
  );
  await expect(
    retry(
      () => {
        throw error;
      },
      { shouldRetry: () => 'invalid' },
    ),
  ).rejects.toThrow(/Boolean/);
  const untouched = jest.fn();
  await expect(retry(untouched, { retries: -1 })).rejects.toThrow(/retries/);
  expect(untouched).not.toHaveBeenCalled();
});

it('clears retry timers and listeners on abort, preserving a falsy abort reason', async () => {
  jest.useFakeTimers();
  const { retry } = load('javascript-retry-backoff', '({ retry })', { setTimeout, clearTimeout });
  const controller = new AbortController();
  const operation = jest.fn(() => Promise.reject('retryable'));
  const result = retry(operation, { signal: controller.signal, random: () => 0.5 });
  const rejection = expect(result).rejects.toBe(false);
  await jest.advanceTimersByTimeAsync(0);
  expect(jest.getTimerCount()).toBe(1);
  controller.abort(false);
  await rejection;
  expect(jest.getTimerCount()).toBe(0);
  await jest.advanceTimersByTimeAsync(5000);
  expect(operation).toHaveBeenCalledTimes(1);
  const never = jest.fn();
  await expect(retry(never, { signal: controller.signal })).rejects.toBe(false);
  expect(never).not.toHaveBeenCalled();
});

it('limits active lazy tasks, preserves order, and fills a free slot without a batch barrier', async () => {
  const { mapWithLimit } = load('javascript-concurrency-limit', '({ mapWithLimit })');
  const controls = Array.from({ length: 5 }, deferred);
  const started: number[] = [];
  let active = 0,
    peak = 0;
  const result = mapWithLimit(
    controls.map((control, index) => async () => {
      started.push(index);
      active++;
      peak = Math.max(peak, active);
      try {
        return await control.promise;
      } finally {
        active--;
      }
    }),
    2,
  );
  expect(started).toEqual([0, 1]);
  controls[1].resolve('B');
  await new Promise((resolve) => setImmediate(resolve));
  expect(started).toEqual([0, 1, 2]);
  controls[2].resolve('C');
  controls[0].resolve('A');
  await new Promise((resolve) => setImmediate(resolve));
  controls[4].resolve('E');
  controls[3].resolve('D');
  await expect(result).resolves.toEqual(['A', 'B', 'C', 'D', 'E']);
  expect(peak).toBe(2);
  expect(active).toBe(0);
});

it('stops new starts after a failure, drains existing tasks, and validates sparse input before side effects', async () => {
  const { mapWithLimit } = load('javascript-concurrency-limit', '({ mapWithLimit })');
  const first = deferred(),
    second = deferred();
  const third = jest.fn();
  let settled = false;
  const result = mapWithLimit([() => first.promise, () => second.promise, third], 2);
  const rejection = expect(result).rejects.toBe(0);
  result.then(
    () => {
      settled = true;
    },
    () => {
      settled = true;
    },
  );
  first.reject(0);
  await new Promise((resolve) => setImmediate(resolve));
  expect(settled).toBe(false);
  expect(third).not.toHaveBeenCalled();
  second.resolve('drained');
  await rejection;
  expect(settled).toBe(true);
  const task = jest.fn();
  const sparse = [task, , task];
  await expect(mapWithLimit(sparse, 1)).rejects.toThrow(/factories/);
  expect(task).not.toHaveBeenCalled();
  await expect(mapWithLimit([], 0)).rejects.toThrow(/limit/);
  await expect(mapWithLimit([], 2)).resolves.toEqual([]);
});

it('copies the published data graph contract including cycles, aliases, sparse holes, symbols, and descriptors', () => {
  expect(
    load(
      'javascript-deep-clone',
      `(() => {
    const child = { score: 3 };
    const source = Object.create(null);
    source.a = child; source.b = child; source.self = source;
    source.sparse = [, undefined, child];
    const symbol = Symbol('key'); source[symbol] = child;
    Object.defineProperty(source, '__proto__', { value: child, enumerable: true });
    Object.defineProperty(source, 'hidden', { value: child, enumerable: false, writable: false });
    const result = cloneDataGraph(source);
    result.a.score = 8;
    const descriptor = Object.getOwnPropertyDescriptor(result, 'hidden');
    return result !== source && result.self === result && result.a === result.b &&
      result.a !== child && child.score === 3 && result.b.score === 8 &&
      result[symbol] === result.a && result.__proto__ === result.a &&
      Object.getPrototypeOf(result) === null && !(0 in result.sparse) &&
      (1 in result.sparse) && result.sparse[1] === undefined &&
      !descriptor.enumerable && !descriptor.writable && descriptor.value === result.a;
  })()`,
    ),
  ).toBe(true);
  expect(
    load(
      'javascript-deep-clone',
      `(() => {
    let reads = 0;
    const source = { get x() { reads++; return 1; } };
    let rejects = 0;
    for (const value of [source, new Date(), () => 1]) {
      try { cloneDataGraph(value); } catch (error) { if (error instanceof TypeError) rejects++; }
    }
    return reads === 0 && rejects === 3;
  })()`,
    ),
  ).toBe(true);
});

it('flattens without call-stack recursion while separating holes, shared branches, cycles, and leaf identity', () => {
  const { flattenArrays } = load('javascript-flatten-arrays', '({ flattenArrays })');
  const object = { id: 1 },
    shared = [1, [2]];
  const result = flattenArrays([, undefined, shared, shared, object]);
  expect(result).toEqual([undefined, 1, 2, 1, 2, object]);
  expect(result[5]).toBe(object);
  const cycle: unknown[] = [];
  cycle.push(cycle);
  expect(() => flattenArrays(cycle)).toThrow(/Cyclic/);
  let deep: unknown[] = [42];
  for (let i = 0; i < 20000; i++) deep = [deep];
  expect(flattenArrays(deep)).toEqual([42]);
  for (let seed = 0; seed < 100; seed++) {
    const input = [seed, [seed + 1, [], [undefined, seed % 3]], null];
    expect(flattenArrays(input)).toEqual(input.flat(Infinity));
  }
});

it('curries grouped calls with independent partial branches and the final receiver', () => {
  const { curry } = load('javascript-currying', '({ curry })');
  const spy = jest.fn(function (this: { id: number }, ...args: unknown[]) {
    return { id: this.id, args };
  });
  const partial = curry(spy, 3).call({ id: 1 }, 10);
  expect(spy).not.toHaveBeenCalled();
  expect(partial(20).call({ id: 2 }, 30)).toEqual({ id: 2, args: [10, 20, 30] });
  expect(partial.call({ id: 3 }, 40, 50, 60)).toEqual({ id: 3, args: [10, 40, 50, 60] });
  expect(curry((...args: unknown[]) => args, 0)()).toEqual([]);
  expect(curry((...args: unknown[]) => args, 2)()(undefined)(3)).toEqual([undefined, 3]);
  expect(() => curry(() => 0, -1)).toThrow(/arity/);
});

it('memoizes by receiver, argument identity, arity, and presence rather than truthiness', () => {
  const { memoize } = load('javascript-memoization', '({ memoize })');
  const spy = jest.fn(() => undefined);
  const fn = memoize(spy),
    owner = {},
    other = {},
    object = {};
  fn.call(owner, object);
  fn.call(owner, object);
  expect(spy).toHaveBeenCalledTimes(1);
  fn.call(other, object);
  fn.call(owner, {});
  fn.call(owner, object, undefined);
  expect(spy).toHaveBeenCalledTimes(4);
  fn.clear();
  fn.call(owner, object);
  expect(spy).toHaveBeenCalledTimes(5);
  const throws = jest.fn(() => {
    throw 0;
  });
  const failed = memoize(throws);
  expect(() => failed()).toThrow();
  expect(() => failed()).toThrow();
  expect(throws).toHaveBeenCalledTimes(2);
  for (const value of [false, 0, '', null, undefined]) {
    const compute = jest.fn(() => value),
      cached = memoize(compute);
    expect(cached()).toBe(value);
    expect(cached()).toBe(value);
    expect(compute).toHaveBeenCalledTimes(1);
  }
});

it('deduplicates pending promises and prevents an old rejection from evicting a newer entry after clear', async () => {
  const { memoizeAsyncOne } = load('javascript-memoization', '({ memoizeAsyncOne })');
  const first = deferred(),
    second = deferred();
  const operation = jest
    .fn()
    .mockReturnValueOnce(first.promise)
    .mockReturnValueOnce(second.promise);
  const fn = memoizeAsyncOne(operation);
  const old = fn('key');
  expect(fn('key')).toBe(old);
  const rejected = expect(old).rejects.toBe('old');
  await Promise.resolve();
  fn.clear();
  const current = fn('key');
  first.reject('old');
  await rejected;
  expect(fn('key')).toBe(current);
  second.resolve(42);
  await expect(current).resolves.toBe(42);
  expect(operation).toHaveBeenCalledTimes(2);
});

it('dispatches the published emitter with duplicate cleanup, snapshots, and nested once consumption', () => {
  const { Emitter } = load('javascript-event-emitter', '({ Emitter })');
  const emitter = new Emitter();
  const calls: string[] = [];
  const repeated = () => calls.push('duplicate');
  const stop = emitter.on('x', repeated);
  emitter.on('x', repeated);
  stop();
  stop();
  expect(emitter.emit('x')).toBe(1);
  emitter.off('x', repeated);
  expect(emitter.emit('x')).toBe(0);
  emitter.clear();
  calls.length = 0;
  let reentered = false;
  emitter.on('x', () => {
    calls.push('first');
    if (!reentered) {
      reentered = true;
      emitter.emit('x');
    }
  });
  emitter.once('x', () => calls.push('once'));
  emitter.emit('x');
  expect(calls).toEqual(['first', 'first', 'once']);
  emitter.clear();
  calls.length = 0;
  let removeLater = () => undefined;
  emitter.on('x', () => {
    calls.push('first');
    removeLater();
    emitter.on('x', () => calls.push('new'));
  });
  removeLater = emitter.on('x', () => calls.push('later'));
  emitter.emit('x');
  expect(calls).toEqual(['first']);
  emitter.emit('x');
  expect(calls).toEqual(['first', 'first', 'new']);
  emitter.clear();
  const error = new Error('listener');
  emitter.once('x', () => {
    throw error;
  });
  expect(() => emitter.emit('x')).toThrow(error);
  expect(emitter.emit('x')).toBe(0);
});
