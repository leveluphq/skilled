import {
  simulateDebounce,
  simulateThrottle,
  parseGraph,
  traverseGraph,
  pathTo,
  parseTree,
  traverseTree,
  growthFunctions,
  formatMagnitude,
} from '../learningTools';

describe('event timing model', () => {
  const events = [0, 80, 160, 600, 680];
  const options = { wait: 250, leading: false, trailing: true };
  it('debounces bursts to the latest input after a quiet period', () => {
    expect(simulateDebounce(events, options)).toEqual([
      { at: 410, eventAt: 160 },
      { at: 930, eventAt: 680 },
    ]);
  });
  it('throttles continuing input without postponing the active deadline', () => {
    expect(simulateThrottle([0, 100, 200, 300, 400, 500], options)).toEqual([
      { at: 250, eventAt: 200 },
      { at: 500, eventAt: 400 },
      { at: 750, eventAt: 500 },
    ]);
  });
  it('does not duplicate a single event when both edges are enabled', () => {
    for (const simulate of [simulateDebounce, simulateThrottle])
      expect(simulate([0], { ...options, leading: true })).toEqual([{ at: 0, eventAt: 0 }]);
  });
  it('can retain a trailing update after a leading call', () => {
    expect(simulateThrottle([0, 80, 160], { ...options, leading: true })).toEqual([
      { at: 0, eventAt: 0 },
      { at: 250, eventAt: 160 },
    ]);
  });
  it('runs a due timer before an equal-time input', () => {
    expect(simulateDebounce([0, 250], options)).toEqual([
      { at: 250, eventAt: 0 },
      { at: 500, eventAt: 250 },
    ]);
  });
  it('handles empty input and disabled edges', () => {
    for (const simulate of [simulateDebounce, simulateThrottle]) {
      expect(simulate([], options)).toEqual([]);
      expect(simulate(events, { ...options, leading: false, trailing: false })).toEqual([]);
      expect(() => simulate([NaN], options)).toThrow();
      expect(() => simulate(events, { ...options, wait: 0 })).toThrow();
    }
  });
});

describe('graph traversal', () => {
  const graph = parseGraph(
    '{"A":["B","C"],"B":["D"],"C":["F"],"D":["E"],"E":["F","A"],"F":[],"X":[]}',
  );
  it('finds the shorter unweighted BFS route and a different DFS discovery route', () => {
    const bfs = traverseGraph(graph, 'A', 'bfs');
    const dfs = traverseGraph(graph, 'A', 'dfs');
    expect(pathTo(bfs[bfs.length - 1].parents, 'F')).toEqual(['A', 'C', 'F']);
    expect(pathTo(dfs[dfs.length - 1].parents, 'F')).toEqual(['A', 'B', 'D', 'E', 'F']);
    for (const steps of [bfs, dfs]) {
      expect(steps).toHaveLength(6);
      expect(new Set(steps.map((s) => s.current)).size).toBe(6);
      expect(pathTo(steps[steps.length - 1].parents, 'X')).toEqual([]);
    }
  });
  it('accepts neighbor-only nodes and safe arbitrary property names', () => {
    const unusual = parseGraph('{"__proto__":["constructor"]}');
    expect(traverseGraph(unusual, '__proto__', 'bfs').map((s) => s.current)).toEqual([
      '__proto__',
      'constructor',
    ]);
    expect(Object.getPrototypeOf(unusual)).toBe(null);
  });
  it('rejects malformed and excessive inputs while allowing an empty graph', () => {
    expect(() => parseGraph('{"A":"B"}')).toThrow();
    expect(() => parseGraph('[]')).toThrow();
    expect(() =>
      parseGraph(
        JSON.stringify(Object.fromEntries(Array.from({ length: 25 }, (_, i) => [String(i), []]))),
      ),
    ).toThrow();
    expect(traverseGraph(parseGraph('{}'), 'A', 'bfs')).toEqual([]);
  });
});

describe('tree traversal', () => {
  const root = parseTree('[4,2,6,1,3,5,7]');
  it.each([
    ['preorder', [4, 2, 1, 3, 6, 5, 7]],
    ['inorder', [1, 2, 3, 4, 5, 6, 7]],
    ['postorder', [1, 3, 2, 5, 7, 6, 4]],
    ['levelorder', [4, 2, 6, 1, 3, 5, 7]],
  ] as const)('produces %s visits', (order, expected) => {
    expect(traverseTree(root, order).map((node) => node.value)).toEqual(expected);
  });
  it('uses a compact queue input and keeps duplicate identities separate', () => {
    expect(traverseTree(parseTree('[1,null,2,3]'), 'inorder').map((node) => node.value)).toEqual([
      1, 3, 2,
    ]);
    const repeated = traverseTree(parseTree('[1,1,1]'), 'preorder');
    expect(new Set(repeated.map((node) => node.id)).size).toBe(3);
  });
  it('supports empty input and rejects unreachable entries', () => {
    expect(parseTree('[]')).toBeNull();
    expect(parseTree('[null]')).toBeNull();
    expect(() => parseTree('[null,1]')).toThrow();
    expect(() => parseTree('[1,null,null,2]')).toThrow();
    expect(() => parseTree('[{}]')).toThrow();
  });
});

describe('growth estimates', () => {
  it('compares quadratic and linear doubling without overflowing larger functions', () => {
    const linear = growthFunctions.find((g) => g.id === 'linear')!;
    const quadratic = growthFunctions.find((g) => g.id === 'quadratic')!;
    expect(Math.pow(10, linear.log10(32) - linear.log10(16))).toBeCloseTo(2);
    expect(Math.pow(10, quadratic.log10(32) - quadratic.log10(16))).toBeCloseTo(4);
    for (const growth of growthFunctions) expect(Number.isFinite(growth.log10(1000000))).toBe(true);
    expect(
      formatMagnitude(growthFunctions.find((g) => g.id === 'factorial')!.log10(1000000)),
    ).toContain('10^');
  });
});
