import * as React from 'react';
import Link from 'next/link';
import { patternQuestions } from 'utils/shared/patternQuiz';
import { scheduleReview, readReviews, ReviewRecord } from 'utils/shared/reasoningPractice';
import { ToolPanel, Buttons } from '../styles';

const storageKey = 'skilled-pattern-review-v1';
const ids = patternQuestions.map((question) => question.id);
export default function SpacedReview() {
  const [records, setRecords] = React.useState<Record<string, ReviewRecord>>({});
  const [loaded, setLoaded] = React.useState(false);
  const [now, setNow] = React.useState(0);
  const [index, setIndex] = React.useState(0);
  const [revealed, setRevealed] = React.useState(false);
  const [all, setAll] = React.useState(false);
  const [storageAvailable, setStorageAvailable] = React.useState(true);
  React.useEffect(() => {
    try {
      setRecords(readReviews(localStorage.getItem(storageKey), ids));
    } catch {
      setStorageAvailable(false);
    }
    setNow(Date.now());
    setLoaded(true);
    const timer = window.setInterval(() => setNow(Date.now()), 60000);
    return () => window.clearInterval(timer);
  }, []);
  const due = patternQuestions.filter(
    (question) => !records[question.id] || records[question.id].due <= now,
  );
  const queue = all ? patternQuestions : due;
  const question = queue[index % Math.max(1, queue.length)];
  const grade = (remembered: boolean) => {
    const updated = {
      ...records,
      [question.id]: scheduleReview(records[question.id], remembered, Date.now()),
    };
    setRecords(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {
      setStorageAvailable(false);
    }
    setRevealed(false);
    setNow(Date.now());
    setIndex(all ? (index + 1) % patternQuestions.length : 0);
  };
  return (
    <ToolPanel aria-labelledby="review-title">
      <h2 id="review-title">Recall an approach, then check your explanation</h2>
      <p>Review records stay in this browser. No account or notification permission is needed.</p>
      {!storageAvailable && (
        <p role="status">
          Browser storage is unavailable. This session still works, but its review schedule will not
          be saved.
        </p>
      )}
      {!loaded ? (
        <p>Loading local review schedule…</p>
      ) : (
        <>
          <p>
            {due.length} of {patternQuestions.length} cards are due or new.
          </p>
          <Buttons>
            <button
              aria-pressed={!all}
              onClick={() => {
                setAll(false);
                setIndex(0);
                setRevealed(false);
              }}
            >
              Due cards
            </button>
            <button
              aria-pressed={all}
              onClick={() => {
                setAll(true);
                setIndex(0);
                setRevealed(false);
              }}
            >
              Practice all cards
            </button>
          </Buttons>
          {question ? (
            <div>
              <h3>{question.prompt}</h3>
              <p>Describe the data structure, invariant, cost, and one failure case aloud.</p>
              {!revealed ? (
                <Buttons>
                  <button onClick={() => setRevealed(true)}>Reveal explanation</button>
                </Buttons>
              ) : (
                <div role="status">
                  <p>
                    {question.choices.find((choice) => choice.id === question.answer)!.explanation}
                  </p>
                  <p>{question.followUp}</p>
                  <Link href={question.guide}>
                    <a>Read {question.guideTitle}</a>
                  </Link>
                  <Buttons>
                    <button onClick={() => grade(false)}>Study again in 10 minutes</button>
                    <button onClick={() => grade(true)}>Recalled it; schedule review</button>
                  </Buttons>
                </div>
              )}
            </div>
          ) : (
            <p role="status">
              No cards are due. You can practice all cards now or return for your next review.
            </p>
          )}
          <details>
            <summary>View or clear the local schedule</summary>
            <ul>
              {patternQuestions.map((item) => (
                <li key={item.id}>
                  {item.guideTitle}:{' '}
                  {records[item.id]
                    ? `next review ${new Date(records[item.id].due).toLocaleDateString()}`
                    : 'new card'}
                </li>
              ))}
            </ul>
            <button
              onClick={() => {
                setRecords({});
                setIndex(0);
                setRevealed(false);
                try {
                  localStorage.removeItem(storageKey);
                } catch {}
              }}
            >
              Clear review schedule
            </button>
          </details>
        </>
      )}
      <details>
        <summary>Browse the complete card deck</summary>
        {patternQuestions.map((item) => (
          <section key={item.id}>
            <h3>{item.prompt}</h3>
            <p>{item.choices.find((choice) => choice.id === item.answer)!.explanation}</p>
            <p>{item.followUp}</p>
          </section>
        ))}
      </details>
    </ToolPanel>
  );
}
