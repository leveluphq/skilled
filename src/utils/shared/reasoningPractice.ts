export interface ReasoningQuestion {
  id: string;
  prompt: string;
  choices: string[];
  answer: number;
  explanation: string;
  guide: string;
}

export const edgeCaseQuestions: ReasoningQuestion[] = [
  {
    id: 'zero-index',
    prompt:
      'A Two Sum implementation uses “if (seen.get(complement))” to decide whether an index exists. Which input exposes the missing result? Values are unique.',
    choices: ['[2, 7], target 9', '[3, 8], target 10', '[], target 0'],
    answer: 0,
    explanation:
      'The complement 2 was stored at index 0. Zero is falsy, so a truthiness check drops a valid pair. Use an explicit presence test or compare the lookup result with the missing-value sentinel.',
    guide: '/course/target-two-sum',
  },
  {
    id: 'two-zeroes',
    prompt:
      'Product except self returns correct answers without zeros and with one zero. Which case most directly tests whether the implementation divides the total product by each value?',
    choices: ['[2, 3, 4]', '[0, 2, 0]', '[-2, 3, 4]'],
    answer: 1,
    explanation:
      'Two zero positions force every output to zero. Dividing a total product of zero by a zero entry is undefined. Prefix and suffix products handle this input without division or a special zero branch.',
    guide: '/course/product-array',
  },
  {
    id: 'global-bst',
    prompt:
      'A BST checker validates only immediate children. Which tree passes that local test but violates the strict global BST rule?',
    choices: [
      'Root 10; left 5; right 15',
      'Root 10; left 5 with right child 12',
      'Root 10; right 8',
    ],
    answer: 1,
    explanation:
      'The value 12 is greater than its parent 5 but lies in the left subtree of 10. Carry an upper bound of 10 through that whole subtree. The third choice is already rejected by an immediate-child check.',
    guide: '/course/binary-search-tree-validate',
  },
  {
    id: 'signed-window',
    prompt:
      'A sum window shrinks whenever its sum exceeds target 3. Which input shows why that rule needs a nonnegative-value assumption?',
    choices: ['[1, 2]', '[5, -2]', '[3]'],
    answer: 1,
    explanation:
      'After seeing 5 the rule discards it, even though appending -2 would produce sum 3. Negative values break the monotone relationship between expanding the window and increasing its sum.',
    guide: '/patterns/prefix-sums',
  },
  {
    id: 'bfs-cycle',
    prompt:
      'A BFS forgets to record visited nodes. Which smallest directed graph can make it run forever?',
    choices: ['A → B; B has no outgoing edges', 'A → A', 'A has no outgoing edges'],
    answer: 1,
    explanation:
      'A self-loop repeatedly enqueues A. Mark a node when it is first discovered, before enqueueing, so cycles and multiple incoming edges do not create unbounded repeated work.',
    guide: '/tools/graph-traversal',
  },
  {
    id: 'binary-sentinel',
    prompt:
      'A first-true search works when a transition exists. Which case checks its “not found” boundary?',
    choices: ['[false, true, true]', '[true, true]', '[false, false, false]'],
    answer: 2,
    explanation:
      'An all-false input must return the declared sentinel, often n for a half-open search. A test that always contains a true value cannot establish correct behavior for a missing boundary. Also test n = 0 separately.',
    guide: '/patterns/binary-search',
  },
  {
    id: 'unicode-contract',
    prompt:
      'A function promises the number of Unicode code points in a string, but returns JavaScript string.length. Which input distinguishes UTF-16 units from code points?',
    choices: ['"cat"', '"😀"', '""'],
    answer: 1,
    explanation:
      'This emoji occupies two UTF-16 code units and one Unicode code point. A combining sequence raises a further distinction between code points and displayed grapheme clusters. State the promised unit before selecting iteration APIs.',
    guide: '/topics/strings',
  },
  {
    id: 'mutation',
    prompt:
      'A pair-search helper promises to preserve the caller’s array. Its returned indexes look valid for a sorted example. Which additional assertion checks the preservation promise?',
    choices: [
      'Only assert that the result contains two indexes',
      'Keep an input copy and compare the array after calling',
      'Call the function twice with a newly allocated sorted array',
    ],
    answer: 1,
    explanation:
      'An implementation may sort in place and still return plausible-looking values. Compare the original input with a saved copy. Then separately check distinct indexes, their original values, and the target sum.',
    guide: '/reference/interview-practice-worksheet',
  },
];

export const complexityQuestions: ReasoningQuestion[] = [
  {
    id: 'triangular',
    prompt:
      'For each i from 0 to n − 1, a loop visits j from 0 to i − 1. Each body costs O(1). What is the total running time?',
    choices: ['O(n)', 'O(n log n)', 'O(n²)'],
    answer: 2,
    explanation:
      'The body executes 0 + 1 + … + (n − 1) = n(n − 1)/2 times. The loops do different amounts of work on each pass, but the sum is still quadratic.',
    guide: '/guides/big-o-time-space-complexity',
  },
  {
    id: 'doubling',
    prompt:
      'Start i at 1, repeatedly double it while i < n, and do constant work per iteration. Assume integer arithmetic is representable. What is the time?',
    choices: ['O(log n)', 'O(n)', 'O(2ⁿ)'],
    answer: 0,
    explanation:
      'After k iterations i is 2ᵏ. Reaching n requires about log₂ n doublings. The value grows exponentially with iteration count, which makes the number of iterations logarithmic in the input bound.',
    guide: '/tools/big-o',
  },
  {
    id: 'two-scans',
    prompt:
      'A function scans n array entries, then scans them once more in reverse. It stores an n-entry output plus two scalar counters. Excluding the output, what are time and auxiliary space?',
    choices: [
      'O(n²) time, O(n) auxiliary space',
      'O(n) time, O(1) auxiliary space',
      'O(n) time, O(n) auxiliary space',
    ],
    answer: 1,
    explanation:
      'Sequential passes add: n + n = 2n. The two counters consume constant auxiliary space. The required output still consumes O(n) total space and must be reported when output storage is included.',
    guide: '/course/product-array',
  },
  {
    id: 'queue-shift',
    prompt:
      'An array-backed BFS removes index zero by shifting all remaining entries left. A star graph queues n − 1 leaves. What worst-case queue-removal work can result?',
    choices: ['O(n)', 'O(log n)', 'O(n²)'],
    answer: 2,
    explanation:
      'Removing the leaves shifts roughly n − 2, n − 3, … entries. The sum is quadratic. A head-index queue or suitable deque avoids repeatedly moving the remaining frontier.',
    guide: '/guides/javascript-queue',
  },
  {
    id: 'graph-size',
    prompt:
      'Adjacency-list BFS marks every node at discovery and explores the entire reachable graph. What bounds its time, including scanning all neighbor lists?',
    choices: ['O(V + E)', 'Always O(V)', 'Always O(V²)'],
    answer: 0,
    explanation:
      'Each reachable vertex is processed once and each outgoing adjacency entry is inspected once. A dense graph can have quadratic E; a sparse graph need not. State both V and E rather than hiding edge work.',
    guide: '/guides/bfs-vs-dfs',
  },
  {
    id: 'recursive-space',
    prompt:
      'A recursive traversal of a skewed n-node binary tree visits each node once. Excluding output, what is the worst-case call-stack space?',
    choices: ['O(1)', 'O(log n)', 'O(n)'],
    answer: 2,
    explanation:
      'A skewed tree can have height n. One recursive frame remains active for each ancestor. Balanced height is logarithmic, but that bound needs a balance assumption.',
    guide: '/topics/trees',
  },
  {
    id: 'memo-state',
    prompt:
      'A memoized recurrence has n distinct states, each with at most two smaller dependencies and constant arithmetic per state. The deepest dependency chain has length n. What is the time and total auxiliary-space bound?',
    choices: [
      'O(2ⁿ) time and O(1) space',
      'O(n) time and O(n) space',
      'O(n²) time and O(n²) space',
    ],
    answer: 1,
    explanation:
      'Caching evaluates each state once. Its two transitions give linear total work. Both the cache and the deepest call chain can be linear; memoization removes repeated computation without automatically removing recursion depth.',
    guide: '/tools/dynamic-programming',
  },
  {
    id: 'output-bound',
    prompt:
      'A function materializes all permutations of n distinct values as separate length-n arrays. What output-size lower bound must its analysis include?',
    choices: ['Ω(n)', 'Ω(n!)', 'Ω(n · n!)'],
    answer: 2,
    explanation:
      'There are n! permutations, each containing n copied entries. Writing the full result alone requires n · n! element writes. A generator can change peak retained output, but producing all arrays still requires that work.',
    guide: '/patterns/backtracking',
  },
];

export interface ReviewRecord {
  level: number;
  due: number;
}
export function scheduleReview(
  previous: ReviewRecord | undefined,
  remembered: boolean,
  now: number,
): ReviewRecord {
  const level = remembered ? Math.min(5, (previous?.level || 0) + 1) : 0;
  const days = [0, 1, 3, 7, 14, 30][level];
  return { level, due: now + (remembered ? days * 86400000 : 600000) };
}

export function readReviews(value: string | null, ids: string[]): Record<string, ReviewRecord> {
  try {
    const parsed = JSON.parse(value || '{}');
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return Object.fromEntries(
      ids
        .filter((id) => {
          const record = parsed[id];
          return (
            record &&
            Number.isInteger(record.level) &&
            record.level >= 0 &&
            record.level <= 5 &&
            Number.isFinite(record.due) &&
            record.due >= 0 &&
            record.due <= 8640000000000000
          );
        })
        .map((id) => [id, { level: parsed[id].level, due: parsed[id].due }]),
    );
  } catch {
    return {};
  }
}
