import * as React from 'react';
import Link from 'next/link';
import { learningEvent } from 'utils/client/learningEvents';
import { ToolPanel, Controls, Buttons } from '../styles';

const exercises = [
  {
    slug: 'target-two-sum',
    title: 'Two Sum',
    prompt:
      'Given unique integer values and a target, return all pairs of distinct original indexes whose values sum to the target. Preserve the input.',
    clarify:
      'Ask whether values are unique, whether all pairs are required, and how integer bounds are handled.',
    cases:
      '[2, 7], target 9 → [[0, 1]]; [], target 0 → []; [-2, 0, 2], target 0 → [[0, 2]]. Pair ordering can be normalized for comparison.',
  },
  {
    slug: 'valid-brackets',
    title: 'Valid brackets',
    prompt:
      'Return whether ASCII (), [], and {} delimiters are balanced and correctly nested. Ignore ordinary non-bracket text.',
    clarify:
      'Confirm the delimiter alphabet, whether ordinary text is ignored, and whether empty input is valid.',
    cases: '"" → true; "hello (world)" → true; "([)]" → false; ")(" → false; "{" → false.',
  },
  {
    slug: 'product-array',
    title: 'Product except self',
    prompt:
      'For every position, return the product of all other entries without division. Preserve input. Use the empty-product convention and assume representable intermediate products.',
    clarify:
      'Ask about zeros, singleton input, output storage, division, and the supported numeric range.',
    cases: '[] → []; [7] → [1]; [2, 3, 4] → [12, 8, 6]; [0, 2, 0] → [0, 0, 0].',
  },
];
const rubric = [
  'I clarified the output, constraints, and missing-answer behavior.',
  'I wrote a concrete example and a counterexample before coding.',
  'I explained a baseline approach and why the improved approach works.',
  'I stated an invariant and checked it during a dry run.',
  'I tested empty, boundary, and contract-specific cases.',
  'I justified time, auxiliary space, and output costs separately.',
  'I identified one uncertainty and a specific next practice task.',
];

export default function InterviewRehearsal() {
  const [slug, setSlug] = React.useState(exercises[0].slug);
  const [minutes, setMinutes] = React.useState(35);
  const [remaining, setRemaining] = React.useState(35 * 60);
  const [running, setRunning] = React.useState(false);
  const [started, setStarted] = React.useState(false);
  const [finished, setFinished] = React.useState(false);
  const [notes, setNotes] = React.useState('');
  const [checked, setChecked] = React.useState<number[]>([]);
  const deadline = React.useRef(0);
  const exercise = exercises.find((item) => item.slug === slug)!;
  React.useEffect(() => {
    if (!running) return;
    const tick = () => {
      const seconds = Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000));
      setRemaining(seconds);
      if (seconds === 0) {
        setRunning(false);
        setFinished(true);
      }
    };
    tick();
    const timer = window.setInterval(tick, 500);
    return () => window.clearInterval(timer);
  }, [running]);
  const start = () => {
    deadline.current = Date.now() + remaining * 1000;
    setRunning(true);
    setStarted(true);
    if (!started) learningEvent('rehearsal_started', '/tools/interview-rehearsal');
  };
  const finish = () => {
    setRunning(false);
    setFinished(true);
    learningEvent('rehearsal_completed', '/tools/interview-rehearsal');
  };
  const reset = () => {
    setRunning(false);
    setStarted(false);
    setFinished(false);
    setRemaining(minutes * 60);
    setChecked([]);
  };
  const download = () => {
    const text = `# ${exercise.title}: interview rehearsal\n\nBudget: ${minutes} minutes\n\n${exercise.prompt}\n\n## Notes\n\n${notes}\n\n## Self-review\n\n${rubric.map((item, i) => `- [${checked.includes(i) ? 'x' : ' '}] ${item}`).join('\n')}\n`;
    const url = URL.createObjectURL(new Blob([text], { type: 'text/markdown;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'interview-rehearsal.md';
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <ToolPanel aria-labelledby="rehearsal-title">
      <h2 id="rehearsal-title">Practice a complete interview conversation</h2>
      <Controls>
        <label>
          Exercise
          <select
            disabled={started && !finished}
            value={slug}
            onChange={(event) => {
              setSlug(event.target.value);
              reset();
            }}
          >
            {exercises.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          Time budget
          <select
            disabled={started && !finished}
            value={minutes}
            onChange={(event) => {
              const value = Number(event.target.value);
              setMinutes(value);
              setRemaining(value * 60);
              setStarted(false);
              setFinished(false);
              setChecked([]);
            }}
          >
            {[20, 35, 45, 60].map((value) => (
              <option key={value} value={value}>
                {value} minutes
              </option>
            ))}
          </select>
        </label>
      </Controls>
      <p>{exercise.prompt}</p>
      <p>
        <output aria-label="Time remaining">
          {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')}
        </output>{' '}
        remaining. The timer uses wall-clock time, including time spent in another tab.
      </p>
      <Buttons>
        {!finished &&
          (running ? (
            <button
              onClick={() => {
                setRemaining(Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000)));
                setRunning(false);
              }}
            >
              Pause timer
            </button>
          ) : (
            <button onClick={start}>{started ? 'Resume timer' : 'Start rehearsal'}</button>
          ))}
        {started && !finished && <button onClick={finish}>Finish and review</button>}
        <button onClick={reset}>Reset timer and review</button>
      </Buttons>
      <p role="status" aria-label="Rehearsal status">
        {finished
          ? 'Rehearsal finished. Review the evidence below; there is no automated hiring score.'
          : running
            ? 'Timer running. Explain your reasoning aloud.'
            : 'Timer paused. Notes stay on this page until you leave or reload.'}
      </p>
      <details>
        <summary>Clarifying prompts and example checks</summary>
        <p>{exercise.clarify}</p>
        <p>{exercise.cases}</p>
      </details>
      <p>
        <Link href={`/course/${exercise.slug}`}>
          <a target="_blank" rel="noopener noreferrer">
            Open the coding exercise in another tab
          </a>
        </Link>
        . Execution and access follow that deployment’s normal lesson settings.
      </p>
      <label>
        Reasoning, test cases, and next practice task
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Write your invariant, a failing test, or the explanation you want to improve."
        />
      </label>
      <fieldset style={{ border: 0, padding: 0, marginTop: 20 }}>
        <legend>Self-review based on what you observed</legend>
        {rubric.map((item, i) => (
          <label key={item} style={{ padding: '12px 0', minHeight: 44 }}>
            <input
              type="checkbox"
              checked={checked.includes(i)}
              onChange={() =>
                setChecked((items) =>
                  items.includes(i) ? items.filter((item) => item !== i) : [...items, i],
                )
              }
            />
            {item}
          </label>
        ))}
      </fieldset>
      <Buttons>
        <button onClick={download}>Download notes and rubric</button>
      </Buttons>
      <p>
        Downloads are created in your browser. Notes and rubric answers are not sent to the server.
      </p>
    </ToolPanel>
  );
}
