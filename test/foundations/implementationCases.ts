// Independent collection models. These do not call or translate published classes.
export const absent = -1000000000; // Test protocol only; payloads are in [-3, 3].
export type Fixture = { function: string; args: [number[][], number]; expected: number[] };
let seed = 81723;
const random = (limit: number) => {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return (seed >>> 8) % limit;
};
export function implementationCases(kind: string): Fixture[] {
  const fixtures: Fixture[] = [];
  for (let trial = 0; trial < 36; trial++) {
    const ops: number[][] = [];
    const output: number[] = [];
    const mode =
      kind === 'hash' ? (trial % 2 ? 1 : 5) : kind === 'list' ? (trial % 7) - 3 : trial % 2;
    const list = kind === 'list' ? [mode] : ([] as number[]);
    const map = new Map<number, number>();
    const graph = new Map<number, number[]>();
    for (let step = 0; step < 64; step++) {
      let op = random(
        kind === 'array' ? 5 : kind === 'hash' ? 3 : kind === 'list' ? 2 : kind === 'tree' ? 2 : 3,
      );
      let a = random(7) - 3,
        b = random(7) - 3;
      let answer = 0;
      if (kind === 'array') {
        if (op === 0) {
          list.push(a);
          answer = list.length;
        }
        if (op === 1) answer = list.length ? list.pop()! : absent;
        if (op === 2) {
          a = random(list.length + 3) - 1;
          if (a >= 0 && a < list.length) list.splice(a, 0, b);
        }
        if (op === 3) {
          a = random(list.length + 3) - 1;
          answer = a >= 0 && a < list.length ? list.splice(a, 1)[0] : absent;
        }
        if (op === 4) {
          if (list.length) {
            a = random(list.length);
            answer = list[a];
          } else {
            op = 1;
            answer = absent;
          }
        }
        output.push(answer, list.length, ...list, list.length); // final length is backing-store key count
      } else if (kind === 'hash') {
        a = random(5);
        if (op === 0) map.set(a, b);
        if (op === 1) {
          answer = map.get(a) ?? absent;
          map.delete(a);
        }
        if (op === 2) answer = map.get(a) ?? absent;
        output.push(answer, ...Array.from({ length: 5 }, (_, key) => map.get(key) ?? absent));
      } else if (kind === 'list') {
        if (op === 0) list.unshift(a);
        else list.push(a);
        output.push(list.length, ...list, ...[...list].reverse());
      } else if (kind === 'queue' || kind === 'stack') {
        if (op === 0) list.push(a);
        if (op === 1)
          answer = list.length ? (kind === 'queue' ? list.shift()! : list.pop()!) : absent;
        if (op === 2) answer = list.length ? list[kind === 'queue' ? 0 : list.length - 1] : absent;
        output.push(answer, list.length ? list[kind === 'queue' ? 0 : list.length - 1] : absent);
        if (kind === 'queue') output.push(list.length ? list[list.length - 1] : absent);
      } else if (kind === 'tree') {
        if (op === 0) list.push(a);
        else answer = list.includes(a) ? 1 : 0;
        output.push(answer, list.length, ...[...list].sort((x, y) => x - y));
      } else if (kind === 'graph') {
        a = random(4);
        b = random(4);
        if (op === 0 && graph.has(a)) op = 2;
        if (op === 1 && (!graph.has(a) || !graph.has(b))) op = 0;
        if (op === 2 && !graph.has(a)) op = 0;
        if (op === 0) {
          if (graph.has(a)) op = 2;
          else graph.set(a, []);
        }
        if (op === 1) {
          graph.get(a)!.push(b);
          if (mode) graph.get(b)!.push(a);
        }
        if (op === 2) {
          graph.delete(a);
          for (const [v, edges] of graph)
            graph.set(
              v,
              edges.filter((x) => x !== a),
            );
        }
        for (let v = 0; v < 4; v++)
          output.push(
            graph.has(v) ? 1 : 0,
            ...Array.from(
              { length: 4 },
              (_, w) => (graph.get(v) ?? []).filter((x) => x === w).length,
            ),
          );
      }
      ops.push([op, a, b]);
    }
    fixtures.push({ function: 'verify', args: [ops, mode], expected: output });
  }
  return fixtures;
}

// Swift String equality merges canonical Unicode spellings. Use the Unicode
// normalization standard as the independent key-equivalence oracle.
export function swiftUnicodeHashCases(): Fixture[] {
  const keys = ['é', 'e\u0301', 'Å', 'A\u030a', '😀'];
  const ops = [
    [0, 0, 0],
    [2, 1, 0],
    [0, 1, 2],
    [2, 0, 0],
    [0, 2, 3],
    [2, 3, 0],
    [0, 4, -1],
    [1, 1, 0],
    [2, 0, 0],
    [2, 4, 0],
    [1, 3, 0],
    [2, 2, 0],
  ];
  return [1, 5, 17].map((size) => {
    const map = new Map<string, number>();
    const output: number[] = [];
    for (const [op, a, b] of ops) {
      const key = keys[a].normalize('NFC');
      let value = 0;
      if (op === 0) map.set(key, b);
      if (op === 1) {
        value = map.get(key) ?? absent;
        map.delete(key);
      }
      if (op === 2) value = map.get(key) ?? absent;
      output.push(value, ...keys.map((key) => map.get(key.normalize('NFC')) ?? absent));
    }
    return { function: 'verify', args: [ops, -size], expected: output };
  });
}
