import * as React from 'react';
import Link from 'next/link';
import { ReasoningQuestion } from 'utils/shared/reasoningPractice';
import { ToolPanel, Buttons } from '../styles';

export default function ReasoningQuiz({
  questions,
  title,
}: {
  questions: ReasoningQuestion[];
  title: string;
}) {
  const [index, setIndex] = React.useState(0);
  const [selected, setSelected] = React.useState<number | null>(null);
  const [checked, setChecked] = React.useState(false);
  const [results, setResults] = React.useState<Record<string, boolean>>({});
  const question = questions[index];
  const heading = React.useRef<HTMLHeadingElement>(null);
  const next = () => {
    setIndex((index + 1) % questions.length);
    setSelected(null);
    setChecked(false);
    heading.current?.focus();
  };
  return (
    <ToolPanel aria-labelledby="reasoning-title">
      <h2 id="reasoning-title" ref={heading} tabIndex={-1}>
        {title}
      </h2>
      <p>
        Question {index + 1} of {questions.length}. Explain your choice before checking.
      </p>
      <fieldset disabled={checked} style={{ border: 0, padding: 0, minWidth: 0 }}>
        <legend style={{ lineHeight: 1.8, marginBottom: 16 }}>{question.prompt}</legend>
        {question.choices.map((choice, i) => (
          <label
            key={choice}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              padding: '12px 0',
              minHeight: 44,
            }}
          >
            <input
              type="radio"
              name="reasoning-answer"
              checked={selected === i}
              onChange={() => setSelected(i)}
              style={{ marginTop: 5, flexShrink: 0 }}
            />
            {choice}
          </label>
        ))}
      </fieldset>
      <Buttons>
        {!checked ? (
          <button
            disabled={selected === null}
            onClick={() => {
              setChecked(true);
              setResults({ ...results, [question.id]: selected === question.answer });
            }}
          >
            Check reasoning
          </button>
        ) : (
          <button onClick={next}>
            {index + 1 === questions.length ? 'Review from the beginning' : 'Next question'}
          </button>
        )}
      </Buttons>
      {checked && (
        <div role="status">
          <h3>
            {selected === question.answer
              ? 'Correct.'
              : `Answer: ${question.choices[question.answer]}`}
          </h3>
          <p>{question.explanation}</p>
          <Link href={question.guide}>
            <a>Study the worked explanation</a>
          </Link>
        </div>
      )}
      <p>
        {Object.values(results).filter(Boolean).length} correct across {Object.keys(results).length}{' '}
        checked prompts. This records this session’s latest answer per prompt.
      </p>
      <details>
        <summary>Read all prompts and worked answers</summary>
        {questions.map((item) => (
          <section key={item.id}>
            <h3>{item.prompt}</h3>
            <p>
              {item.choices[item.answer]}. {item.explanation}
            </p>
            <Link href={item.guide}>
              <a>Related practice</a>
            </Link>
          </section>
        ))}
      </details>
    </ToolPanel>
  );
}
