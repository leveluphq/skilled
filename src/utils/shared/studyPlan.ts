export type StudyTrack = 'balanced' | 'foundations' | 'javascript';
export interface PlanOptions {
  days: number;
  minutes: number;
  track: StudyTrack;
}
export interface StudyModule {
  id: string;
  title: string;
  read: string;
  practice: string;
  objective: string;
}

const modules: StudyModule[] = [
  {
    id: 'complexity',
    title: 'Complexity and constraints',
    read: '/guides/big-o-time-space-complexity',
    practice: '/course/big-o-time-and-space-complexity',
    objective: 'Count the work and auxiliary memory of two different solutions.',
  },
  {
    id: 'arrays',
    title: 'Arrays and hash maps',
    read: '/topics/arrays',
    practice: '/course/target-two-sum',
    objective: 'Explain the lookup invariant and test repeated values and missing answers.',
  },
  {
    id: 'pointers',
    title: 'Two pointers',
    read: '/patterns/two-pointers',
    practice: '/course/best-time-to-buy-and-sell-stock',
    objective: 'Explain why each discarded candidate cannot improve the answer.',
  },
  {
    id: 'windows',
    title: 'Sliding windows',
    read: '/patterns/sliding-window',
    practice: '/patterns/sliding-window#practice-the-invariant-before-the-template',
    objective: 'Implement a window and explain exactly when its left edge moves.',
  },
  {
    id: 'prefix',
    title: 'Prefix sums',
    read: '/patterns/prefix-sums',
    practice: '/patterns/prefix-sums#test-the-contract',
    objective:
      'Compare range subtraction and prefix-frequency counting with a small exhaustive baseline.',
  },
  {
    id: 'search',
    title: 'Binary-search boundaries',
    read: '/patterns/binary-search',
    practice: '/course/first-bad-version',
    objective: 'State the boundary invariant and trace empty, duplicate, and all-false inputs.',
  },
  {
    id: 'lists',
    title: 'Linked-list pointers',
    read: '/topics/linked-lists',
    practice: '/course/reverse-a-linked-list',
    objective: 'Trace the next pointer before each reassignment and test a one-node list.',
  },
  {
    id: 'stacks',
    title: 'Stacks and queues',
    read: '/topics/stacks-and-queues',
    practice: '/course/valid-brackets',
    objective: 'Describe what each stack entry means and reject mismatched closing brackets.',
  },
  {
    id: 'trees',
    title: 'Tree recursion',
    read: '/topics/trees',
    practice: '/course/binary-tree-max-depth',
    objective: 'Define the recursive return value and the empty-subtree base case.',
  },
  {
    id: 'graphs',
    title: 'Graph traversal',
    read: '/guides/bfs-vs-dfs',
    practice: '/course/count-islands',
    objective: 'Track visited cells and explain queue versus recursion memory.',
  },
  {
    id: 'backtracking',
    title: 'Backtracking',
    read: '/patterns/backtracking',
    practice: '/course/generate-all-permutations',
    objective: 'Choose, recurse, undo, and copy each completed result.',
  },
  {
    id: 'dp',
    title: 'Dynamic programming',
    read: '/patterns/dynamic-programming',
    practice: '/course/steal-packages',
    objective: 'Define the state and compare the recurrence with exhaustive small cases.',
  },
  {
    id: 'monotonic',
    title: 'Monotonic stacks',
    read: '/patterns/monotonic-stack',
    practice: '/patterns/monotonic-stack#practice-the-comparison-rule',
    objective: 'Explain why a popped index will never need to return to the stack.',
  },
  {
    id: 'heaps',
    title: 'Heaps and top-K',
    read: '/patterns/heaps-and-priority-queues',
    practice: '/patterns/heaps-and-priority-queues#test-and-extend-the-heap',
    objective: 'Keep the K largest values and compare the result with a numeric sort.',
  },
  {
    id: 'explain',
    title: 'Explain and test a solution',
    read: '/guides/explain-your-interview-solution',
    practice: '/tools/pattern-quiz',
    objective: 'State the contract, justify the approach, and test the weakest assumption.',
  },
  {
    id: 'js-language',
    title: 'JavaScript collections and contracts',
    read: '/interview-prep/javascript',
    practice: '/course/array-methods',
    objective: 'Check mutation, return types, and the cost of the array operations you use.',
  },
  {
    id: 'event-loop',
    title: 'Tasks and microtasks',
    read: '/guides/javascript-event-loop',
    practice: '/guides/javascript-event-loop#a-repeatable-method-for-output-questions',
    objective: 'Write the output order before running the code and explain each queue transition.',
  },
  {
    id: 'promises',
    title: 'Promise aggregation',
    read: '/guides/implement-promise-all',
    practice: '/course/build-a-javascript-promise',
    objective: 'Test input order, empty input, rejection, and plain values.',
  },
  {
    id: 'timing',
    title: 'Debounce and throttle',
    read: '/guides/debounce-vs-throttle',
    practice: '/tools/debounce-throttle',
    objective: 'Specify leading and trailing behavior, then test a boundary timestamp.',
  },
  {
    id: 'events',
    title: 'Events and subscriptions',
    read: '/topics/javascript',
    practice: '/course/pub-sub-and-event-driven-programming',
    objective: 'Specify subscribe, publish, and unsubscribe behavior before implementing it.',
  },
  {
    id: 'this',
    title: 'Function context',
    read: '/interview-prep/javascript#function-calls-and-this',
    practice: '/course/fix-this',
    objective: 'Explain how the call site determines this and distinguish arrow-function capture.',
  },
];

export const studyTracks: Record<StudyTrack, { title: string; modules: string[] }> = {
  balanced: {
    title: 'Algorithms and data structures',
    modules: [
      'complexity',
      'arrays',
      'pointers',
      'windows',
      'prefix',
      'search',
      'lists',
      'stacks',
      'trees',
      'graphs',
      'backtracking',
      'dp',
      'monotonic',
      'heaps',
      'explain',
    ],
  },
  foundations: {
    title: 'Core foundations',
    modules: ['complexity', 'arrays', 'pointers', 'search', 'stacks', 'trees', 'graphs', 'explain'],
  },
  javascript: {
    title: 'JavaScript and frontend',
    modules: [
      'js-language',
      'complexity',
      'arrays',
      'this',
      'event-loop',
      'promises',
      'timing',
      'events',
      'explain',
    ],
  },
};

export interface StudySession {
  id: string;
  kind: 'learn' | 'practice' | 'review';
  module: StudyModule;
  minutes: 30;
}
export interface StudyDay {
  day: number;
  sessions: StudySession[];
}
export interface StudyPlan {
  options: PlanOptions;
  days: StudyDay[];
  unstarted: StudyModule[];
  unfinished: StudyModule[];
}
export const defaultPlanOptions: PlanOptions = { days: 14, minutes: 60, track: 'balanced' };
export const planStorageKey = 'skilled.study-plan.v1';

export function validatePlanOptions(value: unknown): PlanOptions {
  const options = value as PlanOptions | null;
  if (!options || !Number.isInteger(options.days) || options.days < 3 || options.days > 60)
    throw new Error('Choose a whole number of study days from 3 to 60.');
  if (![30, 60, 90, 120].includes(options.minutes))
    throw new Error('Choose 30, 60, 90, or 120 minutes per day.');
  if (
    typeof options.track !== 'string' ||
    !Object.prototype.hasOwnProperty.call(studyTracks, options.track)
  )
    throw new Error('Choose one of the available study tracks.');
  return { days: options.days, minutes: options.minutes, track: options.track };
}

export function buildStudyPlan(input: PlanOptions): StudyPlan {
  const options = validatePlanOptions(input);
  const selected = studyTracks[options.track].modules.map((id) => {
    const module = modules.find((item) => item.id === id);
    if (!module) throw new Error(`Missing study module: ${id}`);
    return module;
  });
  const tasks = selected.flatMap((module) => [
    { kind: 'learn' as const, module },
    { kind: 'practice' as const, module },
  ]);
  const reviewQueue: StudyModule[] = [];
  let next = 0;
  let slot = 0;
  const days = Array.from({ length: options.days }, (_, day) => ({
    day: day + 1,
    sessions: Array.from({ length: options.minutes / 30 }, () => {
      slot += 1;
      let task: { kind: StudySession['kind']; module: StudyModule };
      if (reviewQueue.length && (slot % 5 === 0 || next === tasks.length)) {
        const module = reviewQueue.shift()!;
        reviewQueue.push(module);
        task = { kind: 'review', module };
      } else {
        task = tasks[next++];
        if (task.kind === 'practice') reviewQueue.push(task.module);
      }
      return {
        ...task,
        minutes: 30 as const,
        id: `${options.track}-${options.days}-${options.minutes}-${slot}-${task.module.id}-${task.kind}`,
      };
    }),
  }));
  const scheduled = days.flatMap((day) => day.sessions);
  return {
    options,
    days,
    unstarted: selected.filter((module) => !scheduled.some((s) => s.module.id === module.id)),
    unfinished: selected.filter(
      (module) => !scheduled.some((s) => s.module.id === module.id && s.kind === 'practice'),
    ),
  };
}

export function restoreStudyPlan(raw: string): { plan: StudyPlan; completed: string[] } {
  if (raw.length > 100000) throw new Error('Saved plan is too large.');
  const saved = JSON.parse(raw);
  if (!saved || saved.version !== 1) throw new Error('Saved plan version is unsupported.');
  const plan = buildStudyPlan(validatePlanOptions(saved.options));
  const ids = new Set(plan.days.flatMap((day) => day.sessions.map((session) => session.id)));
  const completed = Array.isArray(saved.completed)
    ? (Array.from(
        new Set(
          saved.completed.filter(
            (id: unknown): id is string => typeof id === 'string' && ids.has(id),
          ),
        ),
      ) as string[])
    : [];
  return { plan, completed };
}

export function planMarkdown(plan: StudyPlan, completed: string[], origin: string): string {
  const done = new Set(completed);
  const lines = [
    '# Coding interview study plan',
    '',
    `${studyTracks[plan.options.track].title}: ${plan.options.days} study days, ${
      plan.options.minutes
    } minutes per day.`,
    '',
    'Each block reserves 25 minutes for focused work and 5 minutes for notes. Allocations are adjustable; stop and reschedule when a topic needs more time.',
    '',
  ];
  for (const day of plan.days) {
    lines.push(`## Day ${day.day}`, '');
    for (const session of day.sessions) {
      const path = session.kind === 'learn' ? session.module.read : session.module.practice;
      lines.push(
        `- [${done.has(session.id) ? 'x' : ' '}] ${session.kind}: [${
          session.module.title
        }](${origin}${path}) (30 min)`,
        `  ${session.module.objective}`,
      );
    }
    lines.push('');
  }
  if (plan.unfinished.length)
    lines.push(
      '## Still to schedule',
      '',
      ...plan.unfinished.map((module) => `- ${module.title}: ${origin}${module.read}`),
      '',
    );
  lines.push(
    'Review: retry without your earlier code, change one constraint, and explain a failing case. Completion marks track these blocks only.',
    '',
  );
  return lines.join('\n');
}
