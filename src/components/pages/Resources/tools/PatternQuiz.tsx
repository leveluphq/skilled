import * as React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { patternQuestions, quizResults } from 'utils/shared/patternQuiz';
import { ToolPanel, Buttons } from '../styles';

const Quiz = styled(ToolPanel)`
  fieldset {
    border: 0;
    padding: 0;
    margin: 22px 0;
    min-width: 0;
  }
  legend {
    line-height: 1.7;
    margin-bottom: 18px;
    font-size: 17px;
  }
  fieldset label {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 12px;
    border: 1px solid ${({ theme }) => theme.color.border};
    border-radius: 6px;
    margin-bottom: 10px;
    cursor: pointer;
  }
  input[type='radio'] {
    flex-shrink: 0;
    width: 18px;
    height: 18px;
    margin: 3px 0 0;
    accent-color: ${({ theme }) => theme.color.brand};
  }
  a {
    text-decoration: underline;
  }
  h3 {
    font-size: 18px;
    line-height: 1.6;
    margin: 20px 0 10px;
  }
  ul {
    padding-left: 22px;
  }
  li {
    line-height: 1.8;
    margin: 10px 0;
    font-size: 14px;
  }
  details {
    border-top: 1px solid ${({ theme }) => theme.color.border};
    padding-top: 18px;
    margin-top: 30px;
  }
  summary {
    cursor: pointer;
    line-height: 1.7;
  }
`;

const allIds = patternQuestions.map((question) => question.id);
export default function PatternQuiz() {
  const [ids, setIds] = React.useState(allIds);
  const [index, setIndex] = React.useState(0);
  const [selected, setSelected] = React.useState('');
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [finished, setFinished] = React.useState(false);
  const title = React.useRef<HTMLHeadingElement>(null);
  const question = patternQuestions.find((item) => item.id === ids[index])!;
  const submitted = Object.prototype.hasOwnProperty.call(answers, question.id);
  const result = quizResults(ids, answers);
  const correctChoice = question.choices.find((choice) => choice.id === question.answer)!;
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
    <Quiz aria-labelledby="quiz-title">
      <h2 id="quiz-title" tabIndex={-1} ref={title}>
        {finished ? 'Your practice results' : `Question ${index + 1} of ${ids.length}`}
      </h2>
      {finished ? (
        <div>
          <p role="status">
            {result.correct} of {result.total} correct in this round.
          </p>
          <p>
            This score covers these prompts. Try implementing an approach from a blank file before
            treating it as learned.
          </p>
          {result.missed.length > 0 ? (
            <ul>
              {result.missed.map((id) => {
                const item = patternQuestions.find((q) => q.id === id)!;
                return (
                  <li key={id}>
                    {item.prompt}{' '}
                    <Link href={item.guide}>
                      <a>Study {item.guideTitle.toLowerCase()}</a>
                    </Link>
                    .
                  </li>
                );
              })}
            </ul>
          ) : (
            <p>
              Next, change a constraint in one prompt and explain whether the same approach still
              works.
            </p>
          )}
          <Buttons>
            {result.missed.length > 0 && (
              <button onClick={() => restart(result.missed)}>Retry missed questions</button>
            )}
            <button onClick={() => restart(allIds)}>Start all questions again</button>
          </Buttons>
        </div>
      ) : (
        <div>
          <p>
            Choose the approach that satisfies every stated constraint. Several alternatives can
            solve a related problem.
          </p>
          <fieldset disabled={submitted}>
            <legend>{question.prompt}</legend>
            {question.choices.map((choice) => (
              <label
                key={`${question.id}-${choice.id}`}
                htmlFor={`quiz-${question.id}-${choice.id}`}
              >
                <input
                  id={`quiz-${question.id}-${choice.id}`}
                  type="radio"
                  name={`answer-${question.id}`}
                  value={choice.id}
                  checked={selected === choice.id}
                  onChange={() => setSelected(choice.id)}
                />
                <span>{choice.title}</span>
              </label>
            ))}
          </fieldset>
          <Buttons>
            {!submitted ? (
              <button
                disabled={!selected}
                onClick={() => setAnswers((current) => ({ ...current, [question.id]: selected }))}
              >
                Check answer
              </button>
            ) : (
              <button onClick={advance}>
                {index + 1 === ids.length ? 'See results' : 'Next question'}
              </button>
            )}
          </Buttons>
          {submitted && (
            <section aria-labelledby="quiz-feedback-title" aria-live="polite">
              <h3 id="quiz-feedback-title">
                {selected === question.answer ? 'Correct.' : 'Review the constraints.'}{' '}
                {correctChoice.title}
              </h3>
              <p>{correctChoice.explanation}</p>
              {selected !== question.answer && (
                <p>
                  Your choice:{' '}
                  {question.choices.find((choice) => choice.id === selected)!.explanation}
                </p>
              )}
              <details>
                <summary>Compare every alternative</summary>
                <ul>
                  {question.choices
                    .filter((choice) => choice.id !== question.answer)
                    .map((choice) => (
                      <li key={choice.id}>
                        {choice.title}: {choice.explanation}
                      </li>
                    ))}
                </ul>
              </details>
              <p>Follow-up: {question.followUp}</p>
              <p>
                <Link href={question.guide}>
                  <a>Read {question.guideTitle.toLowerCase()}</a>
                </Link>
                .
              </p>
            </section>
          )}
        </div>
      )}
      <details>
        <summary>Read all {patternQuestions.length} questions and answer explanations</summary>
        <p>
          Open this reference after trying the questions, or use it to study the reasoning directly.
        </p>
        {patternQuestions.map((item, i) => {
          const choice = item.choices.find((candidate) => candidate.id === item.answer)!;
          return (
            <section key={item.id}>
              <h3>
                {i + 1}. {item.prompt}
              </h3>
              <p>
                {choice.title}. {choice.explanation}
              </p>
              <p>Follow-up: {item.followUp}</p>
              <p>
                <Link href={item.guide}>
                  <a>Read {item.guideTitle.toLowerCase()}</a>
                </Link>
                .
              </p>
            </section>
          );
        })}
      </details>
      <p>Answers stay in this page and reset when you reload. No account is required.</p>
    </Quiz>
  );
}
