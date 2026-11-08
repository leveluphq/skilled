import fs from 'fs';
import path from 'path';
import vm from 'vm';

const published = (slug: string, expression: string) => {
  const source = fs.readFileSync(
    path.resolve('src/content/resources/patterns', slug + '.mdx'),
    'utf8',
  );
  const code = Array.from(source.matchAll(/```javascript\n([\s\S]*?)```/g), (m) => m[1]).join('\n');
  return vm.runInNewContext(code + '\n' + expression, {}, { timeout: 1000 });
};

it('checks the published trie against a set through mixed histories and iterator-boundary prefixes', () => {
  const Trie = published('tries', 'Trie');
  const trie = new Trie();
  const words = ['', 'a', 'ab', 'abc', 'ac', 'b', '😀', '😀a', 'e\u0301', 'é', '\ud83d', '\ude00'];
  const prefixes = [...new Set([...words, 'missing', 'e', '😀b'])];
  const reference = new Set<string>();
  let state = 123456;
  for (let step = 0; step < 360; step += 1) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const word = words[state % words.length];
    if ((state >>> 8) % 2 === 0) {
      expect(trie.insert(word)).toBe(!reference.has(word));
      reference.add(word);
    } else expect(trie.delete(word)).toBe(reference.delete(word));
    for (const prefix of prefixes) {
      const symbols = Array.from(prefix);
      const expected = [...reference].filter((item) => {
        const candidate = Array.from(item);
        return symbols.every((symbol, index) => candidate[index] === symbol);
      }).length;
      expect(trie.countPrefix(prefix)).toBe(expected);
      expect(trie.has(prefix)).toBe(reference.has(prefix));
    }
    expect(trie.root.words).toBe(reference.size);
  }
  for (const word of reference) expect(trie.delete(word)).toBe(true);
  expect(trie.root.children.size).toBe(0);
  expect(trie.root.words).toBe(0);
  expect(trie.insert('car')).toBe(true);
  expect(trie.insert('cart')).toBe(true);
  expect(trie.delete('car')).toBe(true);
  expect(trie.has('cart')).toBe(true);
  expect(trie.has('car')).toBe(false);
  for (const method of ['has', 'countPrefix', 'insert', 'delete'])
    expect(() => trie[method](null)).toThrow();
});

it('inserts and prunes a 30,000-symbol trie branch without recursive stack growth', () => {
  const Trie = published('tries', 'Trie');
  const trie = new Trie();
  const word = 'a'.repeat(30000);
  expect(trie.insert(word)).toBe(true);
  expect(trie.has(word)).toBe(true);
  expect(trie.countPrefix('a'.repeat(20000))).toBe(1);
  expect(trie.delete(word)).toBe(true);
  expect(trie.root.children.size).toBe(0);
});

const graphLabels = (graph: Set<number>[]) => {
  const labels = Array(graph.length).fill(-1);
  let count = 0;
  for (let start = 0; start < graph.length; start += 1) {
    if (labels[start] !== -1) continue;
    const queue = [start];
    labels[start] = count;
    for (let head = 0; head < queue.length; head += 1) {
      for (const neighbor of graph[queue[head]])
        if (labels[neighbor] === -1) {
          labels[neighbor] = count;
          queue.push(neighbor);
        }
    }
    count += 1;
  }
  return { labels, count };
};

it('compares published union-find with BFS after every edge of every four-vertex undirected graph', () => {
  const UnionFind = published('union-find', 'UnionFind');
  const edges: [number, number][] = [];
  for (let a = 0; a < 4; a += 1) for (let b = a + 1; b < 4; b += 1) edges.push([a, b]);
  for (let mask = 0; mask < 2 ** edges.length; mask += 1) {
    const uf = new UnionFind(4);
    const graph = Array.from({ length: 4 }, () => new Set<number>());
    const check = () => {
      const { labels, count } = graphLabels(graph);
      expect(uf.count).toBe(count);
      for (let a = 0; a < 4; a += 1) {
        expect(uf.size[uf.find(a)]).toBe(labels.filter((label) => label === labels[a]).length);
        for (let b = 0; b < 4; b += 1) expect(uf.connected(a, b)).toBe(labels[a] === labels[b]);
      }
    };
    check();
    for (let i = edges.length - 1; i >= 0; i -= 1)
      if (mask & (1 << i)) {
        const [a, b] = edges[i];
        const before = graphLabels(graph).labels;
        expect(uf.union(a, b)).toBe(before[a] !== before[b]);
        graph[a].add(b);
        graph[b].add(a);
        expect(uf.union(b, a)).toBe(false);
        expect(uf.union(a, a)).toBe(false);
        check();
      }
  }
  expect(new UnionFind(0).count).toBe(0);
  for (const bad of [-1, 1.5, NaN, Infinity]) expect(() => new UnionFind(bad)).toThrow();
  const uf = new UnionFind(4);
  for (const bad of [-1, 4, 0.5, NaN, Infinity]) {
    expect(() => uf.find(bad)).toThrow();
    expect(() => uf.union(0, bad)).toThrow();
    expect(() => uf.connected(bad, 0)).toThrow();
  }
  expect(uf.count).toBe(4);
});

it('compares published greedy scheduling with exhaustive pairwise-compatible subsets', () => {
  const maximumMeetings = published('greedy-algorithms', 'maximumMeetings');
  const pool: Readonly<{ start: number; end: number }>[] = [];
  for (let start = -1; start < 3; start += 1)
    for (let end = start + 1; end <= 3; end += 1) pool.push(Object.freeze({ start, end }));
  const compatible = (a: (typeof pool)[number], b: (typeof pool)[number]) =>
    a.end <= b.start || b.end <= a.start;
  for (let mask = 0; mask < 2 ** pool.length; mask += 1) {
    const input = Object.freeze(pool.filter((_, i) => mask & (1 << i)).reverse());
    let expected = 0;
    for (let selected = 0; selected < 2 ** input.length; selected += 1) {
      const candidates = input.filter((_, i) => selected & (1 << i));
      if (candidates.every((a, i) => candidates.slice(i + 1).every((b) => compatible(a, b))))
        expected = Math.max(expected, candidates.length);
    }
    const actual = maximumMeetings(input);
    expect(actual).toHaveLength(expected);
    expect(new Set(actual).size).toBe(actual.length);
    for (let i = 0; i < actual.length; i += 1) {
      expect(input.includes(actual[i])).toBe(true);
      if (i > 0) expect(actual[i].start).toBeGreaterThanOrEqual(actual[i - 1].end);
    }
  }
  const first = Object.freeze({ start: 0, end: 2 });
  const equal = Object.freeze({ start: 1, end: 2 });
  const next = Object.freeze({ start: 2, end: 3 });
  const result = maximumMeetings(Object.freeze([first, equal, next]));
  expect(result[0]).toBe(first);
  expect(result[1]).toBe(next);
  for (const bad of [
    null,
    {},
    { start: 1, end: 1 },
    { start: 2, end: 1 },
    { start: NaN, end: 2 },
    { start: 0, end: Infinity },
  ])
    expect(() => maximumMeetings([bad])).toThrow();
});
