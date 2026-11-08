import * as React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { outputQuestions } from 'utils/shared/javascriptOutputQuiz';
import { ToolPanel, Buttons } from '../styles';

const Quiz = styled(ToolPanel)`
  min-width: 0;
  pre {
    padding: 16px;
    margin: 16px 0;
    border: 1px solid ${({ theme }) => theme.color.border};
    border-radius: 6px;
    overflow-x: auto;
    line-height: 1.65;
    font-size: 14px;
    max-width: 100%;
  }
  fieldset {
    min-width: 0;
    border: 0;
    margin: 20px 0;
    padding: 0;
  }
  legend,
  h3 {
    line-height: 1.7;
    font-size: 18px;
    margin: 18px 0;
  }
  label {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 14px;
    margin: 10px 0;
    border: 1px solid ${({ theme }) => theme.color.border};
    border-radius: 6px;
    cursor: pointer;
  }
  label code {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    line-height: 1.65;
  }
  label[data-selected='true'] {
    border-color: ${({ theme }) => theme.color.brand};
  }
  input[type='radio'] {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    margin: 3px 0 0;
    accent-color: ${({ theme }) => theme.color.brand};
  }
  details {
    border-top: 1px solid ${({ theme }) => theme.color.border};
    padding-top: 18px;
    margin-top: 26px;
  }
  summary {
    cursor: pointer;
    line-height: 1.7;
  }
  a {
    text-decoration: underline;
  }
  ul {
    padding-left: 22px;
  }
  li {
    line-height: 1.8;
    margin: 12px 0;
  }
`;

const allIds = outputQuestions.map((question) => question.id);
export default function JavaScriptOutputQuiz() {
  const [ids, setIds] = React.useState(allIds);
  const [index, setIndex] = React.useState(0);
  const [selected, setSelected] = React.useState('');
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [finished, setFinished] = React.useState(false);
  const title = React.useRef<HTMLHeadingElement>(null);
  const question = outputQuestions.find((item) => item.id === ids[index])!;
  const submitted = Object.prototype.hasOwnProperty.call(answers, question.id);
  const missed = ids.filter(
    (id) => answers[id] !== outputQuestions.find((q) => q.id === id)!.answer,
  );
  const correct = question.choices.find((choice) => choice.id === question.answer)!;
  const restart = (next: string[]) => {
    setIds(next);
    setIndex(0);
    setSelected('');
    setAnswers({});
    setFinished(false);
    title.current?.focus();
  };
  const advance = () => {
    if (index + 1 === ids.length) setFinished(true);
    else {
      setIndex((current) => current + 1);
      setSelected('');
    }
    title.current?.focus();
  };
  return (
    <Quiz aria-labelledby="output-quiz-title">
      <h2 id="output-quiz-title" tabIndex={-1} ref={title}>
        {finished
          ? 'Your JavaScript practice results'
          : `Output question ${index + 1} of ${ids.length}`}
      </h2>
      <p id="output-contract">
        Each snippet runs independently inside a strict-mode function. Wait for its promise jobs to
        finish. Each output line represents one console.log call; spaces separate its arguments.
      </p>
      {finished ? (
        <div>
          <p role="status">
            {ids.length - missed.length} of {ids.length} correct in this round.
          </p>
          <p>
            This score covers these snippets. Explain each execution trace before moving to a new
            example.
          </p>
          {missed.length > 0 && (
            <ul>
              {missed.map((id) => {
                const item = outputQuestions.find((q) => q.id === id)!;
                return (
                  <li key={id}>
                    {item.title}.{' '}
                    <Link href={item.guide}>
                      <a>Study {item.guideTitle.toLowerCase()}</a>
                    </Link>
                    .
                  </li>
                );
              })}
            </ul>
          )}
          <Buttons>
            {missed.length > 0 && (
              <button onClick={() => restart(missed)}>Retry missed snippets</button>
            )}
            <button onClick={() => restart(allIds)}>Start all snippets again</button>
          </Buttons>
        </div>
      ) : (
        <div>
          <h3>{question.title}</h3>
          <pre aria-label="JavaScript snippet">
            <code>{question.code}</code>
          </pre>
          <fieldset disabled={submitted} aria-describedby="output-contract">
            <legend>What is logged?</legend>
            {question.choices.map((choice) => (
              <label
                key={`${question.id}-${choice.id}`}
                htmlFor={`output-${question.id}-${choice.id}`}
                data-selected={selected === choice.id}
              >
                <input
                  type="radio"
                  id={`output-${question.id}-${choice.id}`}
                  name={`output-${question.id}`}
                  value={choice.id}
                  checked={selected === choice.id}
                  onChange={() => setSelected(choice.id)}
                />
                <code>{choice.output === '' ? '(empty line)' : choice.output}</code>
              </label>
            ))}
          </fieldset>
          <Buttons>
            {submitted ? (
              <button onClick={advance}>
                {index + 1 === ids.length ? 'See results' : 'Next snippet'}
              </button>
            ) : (
              <button
                disabled={!selected}
                onClick={() => setAnswers((current) => ({ ...current, [question.id]: selected }))}
              >
                Check output
              </button>
            )}
          </Buttons>
          {submitted && (
            <section aria-labelledby="output-feedback-title" aria-live="polite">
              <h3 id="output-feedback-title">
                {selected === question.answer ? 'Correct output.' : 'Trace the execution again.'}
              </h3>
              <pre aria-label="Correct output">
                <code>{correct.output}</code>
              </pre>
              <p>{question.explanation}</p>
              {selected !== question.answer && (
                <p>
                  Your choice: {question.choices.find((choice) => choice.id === selected)!.reason}
                </p>
              )}
              <p>Try a change: {question.followUp}</p>
              <p>
                <Link href={question.guide}>
                  <a>Read {question.guideTitle.toLowerCase()}</a>
                </Link>
                . <a href={question.reference.url}>{question.reference.title}</a>.
              </p>
            </section>
          )}
        </div>
      )}
      <details>
        <summary>Read all {outputQuestions.length} snippets, outputs, and explanations</summary>
        <p>Use this reference after trying a round, or read the traces directly.</p>
        {outputQuestions.map((item, position) => {
          const answer = item.choices.find((choice) => choice.id === item.answer)!;
          return (
            <section key={item.id}>
              <h3>
                {position + 1}. {item.title}
              </h3>
              <pre>
                <code>{item.code}</code>
              </pre>
              <p>Output:</p>
              <pre>
                <code>{answer.output}</code>
              </pre>
              <p>{item.explanation}</p>
              <ul>
                {item.choices
                  .filter((choice) => choice.id !== item.answer)
                  .map((choice) => (
                    <li key={choice.id}>
                      <code style={{ whiteSpace: 'pre-wrap' }}>
                        {choice.output === '' ? '(empty line)' : choice.output}
                      </code>
                      : {choice.reason}
                    </li>
                  ))}
              </ul>
              <p>Try a change: {item.followUp}</p>
              <p>
                <Link href={item.guide}>
                  <a>Read {item.guideTitle.toLowerCase()}</a>
                </Link>
                . <a href={item.reference.url}>{item.reference.title}</a>.
              </p>
            </section>
          );
        })}
      </details>
      <p>
        These examples are displayed as text. Answers stay in this page and reset on reload. No
        account is required.
      </p>
    </Quiz>
  );
}
