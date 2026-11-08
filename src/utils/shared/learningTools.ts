export interface Invocation {
  at: number;
  eventAt: number;
}
export interface TimingOptions {
  wait: number;
  leading: boolean;
  trailing: boolean;
}

const orderedEvents = (events: number[], wait: number) => {
  if (!Number.isFinite(wait) || wait <= 0) throw new Error('Wait must be greater than zero.');
  if (events.length > 1000 || events.some((n) => !Number.isFinite(n) || n < 0))
    throw new Error('Use at most 1,000 nonnegative event times.');
  return [...events].sort((a, b) => a - b);
};

/** Timers due at the same timestamp as an event run first in this model. */
export const simulateDebounce = (events: number[], options: TimingOptions): Invocation[] => {
  const sorted = orderedEvents(events, options.wait);
  const result: Invocation[] = [];
  let deadline: number | null = null;
  let latest = 0;
  let count = 0;
  const flush = () => {
    if (deadline !== null && options.trailing && (!options.leading || count > 1))
      result.push({ at: deadline, eventAt: latest });
    deadline = null;
    count = 0;
  };
  sorted.forEach((at) => {
    if (deadline !== null && deadline <= at) flush();
    if (deadline === null && options.leading) result.push({ at, eventAt: at });
    count += 1;
    latest = at;
    deadline = at + options.wait;
  });
  flush();
  return result;
};

export const simulateThrottle = (events: number[], options: TimingOptions): Invocation[] => {
  const sorted = orderedEvents(events, options.wait);
  const result: Invocation[] = [];
  let last = -Infinity;
  let deadline: number | null = null;
  let pending: number | null = null;
  const flush = () => {
    if (deadline !== null && pending !== null && options.trailing) {
      result.push({ at: deadline, eventAt: pending });
      last = deadline;
    }
    deadline = null;
    pending = null;
  };
  sorted.forEach((at) => {
    if (deadline !== null && deadline <= at) flush();
    if (at - last >= options.wait) {
      pending = null;
      if (options.leading) {
        result.push({ at, eventAt: at });
        last = at;
      } else {
        last = at;
        pending = at;
        if (options.trailing) deadline = at + options.wait;
      }
    } else {
      pending = at;
      if (options.trailing) deadline = last + options.wait;
    }
  });
  flush();
  return result;
};

export const growthFunctions = [
  { id: 'constant', label: 'O(1)', color: '#89c2ff', log10: (_n: number) => 0 },
  {
    id: 'log',
    label: 'O(log n)',
    color: '#bdb2ff',
    log10: (n: number) => Math.log10(Math.max(1, Math.log2(n))),
  },
  { id: 'linear', label: 'O(n)', color: '#72e0b5', log10: (n: number) => Math.log10(n) },
  {
    id: 'nlogn',
    label: 'O(n log n)',
    color: '#ffda70',
    log10: (n: number) => Math.log10(n) + Math.log10(Math.max(1, Math.log2(n))),
  },
  { id: 'quadratic', label: 'O(n²)', color: '#ffab7b', log10: (n: number) => 2 * Math.log10(n) },
  { id: 'cubic', label: 'O(n³)', color: '#ff92c2', log10: (n: number) => 3 * Math.log10(n) },
  { id: 'exponential', label: 'O(2ⁿ)', color: '#ff7676', log10: (n: number) => n * Math.log10(2) },
  {
    id: 'factorial',
    label: 'O(n!)',
    color: '#c9c5b9',
    log10: (n: number) => {
      if (n < 200) {
        let result = 0;
        for (let i = 2; i <= n; i += 1) result += Math.log10(i);
        return result;
      }
      return (n * Math.log(n) - n + Math.log(2 * Math.PI * n) / 2 + 1 / (12 * n)) / Math.LN10;
    },
  },
];

export const formatMagnitude = (log10: number) => {
  if (!Number.isFinite(log10)) return 'Outside the supported range';
  if (log10 < 6) return Math.pow(10, log10).toLocaleString('en-US', { maximumFractionDigits: 1 });
  const exponent = Math.floor(log10);
  return `${Math.pow(10, log10 - exponent).toFixed(2)} × 10^${exponent.toLocaleString('en-US')}`;
};

export type Graph = Record<string, string[]>;
export interface TraversalStep {
  current: string;
  visited: string[];
  frontier: string[];
  parents: Record<string, string | null>;
}
export const parseGraph = (source: string): Graph => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(source);
  } catch {
    throw new Error('Use a JSON object such as {"A":["B"],"B":[]}.');
  }
  if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object')
    throw new Error('The graph must be a JSON object of neighbor arrays.');
  const graph: Graph = Object.create(null);
  const valid = (id: unknown): id is string =>
    typeof id === 'string' && id.trim().length > 0 && id.length <= 16;
  for (const [id, neighbors] of Object.entries(parsed)) {
    if (!valid(id) || !Array.isArray(neighbors) || !neighbors.every(valid))
      throw new Error('Use nonempty node names up to 16 characters and arrays of neighbor names.');
    graph[id] = [...new Set(neighbors as string[])];
  }
  for (const neighbors of Object.values(graph))
    for (const id of neighbors)
      if (!Object.prototype.hasOwnProperty.call(graph, id)) graph[id] = [];
  if (
    Object.keys(graph).length > 24 ||
    Object.values(graph).reduce((n, values) => n + values.length, 0) > 100
  )
    throw new Error('Use at most 24 nodes and 100 directed edges.');
  return graph;
};

export const traverseGraph = (
  graph: Graph,
  start: string,
  mode: 'bfs' | 'dfs',
): TraversalStep[] => {
  if (!Object.prototype.hasOwnProperty.call(graph, start)) return [];
  const steps: TraversalStep[] = [];
  const seen = new Set<string>();
  const visited: string[] = [];
  const parents: Record<string, string | null> = Object.create(null);
  const snapshot = (current: string, frontier: string[]) =>
    steps.push({
      current,
      visited: [...visited],
      frontier: [...frontier],
      parents: { ...parents },
    });
  if (mode === 'bfs') {
    const queue = [start];
    let head = 0;
    seen.add(start);
    parents[start] = null;
    while (head < queue.length) {
      const current = queue[head++];
      visited.push(current);
      for (const next of graph[current] || [])
        if (!seen.has(next)) {
          seen.add(next);
          parents[next] = current;
          queue.push(next);
        }
      snapshot(current, queue.slice(head));
    }
  } else {
    const visit = (current: string, parent: string | null, stack: string[]) => {
      seen.add(current);
      parents[current] = parent;
      visited.push(current);
      const active = [...stack, current];
      snapshot(current, active);
      for (const next of graph[current] || []) if (!seen.has(next)) visit(next, current, active);
    };
    visit(start, null, []);
  }
  return steps;
};

export const pathTo = (parents: Record<string, string | null>, target: string): string[] => {
  if (!Object.prototype.hasOwnProperty.call(parents, target)) return [];
  const result: string[] = [];
  const seen = new Set<string>();
  let node: string | null = target;
  while (node !== null && !seen.has(node)) {
    result.push(node);
    seen.add(node);
    node = parents[node] ?? null;
  }
  return result.reverse();
};

export interface TreeNode {
  id: number;
  value: string | number;
  left: TreeNode | null;
  right: TreeNode | null;
}
export const parseTree = (source: string): TreeNode | null => {
  let values: unknown;
  try {
    values = JSON.parse(source);
  } catch {
    throw new Error('Use a JSON array such as [4,2,6,1,3,5,7].');
  }
  if (
    !Array.isArray(values) ||
    values.length > 63 ||
    values.some(
      (v) =>
        v !== null &&
        !(typeof v === 'number' && Number.isFinite(v)) &&
        !(typeof v === 'string' && v.trim().length > 0 && v.length <= 12),
    )
  )
    throw new Error('Use up to 63 entries containing numbers, short strings, or null.');
  if (values.length === 0 || values[0] === null) {
    if (values.some((v) => v !== null)) throw new Error('A nonempty tree needs a non-null root.');
    return null;
  }
  const make = (value: string | number, id: number): TreeNode => ({
    id,
    value,
    left: null,
    right: null,
  });
  const root = make(values[0], 0);
  const queue = [{ node: root, depth: 0 }];
  let head = 0;
  let cursor = 1;
  while (head < queue.length && cursor < values.length) {
    const { node, depth } = queue[head++];
    for (const side of ['left', 'right'] as const) {
      if (cursor >= values.length) break;
      const value = values[cursor++];
      if (value !== null) {
        if (depth >= 11)
          throw new Error('Keep the tree to 12 levels so the drawing stays readable.');
        const child = make(value, cursor - 1);
        node[side] = child;
        queue.push({ node: child, depth: depth + 1 });
      }
    }
  }
  if (values.slice(cursor).some((v) => v !== null))
    throw new Error(
      'Some values have no parent. Remove orphan entries after the last reachable node.',
    );
  if (queue.length > 31) throw new Error('Use at most 31 non-null nodes.');
  return root;
};

export type TreeOrder = 'preorder' | 'inorder' | 'postorder' | 'levelorder';
export const traverseTree = (root: TreeNode | null, order: TreeOrder): TreeNode[] => {
  const output: TreeNode[] = [];
  if (!root) return output;
  if (order === 'levelorder') {
    const queue = [root];
    for (let i = 0; i < queue.length; i += 1) {
      const node = queue[i];
      output.push(node);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    return output;
  }
  const walk = (node: TreeNode | null) => {
    if (!node) return;
    if (order === 'preorder') output.push(node);
    walk(node.left);
    if (order === 'inorder') output.push(node);
    walk(node.right);
    if (order === 'postorder') output.push(node);
  };
  walk(root);
  return output;
};
