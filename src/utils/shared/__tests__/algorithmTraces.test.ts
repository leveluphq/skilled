import { parseSmallNumbers, sortingTrace, recurrenceTrace, pointerTrace } from '../algorithmTraces';

function arrays(length: number): number[][] {
  return length === 0
    ? [[]]
    : arrays(length - 1).flatMap((tail) => [-1, 0, 1].map((value) => [value, ...tail]));
}

describe('sorting demonstrations', () => {
  it('sorts every small array without changing the input, with monotone counters and independent snapshots', () => {
    for (let n = 0; n <= 6; n++)
      for (const input of arrays(n)) {
        const expected = [...input].sort((a, b) => a - b);
        for (const method of ['insertion', 'selection', 'bubble'] as const) {
          const saved = [...input];
          const trace = sortingTrace(input, method);
          expect(trace[trace.length - 1].values).toEqual(expected);
          expect(input).toEqual(saved);
          expect(trace[0].values).toEqual(saved);
          for (let i = 1; i < trace.length; i++) {
            expect(trace[i].comparisons).toBeGreaterThanOrEqual(trace[i - 1].comparisons);
            expect(trace[i].writes).toBeGreaterThanOrEqual(trace[i - 1].writes);
          }
          if (method === 'selection')
            expect(trace[trace.length - 1].comparisons).toBe(Math.max(0, (n * (n - 1)) / 2));
        }
      }
  });
  it('distinguishes sorted-input early exits from unconditional selection scans', () => {
    expect(sortingTrace([1, 2, 3, 4], 'bubble').slice(-1)[0].comparisons).toBe(3);
    expect(sortingTrace([1, 2, 3, 4], 'selection').slice(-1)[0].comparisons).toBe(6);
    expect(sortingTrace([1, 2, 3, 4], 'insertion').slice(-1)[0].writes).toBe(3);
  });
  it('rejects partial, oversized, noninteger and unsafe input while accepting an empty input', () => {
    expect(parseSmallNumbers('')).toEqual([]);
    expect(parseSmallNumbers(' -3, 0, 8 ')).toEqual([-3, 0, 8]);
    for (const value of [
      '1,',
      ',2',
      'NaN',
      '1e2',
      '1.5',
      '1000',
      '9'.repeat(100),
      Array(14).fill(1).join(','),
    ])
      expect(() => parseSmallNumbers(value)).toThrow();
  });
});

describe('recurrence demonstrations', () => {
  it('matches explicit enumeration of ordered hop sequences for every allowed stair count', () => {
    const enumerate = (remaining: number): number[][] =>
      remaining === 0
        ? [[]]
        : [1, 2]
            .filter((hop) => hop <= remaining)
            .flatMap((hop) => enumerate(remaining - hop).map((tail) => [hop, ...tail]));
    for (let n = 0; n <= 10; n++)
      for (const method of ['recursive', 'memoized', 'tabulated'] as const) {
        const trace = recurrenceTrace(n, method);
        const result = trace[trace.length - 1];
        expect(result.result).toBe(enumerate(n).length);
        expect(result.stack).toEqual([]);
        expect(trace[0].known).toEqual(method === 'tabulated' ? { 0: 1 } : {});
        if (method === 'memoized')
          expect(Object.keys(result.known)).toHaveLength(n > 1 ? n + 1 : 1);
        if (method === 'tabulated') expect(result.calls).toBe(0);
      }
  });
  it('demonstrates reduced calls without pretending the recursive stack disappears', () => {
    const plain = recurrenceTrace(8, 'recursive');
    const memo = recurrenceTrace(8, 'memoized');
    expect(memo.slice(-1)[0].calls).toBeLessThan(plain.slice(-1)[0].calls);
    expect(memo.slice(-1)[0].cacheHits).toBeGreaterThan(0);
    expect(Math.max(...memo.map((step) => step.stack.length))).toBe(8);
    for (const n of [-1, 11, NaN, 0.5]) expect(() => recurrenceTrace(n, 'recursive')).toThrow();
  });
});

describe('pointer demonstrations', () => {
  it('reverses every bounded list and keeps each original node identity', () => {
    for (let n = 0; n <= 8; n++) {
      const trace = pointerTrace(n, 'reverse');
      const result = trace[trace.length - 1];
      const seen: number[] = [];
      let node = result.pointers.head;
      while (node !== null) {
        seen.push(node);
        node = result.next[node];
      }
      expect(seen).toEqual(Array.from({ length: n }, (_, i) => n - i - 1));
      expect(trace[0].next).toEqual(
        Array.from({ length: n }, (_, i) => (i + 1 < n ? i + 1 : null)),
      );
    }
  });
  it('handles empty/singleton insertion and deletion, and all possible cycle targets', () => {
    for (let n = 0; n <= 8; n++) {
      const inserted = pointerTrace(n, 'insert').slice(-1)[0];
      expect(inserted.pointers.head).toBe(n);
      expect(inserted.next[n]).toBe(n ? 0 : null);
      const deleted = pointerTrace(n, 'delete').slice(-1)[0];
      expect(deleted.pointers.head).toBe(n > 1 ? 1 : null);
      expect(pointerTrace(n, 'cycle').slice(-1)[0].action).toContain('no cycle');
      for (let target = 0; target < n; target++) {
        const trace = pointerTrace(n, 'cycle', target);
        expect(trace.slice(-1)[0].action).toContain('a cycle exists');
        expect(trace.length).toBeLessThanOrEqual(2 * n + 4);
      }
    }
    expect(() => pointerTrace(0, 'cycle', 0)).toThrow();
    expect(() => pointerTrace(9, 'reverse')).toThrow();
  });
});
