import { FunctionTest, LessonSpec, Operation } from 'utils/shared/runner/types';

const arrays = (alphabet: number[], maxLength: number): number[][] => {
  const result: number[][] = [[]];
  let level: number[][] = [[]];
  for (let n = 1; n <= maxLength; n++) {
    level = level.flatMap((prefix) => alphabet.map((x) => [...prefix, x]));
    result.push(...level);
  }
  return result;
};

// Independent oracles deliberately use simpler, often slower approaches than
// the published algorithm. Seeds and enumeration order are deterministic.
export function withGeneratedCases(slug: string, spec: LessonSpec): LessonSpec {
  if (spec.kind === 'design') {
    const tests = arrays([-2, 0, 2], 4).map((values) => {
      const model: number[] = [];
      const ops: Operation[] = [];
      const expected: number[] = [];
      const query = () => {
        ops.push(['peek'], ['getStackMin'], ['getStackMax']);
        expected.push(model[model.length - 1], Math.min(...model), Math.max(...model));
      };
      for (const value of values) {
        model.push(value);
        ops.push(['push', value]);
        expected.push(value);
        query();
      }
      while (model.length) {
        ops.push(['pop']);
        expected.push(model.pop()!);
        if (model.length) query();
      }
      return { description: `generated legal stack trace ${values.join(',')}`, ops, expected };
    });
    return { ...spec, tests: [...spec.tests, ...tests] };
  }
  const tests: FunctionTest[] = [];
  const add = (args: unknown[], expected: unknown, hidden?: unknown[]) =>
    tests.push({
      description: `independent generated case ${tests.length + 1}`,
      args: JSON.parse(JSON.stringify(args)),
      expected,
      ...(hidden ? { hidden } : {}),
    });
  if (['age-sort', 'best-time-to-buy-and-sell-stock', 'steal-packages'].includes(slug)) {
    for (const xs of arrays([0, 1, 4], 5)) {
      if (slug === 'age-sort')
        add(
          [xs],
          [...xs].sort((a, b) => a - b),
        );
      if (slug === 'best-time-to-buy-and-sell-stock') {
        let best = 0;
        xs.forEach((buy, i) =>
          xs.slice(i + 1).forEach((sell) => {
            best = Math.max(best, sell - buy);
          }),
        );
        add([xs], best);
      }
      if (slug === 'steal-packages') {
        let best = 0;
        for (let mask = 0; mask < 1 << xs.length; mask++) {
          if (mask & (mask << 1)) continue;
          best = Math.max(
            best,
            xs.reduce((sum, value, i) => sum + ((mask >> i) & 1 ? value : 0), 0),
          );
        }
        add([xs], best);
      }
    }
    if (slug === 'age-sort') add([[100, 0, 100, 99, 0]], [0, 0, 99, 100, 100]);
  } else if (slug === 'sum-digits') {
    for (let n = 0; n < 400; n++)
      add(
        [n * 101],
        [...String(n * 101)].reduce((sum, d) => sum + Number(d), 0),
      );
    add([2147483647], 46);
  } else if (slug === 'three-moves') {
    const enumerate = (remaining: number): number =>
      remaining === 0
        ? 1
        : remaining < 0
          ? 0
          : [1, 2, 3].reduce((sum, move) => sum + enumerate(remaining - move), 0);
    for (let n = -2; n <= 12; n++) add([n], enumerate(n));
  } else if (slug === 'vending-machine') {
    for (const coins of [[], [1], [2], [3, 5], [1, 3, 4], [2, 2, 6], [4, 6]]) {
      for (let target = 0; target <= 22; target++) {
        const distance = new Map<number, number>([[0, 0]]);
        const queue = [0];
        for (let i = 0; i < queue.length; i++)
          for (const coin of coins) {
            const next = queue[i] + coin;
            if (next <= target && !distance.has(next)) {
              distance.set(next, distance.get(queue[i])! + 1);
              queue.push(next);
            }
          }
        add([coins, target], distance.get(target) ?? -1);
      }
    }
  } else if (slug === 'first-bad-version') {
    for (let n = 1; n <= 22; n++) for (let first = 1; first <= n; first++) add([n], first, [first]);
    add([2147483647], 2147483647, [2147483647]);
  } else if (slug === 'shifted-search') {
    for (let n = 0; n <= 9; n++)
      for (let rotation = 0; rotation < Math.max(1, n); rotation++) {
        const sorted = Array.from({ length: n }, (_, i) => i * 3 - 8);
        const xs = [...sorted.slice(rotation), ...sorted.slice(0, rotation)];
        for (let target = -10; target <= 20; target++) add([xs, target], xs.indexOf(target));
      }
  } else if (['reverse-a-linked-list', 'mirror-delete', 'combine-blockchains'].includes(slug)) {
    for (const xs of arrays([-1, 0, 2], 3)) {
      if (slug === 'reverse-a-linked-list') add([xs], [...xs].reverse());
      if (slug === 'mirror-delete')
        for (let k = 0; k <= xs.length + 1; k++) {
          const result = [...xs];
          if (k < result.length) result.splice(result.length - 1 - k, 1);
          add([xs, k], result);
        }
      if (slug === 'combine-blockchains' && xs.length) {
        const a = [...xs].sort((x, y) => x - y);
        for (const b of [[-2], [0], [0, 0, 4], [-1, 1, 3, 5]])
          add(
            [a, b],
            [...a, ...b].sort((x, y) => x - y),
          );
      }
    }
  } else if (slug === 'generate-all-permutations') {
    for (const indexes of arrays([0, 1, 2], 4)) {
      const text = indexes.map((n) => 'abc'[n]).join('');
      const result: string[] = [];
      const visit = (path: number[]) => {
        if (path.length === text.length) result.push(path.map((i) => text[i]).join(''));
        else for (let i = 0; i < text.length; i++) if (!path.includes(i)) visit([...path, i]);
      };
      visit([]);
      add([text], result);
    }
  } else if (slug === 'group-permutations-of-palindromes') {
    const pool = ['', 'a', 'ab', 'aba', 'baa', 'aab', 'aabb', 'bbaa', 'abc', '00a', 'a00'];
    for (let seed = 0; seed < 70; seed++) {
      const strings = Array.from(
        { length: seed % 9 },
        (_, i) => pool[(seed * 7 + i * 3) % pool.length],
      );
      const groups = new Map<string, string[]>();
      for (const text of strings) {
        const counts = ['0', 'a', 'b', 'c'].map((c) => [...text].filter((x) => x === c).length);
        if (counts.filter((n) => n % 2).length > 1) continue;
        const key = counts.join(',');
        groups.set(key, [...(groups.get(key) || []), text]);
      }
      add([strings], [...groups.values()]);
    }
  } else if (slug === 'catch-the-hacker') {
    for (let winner = 0; winner < 4; winner++)
      for (let seed = 0; seed < 20; seed++) {
        const emails = ['a@x.test', 'b@x.test', 'c@x.test', 'd@x.test'];
        const input = emails.flatMap(
          (email, i) => Array(i === winner ? 4 : 3).fill(email) as string[],
        );
        // A deterministic rotation changes first/last occurrences without changing counts.
        const offset = seed % input.length;
        add([[...input.slice(offset), ...input.slice(0, offset)]], emails[winner]);
      }
  } else if (slug === 'interview-scheduler') {
    for (let seed = 0; seed < 100; seed++) {
      const intervals = Array.from({ length: seed % 7 }, (_, i) => {
        const start = ((seed * 7 + i * 3) % 13) - 5;
        return { start, end: start + ((seed + i) % 5) };
      });
      // Repeatedly join any overlapping pair, independent of sorted scan order.
      const result = intervals.map((x) => ({ ...x }));
      let changed = true;
      while (changed) {
        changed = false;
        outer: for (let i = 0; i < result.length; i++)
          for (let j = i + 1; j < result.length; j++) {
            if (
              Math.max(result[i].start, result[j].start) <= Math.min(result[i].end, result[j].end)
            ) {
              result[i] = {
                start: Math.min(result[i].start, result[j].start),
                end: Math.max(result[i].end, result[j].end),
              };
              result.splice(j, 1);
              changed = true;
              break outer;
            }
          }
      }
      add(
        [intervals],
        result.sort((a, b) => a.start - b.start),
      );
    }
  } else if (['walk-a-matrix', 'sorted-matrix-search'].includes(slug)) {
    for (let rows = 0; rows <= 6; rows++)
      for (let cols = 0; cols <= 6; cols++) {
        const matrix = Array.from({ length: rows }, (_, r) =>
          Array.from({ length: cols }, (_, c) => r * 17 + c * 2),
        );
        if (slug === 'sorted-matrix-search') {
          for (const target of [-1, 0, 2, 19, 34, 51, 85, 94, 200]) {
            let expected = [-1, -1];
            matrix.forEach((row, r) =>
              row.forEach((value, c) => {
                if (value === target) expected = [r, c];
              }),
            );
            add([matrix, target], expected);
          }
        } else {
          const visited = new Set<string>();
          const moves = [
            [0, 1],
            [1, 0],
            [0, -1],
            [-1, 0],
          ];
          const expected: number[] = [];
          let r = 0,
            c = 0,
            direction = 0;
          for (let i = 0; i < rows * cols; i++) {
            expected.push(matrix[r][c]);
            visited.add(`${r},${c}`);
            let [dr, dc] = moves[direction];
            if (
              r + dr < 0 ||
              r + dr >= rows ||
              c + dc < 0 ||
              c + dc >= cols ||
              visited.has(`${r + dr},${c + dc}`)
            ) {
              direction = (direction + 1) % 4;
              [dr, dc] = moves[direction];
            }
            r += dr;
            c += dc;
          }
          add([matrix], expected);
        }
      }
  } else if (['count-islands', 'robot-maze'].includes(slug)) {
    for (let mask = 0; mask < 512; mask++) {
      if (slug === 'count-islands') {
        const grid = Array.from({ length: 3 }, (_, r) =>
          Array.from({ length: 3 }, (_, c) => (mask & (1 << (r * 3 + c)) ? '#' : '~')),
        );
        const parent = Array.from({ length: 9 }, (_, i) => i);
        const root = (i: number): number => (parent[i] === i ? i : root(parent[i]));
        for (let r = 0; r < 3; r++)
          for (let c = 0; c < 3; c++)
            if (grid[r][c] === '#') {
              for (const [dr, dc] of [
                [1, 0],
                [0, 1],
              ])
                if (r + dr < 3 && c + dc < 3 && grid[r + dr][c + dc] === '#')
                  parent[root(r * 3 + c)] = root((r + dr) * 3 + c + dc);
            }
        add(
          [grid],
          new Set(parent.filter((_, i) => grid[Math.floor(i / 3)][i % 3] === '#').map(root)).size,
        );
      } else {
        const grid: number[][] = Array.from({ length: 3 }, (_, r) =>
          Array.from({ length: 3 }, (_, c) => (mask & (1 << (r * 3 + c)) ? 1 : 0)),
        );
        grid[2][2] = 2;
        const reached = Array.from({ length: 3 }, () => Array<boolean>(3).fill(false));
        for (let r = 0; r < 3; r++)
          for (let c = 0; c < 3; c++)
            reached[r][c] =
              grid[r][c] !== 1 &&
              ((r === 0 && c === 0) ||
                (r > 0 && reached[r - 1][c]) ||
                (c > 0 && reached[r][c - 1]));
        add([grid], reached[2][2]);
      }
    }
  } else if (slug === 'valid-sudoku-board') {
    for (let seed = 0; seed < 160; seed++) {
      const board = Array.from({ length: 4 }, (_, r) =>
        Array.from({ length: 4 }, (_, c) => (seed + r * 7 + c * 3 + r * c) % 5),
      );
      const regions: number[][] = [...board, ...board.map((_, c) => board.map((row) => row[c]))];
      for (let r = 0; r < 4; r += 2)
        for (let c = 0; c < 4; c += 2)
          regions.push([board[r][c], board[r][c + 1], board[r + 1][c], board[r + 1][c + 1]]);
      add(
        [board],
        regions.every((region) => {
          const filled = region.filter(Boolean);
          return filled.length === new Set(filled).size;
        }),
      );
    }
    add([[[0]]], true);
    add([[[1]]], true);
    add(
      [
        [
          [0, 0],
          [0, 0],
        ],
      ],
      false,
    );
  } else if (slug === 'pilot-a-rocket') {
    for (let length = 0; length < 30; length++) {
      const graph: Record<string, string[]> = { base: length ? ['n0'] : ['ship'], ship: [] };
      for (let i = 0; i < length; i++)
        graph[`n${i}`] = ['base', i === length - 1 ? 'ship' : `n${i + 1}`];
      add([graph], ['base', ...Array.from({ length }, (_, i) => `n${i}`), 'ship']);
      if (length) {
        graph[`n${length - 1}`] = ['base'];
        add([JSON.parse(JSON.stringify(graph))], null);
      }
    }
  } else if (
    [
      'binary-search-tree-validate',
      'binary-tree-max-depth',
      'closest-common-ancestor-in-binary-tree',
    ].includes(slug)
  ) {
    // Heap positions define the oracle tree; compact level order is only its wire representation.
    for (let seed = 0; seed < 45; seed++) {
      const count = (seed % 9) + 1;
      const values = Array.from({ length: count }, (_, i) => ((i * 5 + seed) % 19) - 9);
      const inorder: number[] = [];
      const visit = (i: number) => {
        if (i >= count) return;
        visit(i * 2 + 1);
        inorder.push(values[i]);
        visit(i * 2 + 2);
      };
      visit(0);
      if (slug === 'binary-search-tree-validate')
        add(
          [values],
          inorder.every((x, i) => i === 0 || inorder[i - 1] < x),
        );
      if (slug === 'binary-tree-max-depth') add([values], Math.floor(Math.log2(count)));
      if (slug === 'closest-common-ancestor-in-binary-tree')
        for (let a = 0; a < count; a++) {
          const b = (a + seed) % count;
          const ancestors = new Set<number>();
          let current = a;
          while (true) {
            ancestors.add(current);
            if (!current) break;
            current = Math.floor((current - 1) / 2);
          }
          current = b;
          while (!ancestors.has(current)) current = Math.floor((current - 1) / 2);
          add([values, values[a], values[b]], values[current]);
        }
    }
    if (slug === 'binary-search-tree-validate') {
      add([[]], true);
      add([[0, -2147483648, 2147483647]], true);
      add([[10, 5, 15, null, 12]], false);
    }
    if (slug === 'binary-tree-max-depth') add([[]], -1);
  } else throw new Error(`Missing independent oracle: ${slug}`);
  if (!tests.length) throw new Error(`No generated cases for ${slug}`);
  return { ...spec, tests: [...spec.tests, ...tests] };
}
