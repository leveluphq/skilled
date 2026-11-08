export interface OutputQuestion {
  id: string;
  title: string;
  code: string;
  answer: string;
  choices: { id: string; output: string; reason: string }[];
  explanation: string;
  followUp: string;
  guide: string;
  guideTitle: string;
  reference: { title: string; url: string };
}

// These are reviewed examples, displayed as text. The application never evaluates them.
export const outputQuestions: OutputQuestion[] = [
  {
    id: 'live-binding',
    title: 'A closure reads a changed binding',
    code: `let count = 1;
const read = () => count;
count = 3;
console.log(read());`,
    answer: 'three',
    choices: [
      { id: 'one', output: '1', reason: 'Creating the arrow does not take a snapshot of count.' },
      { id: 'three', output: '3', reason: 'The closure reads the binding when read() executes.' },
      {
        id: 'undefined',
        output: 'undefined',
        reason: 'count is initialized and remains in scope.',
      },
      {
        id: 'error',
        output: 'ReferenceError',
        reason: 'The binding is accessible from the arrow.',
      },
    ],
    explanation:
      'The arrow retains access to the surrounding count binding. The assignment changes that same binding before read() runs. A closure can preserve access to a variable without preserving its old value.',
    followUp:
      'Assign count to a new const before creating the arrow. Which binding must the arrow read to preserve 1?',
    guide: '/interview-prep/javascript',
    guideTitle: 'JavaScript preparation',
    reference: {
      title: 'MDN: closures',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures',
    },
  },
  {
    id: 'let-loop',
    title: 'Loop callbacks with let',
    code: `const reads = [];
for (let i = 0; i < 3; i += 1) reads.push(() => i);
console.log(reads.map((read) => read()).join(','));`,
    answer: 'separate',
    choices: [
      {
        id: 'shared',
        output: '3,3,3',
        reason: 'That is the result of a shared var binding, not this let loop.',
      },
      {
        id: 'separate',
        output: '0,1,2',
        reason: 'Each loop iteration provides its own i binding to its closure.',
      },
      {
        id: 'late',
        output: '1,2,3',
        reason: 'The callback closes over the current iteration before the next increment.',
      },
      { id: 'empty', output: '', reason: 'Three callbacks are pushed and map invokes each one.' },
    ],
    explanation:
      'A for loop with this let declaration creates a fresh iteration binding. The callbacks run later, but they read different bindings holding 0, 1, and 2. Delayed execution alone does not imply that every closure shares one variable.',
    followUp: 'Replace let with var and explain the next question before checking it.',
    guide: '/interview-prep/javascript',
    guideTitle: 'JavaScript preparation',
    reference: {
      title: 'MDN: closures in loops',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures#creating_closures_in_loops_a_common_mistake',
    },
  },
  {
    id: 'var-loop',
    title: 'Loop callbacks with var',
    code: `const reads = [];
for (var i = 0; i < 3; i += 1) reads.push(() => i);
console.log(reads.map((read) => read()).join(','));`,
    answer: 'shared',
    choices: [
      {
        id: 'separate',
        output: '0,1,2',
        reason: 'var does not create a new binding for each iteration.',
      },
      {
        id: 'late',
        output: '1,2,3',
        reason: 'All reads happen after the loop, not between its increments.',
      },
      {
        id: 'shared',
        output: '3,3,3',
        reason: 'All three closures read the same binding after the final increment.',
      },
      {
        id: 'error',
        output: 'ReferenceError',
        reason: 'The function-scoped var remains accessible after the loop.',
      },
    ],
    explanation:
      'The callbacks share one function-scoped i. The loop finishes when i reaches 3, and only afterward does map call the callbacks. Each invocation reads that final value. No timers are needed to produce this behavior.',
    followUp:
      'Pass i into a callback factory with a parameter. Explain why that also separates the saved values.',
    guide: '/interview-prep/javascript',
    guideTitle: 'JavaScript preparation',
    reference: {
      title: 'MDN: var',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/var',
    },
  },
  {
    id: 'detached-receiver',
    title: 'A method loses its receiver',
    code: `const box = {
  value: 7,
  read() { return this === undefined ? 'unbound' : this.value; }
};
const read = box.read;
console.log(box.read(), read());`,
    answer: 'unbound',
    choices: [
      { id: 'both', output: '7 7', reason: 'Saving a function in read does not bind it to box.' },
      {
        id: 'undefined',
        output: '7 undefined',
        reason: 'The explicit guard returns the string unbound for an undefined receiver.',
      },
      {
        id: 'unbound',
        output: '7 unbound',
        reason: 'box.read() supplies box; the plain strict-mode call supplies undefined.',
      },
      {
        id: 'error',
        output: 'TypeError',
        reason: 'The guard avoids reading this.value when this is undefined.',
      },
    ],
    explanation:
      'For an ordinary function, the invocation determines this. The property call uses box as receiver. The detached plain call has an undefined receiver under the stated strict-mode contract. The function body handles that case explicitly.',
    followUp: 'Replace the assignment with box.read.bind(box). Which call forms then return 7?',
    guide: '/interview-prep/javascript',
    guideTitle: 'JavaScript function context',
    reference: {
      title: 'MDN: this',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this',
    },
  },
  {
    id: 'arrow-receiver',
    title: 'An arrow keeps its enclosing receiver',
    code: `function makeReader() { return () => this.value; }
const read = makeReader.call({ value: 4 });
console.log(read.call({ value: 9 }));`,
    answer: 'four',
    choices: [
      { id: 'nine', output: '9', reason: 'call cannot replace the lexical this of an arrow.' },
      { id: 'four', output: '4', reason: 'The arrow uses this from the makeReader invocation.' },
      {
        id: 'undefined',
        output: 'undefined',
        reason: 'makeReader receives an explicit object with a value property.',
      },
      {
        id: 'error',
        output: 'TypeError',
        reason: 'Calling an arrow with call is legal; its receiver argument is ignored.',
      },
    ],
    explanation:
      "makeReader is an ordinary function, so call supplies its receiver. The arrow captures that invocation's this. A later call on the arrow can pass arguments but cannot replace its captured receiver.",
    followUp: 'Return an ordinary function instead of an arrow. What does the final call print?',
    guide: '/interview-prep/javascript',
    guideTitle: 'JavaScript function context',
    reference: {
      title: 'MDN: arrow functions',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions',
    },
  },
  {
    id: 'shallow-spread',
    title: 'Object spread shares a nested object',
    code: `const original = { nested: { count: 1 }, label: 'a' };
const copy = { ...original };
copy.nested.count = 2;
copy.label = 'b';
console.log(original.nested.count, original.label);`,
    answer: 'shared-nested',
    choices: [
      {
        id: 'independent',
        output: '1 a',
        reason: 'The new outer object still holds the same nested object reference.',
      },
      {
        id: 'same-object',
        output: '2 b',
        reason: 'The outer objects differ, so assigning copy.label does not change original.label.',
      },
      {
        id: 'shared-nested',
        output: '2 a',
        reason: 'The nested mutation is shared; the outer label assignment is separate.',
      },
      {
        id: 'frozen',
        output: 'TypeError',
        reason: 'const prevents rebinding, not ordinary property mutation.',
      },
    ],
    explanation:
      'Spread copies these enumerable own property values into a new outer object. The nested property value is a reference to the same object. The label value is a string; replacing that property on copy leaves the property on original unchanged.',
    followUp:
      'Copy nested with another spread. Which deeper references would still need attention?',
    guide: '/guides/typescript-collections',
    guideTitle: 'Collections and readonly contracts',
    reference: {
      title: 'MDN: spread syntax',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax',
    },
  },
  {
    id: 'default-sort',
    title: 'Numeric values with the default sort',
    code: `const values = [2, 11, 3];
values.sort();
console.log(JSON.stringify(values));`,
    answer: 'strings',
    choices: [
      {
        id: 'numeric',
        output: '[2,3,11]',
        reason: 'Numeric ascending order requires an appropriate comparator.',
      },
      {
        id: 'unchanged',
        output: '[2,11,3]',
        reason:
          'sort mutates this array; its result is not discarded by ignoring the return value.',
      },
      {
        id: 'strings',
        output: '[11,2,3]',
        reason: 'Default sorting compares the string forms, placing 11 before 2.',
      },
      {
        id: 'converted',
        output: '["11","2","3"]',
        reason: 'String comparison does not replace these stored numbers with strings.',
      },
    ],
    explanation:
      "Without a comparator, sort orders these values by their string forms. The string 11 begins with 1 and comes before 2. The array is mutated, while its elements remain numbers. JSON.stringify fixes the display format instead of relying on a console's object inspector.",
    followUp: 'Add (a, b) => a - b. Then preserve the input by sorting a shallow array copy.',
    guide: '/topics/searching-and-sorting',
    guideTitle: 'Searching and sorting',
    reference: {
      title: 'MDN: Array.sort',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort',
    },
  },
  {
    id: 'map-identity',
    title: 'Object keys in a Map',
    code: `const key = { id: 1 };
const values = new Map([[key, 'saved']]);
console.log(values.has({ id: 1 }), values.has(key));`,
    answer: 'identity',
    choices: [
      {
        id: 'structural',
        output: 'true true',
        reason: 'Matching properties do not make distinct objects the same Map key.',
      },
      {
        id: 'identity',
        output: 'false true',
        reason: 'Only the second lookup uses the stored object reference.',
      },
      {
        id: 'neither',
        output: 'false false',
        reason: 'Map supports object keys and retains the original reference.',
      },
      {
        id: 'string',
        output: 'true false',
        reason: 'Map does not coerce these object keys to property-name strings.',
      },
    ],
    explanation:
      'Each object literal creates a distinct object. Map compares object keys by identity, so a new object with the same id does not find the entry. The saved key variable does. Use primitive IDs deliberately when the task needs equality by identifier.',
    followUp:
      'Compare new Map([[NaN, 1]]).has(NaN) with NaN === NaN. Which equality rule does Map use?',
    guide: '/guides/typescript-collections',
    guideTitle: 'Collection key identity',
    reference: {
      title: 'MDN: Map key equality',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map#key_equality',
    },
  },
  {
    id: 'defaults',
    title: 'Null, zero, and defaulting rules',
    code: `const { count = 5 } = { count: null };
console.log(count, 0 || 5, 0 ?? 5);`,
    answer: 'different',
    choices: [
      {
        id: 'all-five',
        output: '5 5 5',
        reason: 'Neither destructuring defaults nor ?? replace every falsy value.',
      },
      {
        id: 'all-zero',
        output: 'null 0 0',
        reason: 'Zero is falsy, so || selects its right operand here.',
      },
      {
        id: 'different',
        output: 'null 5 0',
        reason: 'Destructuring defaults on undefined; || on falsiness; ?? on null or undefined.',
      },
      {
        id: 'nullish-default',
        output: '5 5 0',
        reason: 'A destructuring default does not replace an explicitly present null.',
      },
    ],
    explanation:
      'The property is null, so its destructuring default is unused. Logical OR treats zero as falsy and returns 5. Nullish coalescing preserves zero because zero is neither null nor undefined. Choosing an operator requires deciding which missing-value contract the data uses.',
    followUp:
      'Change count to undefined and replace both zero operands with an empty string. Trace each result.',
    guide: '/guides/typescript-collections',
    guideTitle: 'Missing-value contracts',
    reference: {
      title: 'MDN: nullish coalescing',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing',
    },
  },
  {
    id: 'promise-job',
    title: 'A fulfilled promise still schedules its handler',
    code: `console.log('A');
Promise.resolve().then(() => console.log('B'));
console.log('C');`,
    answer: 'deferred',
    choices: [
      {
        id: 'inline',
        output: 'A\nB\nC',
        reason: 'A then handler does not run inline just because the promise is already fulfilled.',
      },
      {
        id: 'deferred',
        output: 'A\nC\nB',
        reason: 'The current synchronous work finishes before the queued reaction runs.',
      },
      {
        id: 'first',
        output: 'B\nA\nC',
        reason: 'Scheduling a handler does not run it before earlier synchronous statements.',
      },
      {
        id: 'missing',
        output: 'A\nC',
        reason: 'The handler runs after synchronous execution; it is not cancelled.',
      },
    ],
    explanation:
      'A and C are logged during the current synchronous execution. then queues a reaction for the fulfilled promise, and that reaction later logs B. There is no timer deadline to estimate in this example.',
    followUp:
      'Schedule another fulfilled-promise handler after logging C. Which reaction was enqueued first?',
    guide: '/guides/javascript-event-loop',
    guideTitle: 'Event-loop execution traces',
    reference: {
      title: 'MDN: Promise.then',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then',
    },
  },
  {
    id: 'await-boundary',
    title: 'An await of a non-promise value',
    code: `async function work() {
  console.log('start');
  await 0;
  console.log('resume');
}
work();
console.log('end');`,
    answer: 'suspend',
    choices: [
      {
        id: 'all-async',
        output: 'end\nstart\nresume',
        reason: 'Calling the async function begins its body synchronously.',
      },
      {
        id: 'inline',
        output: 'start\nresume\nend',
        reason: 'Await suspends this function even for the plain value 0.',
      },
      {
        id: 'suspend',
        output: 'start\nend\nresume',
        reason: 'The body runs until await, returns control, and resumes later.',
      },
      { id: 'error', output: 'TypeError', reason: 'Await accepts non-promise values.' },
    ],
    explanation:
      'The work call logs start before reaching await. Await turns the value into a fulfilled promise and suspends the function. The caller logs end while the continuation waits. The continuation then logs resume. An async function is not a separate thread.',
    followUp: 'Remove await but retain async. Does the ordering of the two body logs change?',
    guide: '/guides/javascript-event-loop',
    guideTitle: 'Async execution traces',
    reference: {
      title: 'MDN: await',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await',
    },
  },
  {
    id: 'finally-value',
    title: 'A successful finally preserves fulfillment',
    code: `Promise.resolve(2)
  .finally(() => 9)
  .then((value) => console.log(value));`,
    answer: 'preserved',
    choices: [
      {
        id: 'replaced',
        output: '9',
        reason:
          'A successful finally callback does not replace fulfillment with its ordinary return value.',
      },
      {
        id: 'empty',
        output: 'undefined',
        reason: 'The prior fulfillment value is forwarded through this successful finally.',
      },
      {
        id: 'preserved',
        output: '2',
        reason: 'The callback completes successfully, so the chain keeps the original fulfillment.',
      },
      {
        id: 'both',
        output: '2\n9',
        reason: 'There is only one log call, in the final then handler.',
      },
    ],
    explanation:
      'finally is useful for cleanup that should preserve the prior outcome when cleanup succeeds. Returning 9 succeeds, and the following handler receives 2. If the callback throws or returns a rejected promise, the resulting rejection changes the chain instead.',
    followUp:
      'Replace finally with then. Then restore finally and make its callback throw; add a rejection handler.',
    guide: '/guides/implement-promise-all',
    guideTitle: 'Promise behavior and aggregation',
    reference: {
      title: 'MDN: Promise.finally',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/finally',
    },
  },
];
