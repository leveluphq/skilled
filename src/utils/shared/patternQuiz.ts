export interface PatternChoice {
  id: string;
  title: string;
  explanation: string;
}
export interface PatternQuestion {
  id: string;
  prompt: string;
  choices: PatternChoice[];
  answer: string;
  guide: string;
  guideTitle: string;
  followUp: string;
}

export const patternQuestions: PatternQuestion[] = [
  {
    id: 'signed-subarray',
    prompt:
      'Count every contiguous subarray whose sum is K. Values may be positive, negative, or zero. Which approach gives expected O(n) time with a hash map?',
    answer: 'prefix',
    guide: '/patterns/prefix-sums',
    guideTitle: 'Prefix sums',
    followUp: 'Trace [0, 0] with K = 0. Why must a prefix map store frequencies rather than a set?',
    choices: [
      {
        id: 'window',
        title: 'A sum window that shrinks whenever the sum exceeds K',
        explanation:
          'With negative values, adding an element can lower the sum and removing one can raise it. This shrinking rule can discard a start index that becomes valid later.',
      },
      {
        id: 'prefix',
        title: 'Prefix sums plus a frequency map of earlier prefixes',
        explanation:
          'If the current prefix is S, each earlier prefix S − K identifies one valid start. Count matches before inserting S so an empty interval is not counted. Seed the map with prefix zero once.',
      },
      {
        id: 'sort',
        title: 'Sort the values and move two endpoints',
        explanation:
          'Sorting changes which values are contiguous. It solves a different problem unless the original order is irrelevant.',
      },
      {
        id: 'heap',
        title: 'A heap containing the largest values seen so far',
        explanation:
          'A heap tracks extrema, while this problem depends on differences between cumulative sums at earlier positions. It does not preserve the needed start-position counts.',
      },
    ],
  },
  {
    id: 'sorted-pair',
    prompt:
      'Find two distinct positions in an already sorted numeric array that sum to a target. Return any pair, use O(1) auxiliary space, and aim for O(n) time.',
    answer: 'pointers',
    guide: '/patterns/two-pointers',
    guideTitle: 'Two pointers',
    followUp: 'Explain why a sum that is too small lets you discard the current left value.',
    choices: [
      {
        id: 'map',
        title: 'Store every earlier value in a hash map',
        explanation:
          'A complement map can find a pair in expected linear time, but it can require linear auxiliary space. That violates the stated space target.',
      },
      {
        id: 'pairs',
        title: 'Try every pair',
        explanation:
          'Exhaustive pairs use constant auxiliary space but take quadratic time in the worst case.',
      },
      {
        id: 'pointers',
        title: 'Move inward from the left and right endpoints',
        explanation:
          'If the sum is too small, the current left value cannot pair successfully with any remaining value at or below the current right endpoint. Discard it. Use the symmetric argument when the sum is too large.',
      },
      {
        id: 'binary',
        title: 'Binary-search for a complement for each position',
        explanation:
          'This can satisfy the space target, but repeated logarithmic searches take O(n log n) time rather than the requested linear scan.',
      },
    ],
  },
  {
    id: 'first-true',
    prompt:
      'A predicate over indexes 0 through n − 1 is false for a prefix and true thereafter. One predicate call costs O(1). Find the first true index, returning n if none is true.',
    answer: 'boundary',
    guide: '/patterns/binary-search',
    guideTitle: 'Binary-search boundaries',
    followUp: 'Trace n = 0, an all-false input, and a first true value at index zero.',
    choices: [
      {
        id: 'boundary',
        title: 'Binary-search the false/true boundary',
        explanation:
          'A true midpoint keeps the first true index at or to its left; a false midpoint rules out everything through that midpoint. A half-open interval shrinks until its endpoints meet, including at the n sentinel.',
      },
      {
        id: 'scan',
        title: 'Always evaluate every index from left to right',
        explanation:
          'A scan is correct but can use n predicate calls. The monotone partition permits O(log n) calls.',
      },
      {
        id: 'dfs',
        title: 'Explore indexes with depth-first search',
        explanation:
          'There is no graph connectivity constraint to explore. Without using the monotone partition, a traversal offers no logarithmic bound.',
      },
      {
        id: 'random',
        title: 'Sample indexes until the predicate is true',
        explanation:
          'Finding any true index does not identify the first one. Random sampling also fails to certify an all-false input efficiently.',
      },
    ],
  },
  {
    id: 'unweighted-path',
    prompt:
      'A directed graph may contain cycles. Every edge counts as one hop. Find a path with the fewest hops from a start vertex to a target.',
    answer: 'bfs',
    guide: '/guides/bfs-vs-dfs',
    guideTitle: 'BFS versus DFS',
    followUp:
      'Give a graph where DFS first discovers a longer route than BFS. What changes if edge weights differ?',
    choices: [
      {
        id: 'dfs',
        title: 'Return the first path discovered by DFS',
        explanation:
          'DFS can descend a long branch before inspecting a one-edge shortcut. Its first discovery path has no general fewest-hop guarantee.',
      },
      {
        id: 'greedy',
        title: 'Choose the neighbor with the smallest label',
        explanation:
          'Vertex labels do not measure remaining distance. Label order can make traversal deterministic without making the result shortest.',
      },
      {
        id: 'sort',
        title: 'Sort all edges once',
        explanation:
          'Sorting edges does not establish distance layers from the start. The problem concerns connectivity and hop count, not the order of endpoint names.',
      },
      {
        id: 'bfs',
        title: 'BFS with a visited set and parent links',
        explanation:
          'BFS discovers vertices in increasing hop distance. Mark a vertex when enqueuing it, record its parent, and reconstruct the route after reaching the target. The guarantee relies on equal edge costs.',
      },
    ],
  },
  {
    id: 'next-warmer',
    prompt:
      'For each temperature in an array, report how many positions until the next strictly warmer temperature, or zero if none exists. Aim for O(n) total time.',
    answer: 'stack',
    guide: '/patterns/monotonic-stack',
    guideTitle: 'Monotonic stacks',
    followUp: 'For [70, 70, 71], which indexes should be resolved by the second 70?',
    choices: [
      {
        id: 'sort',
        title: 'Sort temperatures, then compare adjacent values',
        explanation:
          'The next warmer position depends on original order and distance. Sorting loses that positional relationship.',
      },
      {
        id: 'stack',
        title: 'Keep unresolved indexes in a decreasing-temperature stack',
        explanation:
          'When a warmer value arrives, resolve and pop every smaller temperature at the top. Those indexes have found their first warmer value. Each index is pushed once and popped at most once, giving linear total stack work.',
      },
      {
        id: 'prefix',
        title: 'Subtract two prefix sums',
        explanation:
          'A difference of sums gives a range total. It cannot identify the first later value that exceeds an individual temperature.',
      },
      {
        id: 'nested',
        title: 'Scan all later positions independently for every day',
        explanation:
          'This is a useful correctness baseline but takes quadratic time on a nonincreasing array.',
      },
    ],
  },
  {
    id: 'stream-top-k',
    prompt:
      'Values arrive in a stream of unknown length. After each value, retain the K largest values seen, including duplicates. K is much smaller than the stream. Use O(K) storage and O(log K) heap comparison work per update for K ≥ 2.',
    answer: 'heap',
    guide: '/patterns/heaps-and-priority-queues',
    guideTitle: 'Heaps and priority queues',
    followUp: 'Why is the root of this heap the smallest retained value rather than the largest?',
    choices: [
      {
        id: 'heap',
        title: 'A min-heap containing at most K values',
        explanation:
          'The root is the weakest retained candidate. Fill the heap, then replace the root only when an incoming value is larger. Sifting repairs the heap in logarithmic time; the retained array need not be sorted.',
      },
      {
        id: 'all',
        title: 'Store and sort the entire stream after each arrival',
        explanation:
          'This retains all values, violating O(K) storage, and repeated sorting exceeds the update bound.',
      },
      {
        id: 'max',
        title: 'A max-heap of K retained values with root-only eviction',
        explanation:
          'A max-heap exposes the strongest retained value. Evicting that root throws away a value you want to keep; locating the weakest candidate can require a scan.',
      },
      {
        id: 'queue',
        title: 'A FIFO queue containing the latest K values',
        explanation:
          'Arrival time does not determine rank. An old large value can remain in the top K long after smaller recent values arrive.',
      },
    ],
  },
  {
    id: 'all-subsets',
    prompt:
      'Generate every subset of n distinct values. Each output must be an independent array. Which method directly models the include-or-skip decisions?',
    answer: 'backtracking',
    guide: '/patterns/backtracking',
    guideTitle: 'Backtracking',
    followUp:
      'Why does saving the same mutable path object break the result? What is the output-size lower bound?',
    choices: [
      {
        id: 'greedy',
        title: 'Include a value only if it improves the current sum',
        explanation:
          'The task asks for every subset, including subsets with smaller sums. Greedy filtering removes required outputs.',
      },
      {
        id: 'binary',
        title: 'Binary-search one subset of the input',
        explanation:
          'There is no monotone predicate selecting a single boundary. The result includes exponentially many choices.',
      },
      {
        id: 'backtracking',
        title: 'Explore include/skip branches and copy the path at each leaf',
        explanation:
          'Every sequence of n binary decisions maps to one subset. Undo a chosen value after returning from its branch, and copy completed paths so later mutations do not alter earlier outputs. Copying all subsets costs Θ(n·2ⁿ) total output work for n ≥ 1.',
      },
      {
        id: 'window',
        title: 'Move two ends of a contiguous window',
        explanation:
          'Subsets may skip arbitrary middle elements. Contiguous windows cannot represent all subsets.',
      },
    ],
  },
  {
    id: 'nonadjacent',
    prompt:
      'Choose values from a line to maximize their sum, with no two chosen positions adjacent. Choosing nothing is allowed, and values may be negative. Return only the best sum.',
    answer: 'dp',
    guide: '/patterns/dynamic-programming',
    guideTitle: 'Dynamic programming',
    followUp:
      'Test [4, 5, 4] against choosing the largest available value greedily. What should an all-negative array return?',
    choices: [
      {
        id: 'greedy',
        title: 'Choose the largest value, remove its neighbors, and repeat',
        explanation:
          'On [4, 5, 4], taking 5 prevents taking both 4s. The optimal answer is 8, so a locally largest choice can lose.',
      },
      {
        id: 'window',
        title: 'Find the largest sum of a contiguous window',
        explanation:
          'The allowed selection can have gaps and must exclude adjacent positions. A contiguous-window maximum solves a different constraint.',
      },
      {
        id: 'sort',
        title: 'Sort the values and take the largest half',
        explanation:
          'Adjacency refers to original positions. Sorting destroys that relationship and cannot enforce the constraint.',
      },
      {
        id: 'dp',
        title: 'Track the best sum through the previous one and two positions',
        explanation:
          'For the current value, compare skipping it with taking it plus the best answer ending before its neighbor. Two running states suffice. Initial zero states allow an empty selection and keep an all-negative answer at zero.',
      },
    ],
  },
  {
    id: 'unique-window',
    prompt:
      'Find the longest contiguous substring with no repeated Unicode code point. Aim for expected O(n) time, where n is the number of code points.',
    answer: 'window',
    guide: '/patterns/sliding-window',
    guideTitle: 'Sliding windows',
    followUp:
      'Trace abba. Can removing a leftmost character introduce a repeated character into a valid window?',
    choices: [
      {
        id: 'window',
        title: 'A window with a set or frequency map, advancing the left edge until valid',
        explanation:
          'Each rightward extension introduces at most one repeated code point. Removing leftmost code points can restore uniqueness. Both pointers move forward at most n times. In JavaScript, iterate code points deliberately; user-perceived grapheme clusters need a separate definition.',
      },
      {
        id: 'sort',
        title: 'Sort the characters and count distinct values',
        explanation:
          'Distinct values across the whole string do not determine a longest valid contiguous substring. Sorting removes original positions.',
      },
      {
        id: 'prefix',
        title: 'Use only prefix sums of character codes',
        explanation:
          'Different character collections can have the same numeric sum. A sum alone does not preserve the identity or multiplicity needed to detect repetition.',
      },
      {
        id: 'binary',
        title: 'Binary-search the character values',
        explanation:
          'The characters are not partitioned into a sorted false/true boundary. The useful state is the current interval and its repeated values.',
      },
    ],
  },
  {
    id: 'static-ranges',
    prompt:
      'An array never changes after construction. Answer many sum queries over half-open index ranges [left, right). Spend O(n) preprocessing to make each query O(1).',
    answer: 'prefix',
    guide: '/patterns/prefix-sums',
    guideTitle: 'Prefix sums',
    followUp:
      'What should a query for [3, 3) return? How does a point update affect later prefix values?',
    choices: [
      {
        id: 'scan',
        title: 'Scan every requested range',
        explanation:
          'A scan can take linear time per query. It does not meet the constant-time query target.',
      },
      {
        id: 'stack',
        title: 'Keep a decreasing stack of indexes',
        explanation:
          'An ordering stack answers some next-greater queries. It does not preserve the cumulative arithmetic needed for arbitrary range sums.',
      },
      {
        id: 'prefix',
        title: 'Store a leading-zero prefix array and subtract prefix[right] − prefix[left]',
        explanation:
          'The two prefixes contain the same contribution before left; subtraction removes it. A leading zero also handles ranges starting at zero and empty ranges. The static-input assumption avoids costly prefix repairs after updates.',
      },
      {
        id: 'sort',
        title: 'Sort once, then use the endpoints',
        explanation:
          'Range indexes refer to the original array. Sorting changes which elements belong to each query and endpoints do not determine the sum.',
      },
    ],
  },
  {
    id: 'duplicates-boundary',
    prompt:
      'In a sorted numeric array with duplicates, find the first position whose value is at least target. Return the length if every value is smaller.',
    answer: 'lower',
    guide: '/patterns/binary-search',
    guideTitle: 'Binary-search boundaries',
    followUp:
      'For [2, 2, 2, 5] and target 2, what is the answer? Why can equality not return the midpoint immediately?',
    choices: [
      {
        id: 'any',
        title: 'Return immediately when any equal midpoint is found',
        explanation:
          'An equal midpoint may have equal elements before it. Immediate equality return does not establish the first valid position.',
      },
      {
        id: 'lower',
        title: 'Find the first true index of values[index] ≥ target',
        explanation:
          'The predicate is false for smaller values and true from the lower bound onward. On equality, retain the midpoint as a possible boundary and search to its left. The length sentinel handles a missing boundary.',
      },
      {
        id: 'heap',
        title: 'Copy the array into a heap',
        explanation:
          'The array already provides the sorted partition needed for logarithmic search. A heap adds construction work and does not retain sorted-index boundaries.',
      },
      {
        id: 'dfs',
        title: 'Recursively visit both halves every time',
        explanation:
          'Visiting both halves throws away the elimination argument that makes binary search logarithmic. It can visit the entire array.',
      },
    ],
  },
  {
    id: 'not-a-window',
    prompt:
      'Count subarrays summing to 3 in [4, −1]. A proposed algorithm discards the leftmost value as soon as its running sum exceeds 3. Which observation invalidates that algorithm?',
    answer: 'negative',
    guide: '/patterns/prefix-sums',
    guideTitle: 'Prefix sums and signed values',
    followUp:
      'Write a tiny exhaustive subarray counter and use it to test a prefix-frequency solution.',
    choices: [
      {
        id: 'empty',
        title: 'The input must be empty before a window can work',
        explanation:
          'Window methods are routinely useful on nonempty arrays. Emptiness is unrelated to the failure in this example.',
      },
      {
        id: 'quadratic',
        title: 'Every nested loop necessarily takes quadratic time',
        explanation:
          'Two forward-moving pointers can make linear total progress even with a nested loop. The issue here is correctness of discarding candidates.',
      },
      {
        id: 'sort',
        title: 'The values only need sorting first',
        explanation:
          'Sorting changes contiguity in the original input. It cannot repair this proposed algorithm while preserving the task.',
      },
      {
        id: 'negative',
        title:
          'A later negative value can lower the sum to the target after a valid start was discarded',
        explanation:
          'The whole interval [4, −1] sums to 3. Dropping 4 immediately loses it. A shrinking rule needs a monotone argument; signed values break this one. Prefix differences with frequencies preserve the earlier start.',
      },
    ],
  },
];

export function quizResults(ids: string[], answers: Record<string, string>) {
  const questions = ids.map((id) => patternQuestions.find((question) => question.id === id));
  if (questions.some((question) => !question) || new Set(ids).size !== ids.length)
    throw new Error('Invalid quiz question set.');
  const correct = questions.filter((question) => answers[question!.id] === question!.answer).length;
  const missed = questions
    .filter((question) => answers[question!.id] !== question!.answer)
    .map((question) => question!.id);
  return { correct, missed, total: ids.length };
}
