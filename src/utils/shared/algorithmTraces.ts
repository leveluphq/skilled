export interface AlgorithmStep {
  action: string;
  values: number[];
  detail: string;
  comparisons: number;
  writes: number;
}
export type SortMethod = 'insertion' | 'selection' | 'bubble';

export function parseSmallNumbers(source: string, maximum = 12): number[] {
  if (!source.trim()) return [];
  const parts = source.split(',').map((part) => part.trim());
  if (parts.length > maximum || parts.some((part) => !/^-?\d+$/.test(part)))
    throw new Error(`Enter at most ${maximum} comma-separated integers.`);
  const values = parts.map(Number);
  if (values.some((value) => !Number.isSafeInteger(value) || Math.abs(value) > 999))
    throw new Error('Use integers from -999 to 999.');
  return values;
}

/** Trace actual operations; these counts are not elapsed-time benchmarks. */
export function sortingTrace(input: number[], method: SortMethod): AlgorithmStep[] {
  const values = [...input];
  let comparisons = 0;
  let writes = 0;
  const steps: AlgorithmStep[] = [];
  const record = (action: string, detail: string) =>
    steps.push({ action, detail, values: [...values], comparisons, writes });
  const swap = (a: number, b: number) => {
    [values[a], values[b]] = [values[b], values[a]];
    writes += 2;
  };
  record('Initial input', 'All methods receive their own copy of this same input.');
  if (method === 'insertion') {
    for (let i = 1; i < values.length; i++) {
      const key = values[i];
      let j = i - 1;
      while (j >= 0) {
        comparisons++;
        record(
          `Compare ${values[j]} with key ${key}`,
          `The prefix before position ${i} is sorted.`,
        );
        if (values[j] <= key) break;
        values[j + 1] = values[j];
        writes++;
        record(`Shift position ${j} right`, `The key ${key} is held outside the array.`);
        j--;
      }
      values[j + 1] = key;
      writes++;
      record(`Insert key ${key} at position ${j + 1}`, 'The sorted prefix has grown by one.');
    }
  } else if (method === 'selection') {
    for (let i = 0; i + 1 < values.length; i++) {
      let minimum = i;
      for (let j = i + 1; j < values.length; j++) {
        comparisons++;
        if (values[j] < values[minimum]) minimum = j;
        record(
          `Inspect position ${j}`,
          `Smallest suffix value so far: ${values[minimum]} at ${minimum}.`,
        );
      }
      if (minimum !== i) {
        swap(i, minimum);
        record(`Swap positions ${i} and ${minimum}`, `Position ${i} now contains its final value.`);
      }
    }
  } else {
    for (let end = values.length - 1; end > 0; end--) {
      let changed = false;
      for (let i = 0; i < end; i++) {
        comparisons++;
        record(`Compare positions ${i} and ${i + 1}`, `Values after ${end} are already final.`);
        if (values[i] > values[i + 1]) {
          swap(i, i + 1);
          changed = true;
          record(`Swap positions ${i} and ${i + 1}`, 'The larger value moves toward the end.');
        }
      }
      if (!changed) {
        record('Stop after an unchanged pass', 'Every adjacent pair is ordered.');
        break;
      }
    }
  }
  record('Sorted result', 'Counters include value comparisons and array-element assignments only.');
  return steps;
}

export interface CallStep {
  action: string;
  stack: number[];
  known: Record<number, number>;
  calls: number;
  cacheHits: number;
  result?: number;
}
export type RecurrenceMethod = 'recursive' | 'memoized' | 'tabulated';

/** Ways to climb n steps using hops of one or two; ways(0) = 1. */
export function recurrenceTrace(n: number, method: RecurrenceMethod): CallStep[] {
  if (!Number.isInteger(n) || n < 0 || n > 10) throw new Error('Choose an integer from 0 to 10.');
  const steps: CallStep[] = [];
  const stack: number[] = [];
  const known: Record<number, number> = {};
  let calls = 0;
  let cacheHits = 0;
  const record = (action: string, result?: number) =>
    steps.push({ action, stack: [...stack], known: { ...known }, calls, cacheHits, result });
  if (method === 'tabulated') {
    known[0] = 1;
    record('Set ways(0) = 1: one empty sequence');
    if (n > 0) {
      known[1] = 1;
      record('Set ways(1) = 1: one single hop');
    }
    for (let i = 2; i <= n; i++) {
      known[i] = known[i - 1] + known[i - 2];
      record(`Fill ways(${i}) = ${known[i - 1]} + ${known[i - 2]}`);
    }
    record(`Return ${known[n]}`, known[n]);
    return steps;
  }
  const visit = (remaining: number): number => {
    calls++;
    stack.push(remaining);
    record(`Call ways(${remaining})`);
    let answer: number;
    if (method === 'memoized' && Object.prototype.hasOwnProperty.call(known, remaining)) {
      cacheHits++;
      answer = known[remaining];
      record(`Reuse ways(${remaining}) = ${answer}`);
    } else {
      answer = remaining <= 1 ? 1 : visit(remaining - 1) + visit(remaining - 2);
      if (method === 'memoized') known[remaining] = answer;
      record(`Resolve ways(${remaining}) = ${answer}`);
    }
    stack.pop();
    record(`Return from ways(${remaining})`, answer);
    return answer;
  };
  const result = visit(n);
  record(`Final result: ${result}`, result);
  return steps;
}

export interface PointerStep {
  action: string;
  next: (number | null)[];
  pointers: Record<string, number | null>;
}
export type PointerMethod = 'reverse' | 'insert' | 'delete' | 'cycle';

export function pointerTrace(
  length: number,
  method: PointerMethod,
  cycleAt: number | null = null,
): PointerStep[] {
  if (!Number.isInteger(length) || length < 0 || length > 8)
    throw new Error('Use zero to eight nodes.');
  if (cycleAt !== null && (!Number.isInteger(cycleAt) || cycleAt < 0 || cycleAt >= length))
    throw new Error('The cycle target must identify an existing node.');
  const next: (number | null)[] = Array.from({ length }, (_, i) => (i + 1 < length ? i + 1 : null));
  const steps: PointerStep[] = [];
  const record = (action: string, pointers: Record<string, number | null>) =>
    steps.push({ action, next: [...next], pointers: { ...pointers } });
  const head = length ? 0 : null;
  record('Initial links; node IDs stay fixed throughout the trace', { head });
  if (method === 'reverse') {
    let previous: number | null = null;
    let current = head;
    while (current !== null) {
      const saved: number | null = next[current];
      record(`Save the old next link of node ${current}`, { previous, current, saved });
      next[current] = previous;
      record(`Point node ${current} backward`, { previous, current, saved });
      previous = current;
      current = saved;
      record('Advance previous and current using the saved link', { previous, current });
    }
    record('The old tail is the new head', { head: previous, current });
  } else if (method === 'insert') {
    const newNode = next.length;
    next.push(head);
    record(`Allocate node ${newNode} and connect it to the old head`, { head, newNode });
    record('Move head to the new node', { head: newNode });
  } else if (method === 'delete') {
    const following = head === null ? null : next[head];
    record(head === null ? 'Empty list: nothing to remove' : `Move head past node ${head}`, {
      head: following,
      detached: head,
    });
    if (head !== null) {
      next[head] = null;
      record('Detach the removed node; external references may still exist', {
        head: following,
        detached: head,
      });
    }
  } else {
    if (length && cycleAt !== null) next[length - 1] = cycleAt;
    let slow = head;
    let fast = head;
    record('Start slow and fast at head', { head, slow, fast });
    while (fast !== null && next[fast] !== null) {
      slow = slow === null ? null : next[slow];
      const firstHop = next[fast]!;
      fast = next[firstHop];
      record('Move slow one link and fast two links', { head, slow, fast });
      if (slow === fast) {
        record('Pointers meet: a cycle exists', { head, slow, fast });
        return steps;
      }
    }
    record('Fast reaches null: no cycle exists', { head, slow, fast });
  }
  return steps;
}
