import fs from 'fs';
import path from 'path';
import vm from 'vm';

const source = (id: string) =>
  fs.readFileSync(path.resolve(process.cwd(), 'src/content/resources', `${id}.mdx`), 'utf8');
const blocks = (id: string) =>
  Array.from(source(id).matchAll(/```javascript\n([\s\S]*?)```/g), (match) => match[1]);
const evaluate = (id: string, expression: string, sandbox: Record<string, unknown> = {}) =>
  vm.runInNewContext(`${blocks(id).join('\n')}\n${expression}`, sandbox, { timeout: 1000 });
const json = (value: unknown) => JSON.parse(JSON.stringify(value));

it('runs the published JavaScript queue through compaction, empty/refill histories, and arbitrary values', () => {
  const { Queue } = evaluate('guides/javascript-queue', '({ Queue })');
  const queue = new Queue();
  expect(queue.dequeue()).toEqual({ found: false });
  const object = { id: 1 };
  for (const value of [undefined, null, false, 0, object]) queue.enqueue(value);
  for (const value of [undefined, null, false, 0, object]) {
    const result = queue.dequeue();
    expect(result.found).toBe(true);
    expect(Object.prototype.hasOwnProperty.call(result, 'value')).toBe(true);
    expect(result.value).toBe(value);
  }
  expect(queue.size).toBe(0);
  for (let value = 0; value < 6000; value += 1) queue.enqueue(value);
  for (let value = 0; value < 4000; value += 1) expect(queue.dequeue().value).toBe(value);
  expect(queue.items.length).toBeLessThan(6000);
  for (let value = 6000; value < 8000; value += 1) queue.enqueue(value);
  for (let value = 4000; value < 8000; value += 1) expect(queue.dequeue().value).toBe(value);
  expect(queue.size).toBe(0);
  expect(queue.items.length).toBe(0);
  queue.enqueue(42);
  expect(queue.dequeue()).toEqual({ found: true, value: 42 });
});

it('uses the published queue in BFS with cycles, missing keys, undefined labels, and object identity', () => {
  const { bfsOrder } = evaluate('guides/javascript-queue', '({ bfsOrder })');
  const graph = new Map<unknown, unknown[]>([
    [undefined, ['B', 'C']],
    ['B', [undefined, 'D']],
    ['C', ['D']],
  ]);
  expect(bfsOrder(graph, undefined)).toEqual([undefined, 'B', 'C', 'D']);
  expect(bfsOrder(new Map(), 'missing')).toEqual(['missing']);
  const first = { id: 1 },
    second = { id: 1 };
  const objects = bfsOrder(
    new Map([
      [first, [second]],
      [second, [first]],
    ]),
    first,
  );
  expect(objects).toHaveLength(2);
  expect(objects[0]).toBe(first);
  expect(objects[1]).toBe(second);
});

const smallSignedArrays: number[][] = [[]];
for (let length = 1; length <= 4; length += 1) {
  for (let code = 0; code < 3 ** length; code += 1) {
    let rest = code;
    const values: number[] = [];
    for (let i = 0; i < length; i += 1) {
      values.push((rest % 3) - 1);
      rest = Math.floor(rest / 3);
    }
    smallSignedArrays.push(values);
  }
}

it('checks published prefix queries and signed subarray counts against exhaustive scans', () => {
  const { buildPrefix, rangeSum, countSubarraysSumK } = evaluate(
    'patterns/prefix-sums',
    '({ buildPrefix, rangeSum, countSubarraysSumK })',
  );
  for (const values of smallSignedArrays) {
    const prefix = buildPrefix(values);
    expect(prefix).toHaveLength(values.length + 1);
    for (let left = 0; left <= values.length; left += 1)
      for (let right = left; right <= values.length; right += 1)
        expect(rangeSum(prefix, left, right)).toBe(
          values.slice(left, right).reduce((a, b) => a + b, 0),
        );
    for (const target of [-2, -1, 0, 1, 2]) {
      let expected = 0;
      for (let start = 0; start < values.length; start += 1)
        for (let end = start + 1; end <= values.length; end += 1)
          if (values.slice(start, end).reduce((a, b) => a + b, 0) === target) expected += 1;
      expect(countSubarraysSumK(values, target)).toBe(expected);
    }
  }
  expect(() => rangeSum([0, 1], -1, 1)).toThrow();
  expect(() => rangeSum([0, 1], 1, 0)).toThrow();
  expect(() => rangeSum([0, 1], 0, 2)).toThrow();
});

it('tests every small monotone boundary and duplicate-array lower/upper bounds in the published search', () => {
  const { firstTrue, lowerBound, upperBound, equalRange } = evaluate(
    'patterns/binary-search',
    '({ firstTrue, lowerBound, upperBound, equalRange })',
  );
  for (let length = 0; length <= 32; length += 1)
    for (let boundary = 0; boundary <= length; boundary += 1) {
      let calls = 0;
      expect(
        firstTrue(length, (index: number) => {
          expect(index).toBeGreaterThanOrEqual(0);
          expect(index).toBeLessThan(length);
          calls += 1;
          return index >= boundary;
        }),
      ).toBe(boundary);
      expect(calls).toBeLessThanOrEqual(Math.ceil(Math.log2(length + 1)));
    }
  for (const input of smallSignedArrays) {
    const values = [...input].sort((a, b) => a - b);
    for (const target of [-2, -1, 0, 1, 2]) {
      const lower = values.findIndex((value) => value >= target);
      const upper = values.findIndex((value) => value > target);
      const expected = [lower < 0 ? values.length : lower, upper < 0 ? values.length : upper];
      expect(lowerBound(values, target)).toBe(expected[0]);
      expect(upperBound(values, target)).toBe(expected[1]);
      expect(json(equalRange(values, target))).toEqual(expected);
    }
  }
  expect(() => firstTrue(-1, () => true)).toThrow();
});

it('checks published subset and permutation outputs for coverage, branch independence, and input preservation', () => {
  const { subsets, permutations } = evaluate(
    'patterns/backtracking',
    '({ subsets, permutations })',
  );
  for (let length = 0; length <= 6; length += 1) {
    const values = Array.from({ length }, (_, i) => i);
    const actual = json(subsets(values)) as number[][];
    const masks = actual
      .map((result) => result.reduce((mask, value) => mask | (1 << value), 0))
      .sort((a, b) => a - b);
    expect(masks).toEqual(Array.from({ length: 2 ** length }, (_, i) => i));
    expect(actual.every((result) => new Set(result).size === result.length)).toBe(true);
    const arrangements = json(permutations(values)) as number[][];
    const factorial = values.reduce((count, _, i) => count * (i + 1), 1);
    expect(arrangements).toHaveLength(factorial);
    expect(new Set(arrangements.map((result) => JSON.stringify(result))).size).toBe(factorial);
    expect(
      arrangements.every(
        (result) => JSON.stringify([...result].sort((a, b) => a - b)) === JSON.stringify(values),
      ),
    ).toBe(true);
    expect(values).toEqual(Array.from({ length }, (_, i) => i));
  }
  const saved = subsets([1, 2]);
  const before = json(saved[1]);
  saved[0].push(99);
  expect(json(saved[1])).toEqual(before);
  expect(new Set(saved).size).toBe(saved.length);
  const repeated = permutations([1, 1]);
  expect(json(repeated)).toEqual([
    [1, 1],
    [1, 1],
  ]);
  expect(repeated[0]).not.toBe(repeated[1]);
});

it('checks published monotonic-stack equality and distance rules against direct scans', () => {
  const { nextGreaterDistances, stockSpans } = evaluate(
    'patterns/monotonic-stack',
    '({ nextGreaterDistances, stockSpans })',
  );
  for (const values of smallSignedArrays) {
    const expectedDistances = values.map((value, index) => {
      for (let j = index + 1; j < values.length; j += 1) if (values[j] > value) return j - index;
      return 0;
    });
    const expectedSpans = values.map((value, index) => {
      let j = index - 1;
      while (j >= 0 && values[j] <= value) j -= 1;
      return index - j;
    });
    expect(json(nextGreaterDistances(values))).toEqual(expectedDistances);
    expect(json(stockSpans(values))).toEqual(expectedSpans);
  }
});

it('checks the published heap through interleaved updates and stream top-K against sorting', () => {
  const { MinHeap, largestK } = evaluate(
    'patterns/heaps-and-priority-queues',
    '({ MinHeap, largestK })',
  );
  const heap = new MinHeap();
  const baseline: number[] = [];
  expect(heap.peek()).toBeUndefined();
  expect(heap.pop()).toBeUndefined();
  const values = Array.from({ length: 150 }, (_, i) => ((i * 37) % 41) - 20);
  for (let i = 0; i < values.length; i += 1) {
    heap.push(values[i]);
    baseline.push(values[i]);
    baseline.sort((a, b) => a - b);
    if (i % 3 === 0) expect(heap.pop()).toBe(baseline.shift());
    expect(heap.peek()).toBe(baseline[0]);
    expect(heap.size).toBe(baseline.length);
    for (let child = 1; child < heap.values.length; child += 1)
      expect(heap.values[Math.floor((child - 1) / 2)]).toBeLessThanOrEqual(heap.values[child]);
  }
  while (baseline.length) expect(heap.pop()).toBe(baseline.shift());
  expect(heap.pop()).toBeUndefined();
  for (const input of smallSignedArrays)
    for (const k of [0, 1, 2, 3, 6]) {
      const actual = [...largestK(input, k)].sort((a: number, b: number) => b - a);
      expect(actual).toEqual([...input].sort((a, b) => b - a).slice(0, k));
    }
  expect(() => heap.push(NaN)).toThrow();
  expect(() => largestK([Infinity], 0)).toThrow();
  expect(() => largestK(values, -1)).toThrow();
  function* stream() {
    yield 8;
    yield 1;
    yield 8;
    yield -3;
  }
  expect([...largestK(stream(), 2)].sort()).toEqual([8, 8]);
});

it('runs the actual published Two Sum examples on duplicates, missing answers, and index zero', () => {
  for (const values of [[], [3], [3, 3], [2, 7, 11, 15], [-2, 1, 4, 9]]) {
    for (const target of [0, 6, 9]) {
      const result = evaluate(
        'guides/explain-your-interview-solution',
        `twoSum(${JSON.stringify(values)}, ${target})`,
      );
      const baseline = evaluate(
        'guides/explain-your-interview-solution',
        `twoSumPairs(${JSON.stringify(values)}, ${target})`,
      );
      if (baseline === null) expect(result).toBeNull();
      else {
        expect(result[0]).not.toBe(result[1]);
        expect(values[result[0]] + values[result[1]]).toBe(target);
      }
    }
  }
});

it('checks sliding windows against a direct fixed-window reference and known text cases', () => {
  for (const values of [[-8, -2, -3], [4, -1, 2, 7, -3], [0], []]) {
    for (let k = 1; k <= values.length; k += 1) {
      const expected = Math.max(
        ...values
          .slice(0, values.length - k + 1)
          .map((_, i) => values.slice(i, i + k).reduce((a, b) => a + b, 0)),
      );
      expect(
        evaluate('patterns/sliding-window', `maxFixedWindowSum(${JSON.stringify(values)}, ${k})`),
      ).toBe(expected);
    }
  }
  for (const [text, expected] of [
    ['', 0],
    ['abba', 2],
    ['abcabcbb', 3],
    ['🙂a🙂', 2],
  ] as const)
    expect(
      evaluate('patterns/sliding-window', `longestUniqueLength(${JSON.stringify(text)})`),
    ).toBe(expected);
});

it('checks all three DP versions against exhaustive subsets independently of their recurrence', () => {
  const arrays = [
    [],
    [-3],
    [-2, -5, -1],
    [4, 5, 4],
    [2, 7, 9, 3, 1],
    [0, 0, 0],
    [8, -3, 2, 9, -1, 4],
  ];
  for (const values of arrays) {
    let expected = 0;
    for (let bits = 0; bits < 1 << values.length; bits += 1) {
      if ((bits & (bits << 1)) !== 0) continue;
      const sum = values.reduce((total, value, i) => total + (bits & (1 << i) ? value : 0), 0);
      expected = Math.max(expected, sum);
    }
    for (const name of ['maxNonAdjacentSum', 'maxNonAdjacentSumTable', 'maxNonAdjacentSumCompact'])
      expect(evaluate('patterns/dynamic-programming', `${name}(${JSON.stringify(values)})`)).toBe(
        expected,
      );
  }
});

it('checks the published promise aggregator with empty, mixed, reversed-completion and rejecting inputs', async () => {
  expect(json(await evaluate('guides/implement-promise-all', 'collectAll([])'))).toEqual([]);
  expect(
    json(
      await evaluate('guides/implement-promise-all', 'collectAll([0, false, Promise.resolve(7)])'),
    ),
  ).toEqual([0, false, 7]);
  expect(json(await evaluate('guides/implement-promise-all', 'checkCompletionOrder()'))).toEqual([
    'first',
    'second',
    7,
  ]);
  await expect(
    evaluate('guides/implement-promise-all', 'collectAll([Promise.reject(new Error("failure"))])'),
  ).rejects.toThrow('failure');
  await expect(evaluate('guides/implement-promise-all', 'collectAll(42)')).rejects.toThrow();
});

it('verifies the published event-loop output using a controlled timer queue', async () => {
  const timers: (() => void)[] = [];
  const captured = evaluate(
    'guides/javascript-event-loop',
    '({ output, order, trace, pending, messages })',
    { setTimeout: (callback: () => void) => timers.push(callback) },
  );
  await captured.pending;
  await Promise.resolve();
  await Promise.resolve();
  timers.forEach((run) => run());
  expect(json(captured.output)).toEqual(['start', 'end', 'promise', 'timer']);
  expect(json(captured.order)).toEqual(['first', 'second', 'nested', 'timer']);
  expect(json(captured.trace)).toEqual([
    'before call',
    'inside before await',
    'after call',
    'inside after await',
  ]);
  expect(json(captured.messages)).toEqual(['executor', 'script', 'ready']);
});
