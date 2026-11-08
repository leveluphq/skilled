import * as React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { site } from 'utils/shared/site';
import {
  PlanOptions,
  StudyTrack,
  buildStudyPlan,
  defaultPlanOptions,
  planMarkdown,
  planStorageKey,
  restoreStudyPlan,
  studyTracks,
} from 'utils/shared/studyPlan';
import { ToolPanel, Controls, Buttons, ErrorText } from '../styles';

const Schedule = styled.div`
  max-height: 680px;
  overflow-y: auto;
  padding: 4px 10px 4px 0;
  h3 {
    margin: 20px 0 12px;
    font-size: 18px;
  }
  ul {
    list-style: none;
    padding: 0;
  }
  li {
    border-top: 1px solid ${({ theme }) => theme.color.border};
    padding: 14px 0;
  }
  a {
    text-decoration: underline;
  }
  label {
    display: flex;
    gap: 8px;
    align-items: flex-start;
  }
  input[type='checkbox'] {
    flex-shrink: 0;
    margin-top: 5px;
    width: 18px;
    height: 18px;
  }
  p {
    margin: 8px 0 0 34px;
  }
  progress {
    width: 100%;
    accent-color: ${({ theme }) => theme.color.brand};
  }
`;

export default function StudyPlanner() {
  const [plan, setPlan] = React.useState(() => buildStudyPlan(defaultPlanOptions));
  const [days, setDays] = React.useState(String(defaultPlanOptions.days));
  const [minutes, setMinutes] = React.useState(defaultPlanOptions.minutes);
  const [track, setTrack] = React.useState<StudyTrack>(defaultPlanOptions.track);
  const [completed, setCompleted] = React.useState<string[]>([]);
  const [error, setError] = React.useState('');
  const [storageMessage, setStorageMessage] = React.useState('');
  const [ready, setReady] = React.useState(false);
  const [notice, setNotice] = React.useState('');

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(planStorageKey);
      if (raw) {
        const restored = restoreStudyPlan(raw);
        setPlan(restored.plan);
        setDays(String(restored.plan.options.days));
        setMinutes(restored.plan.options.minutes);
        setTrack(restored.plan.options.track);
        setCompleted(restored.completed);
      }
    } catch {
      setStorageMessage(
        'A saved plan could not be restored. You can build a new plan and download it.',
      );
    }
    setReady(true);
  }, []);

  React.useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(
        planStorageKey,
        JSON.stringify({ version: 1, options: plan.options, completed }),
      );
    } catch {
      setStorageMessage(
        'This browser cannot save progress. Keep this page open or download your checklist.',
      );
    }
  }, [ready, plan, completed]);

  const apply = (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const options: PlanOptions = { days: Number(days), minutes, track };
      const next = buildStudyPlan(options);
      const same = JSON.stringify(options) === JSON.stringify(plan.options);
      setPlan(next);
      if (!same) setCompleted([]);
      setError('');
      setNotice(
        `Plan built: ${options.days} days at ${options.minutes} minutes per day.${
          same ? '' : ' Completion marks have been reset for the new schedule.'
        }`,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not build the plan.');
    }
  };
  const download = () => {
    const blob = new Blob([planMarkdown(plan, completed, site.origin)], {
      type: 'text/markdown;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `coding-interview-plan-${plan.options.days}-days.md`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const sessions = plan.days.flatMap((day) => day.sessions);
  const reviews = sessions.filter((s) => s.kind === 'review').length;
  return (
    <ToolPanel aria-labelledby="planner-title">
      <h2 id="planner-title">Build a schedule you can follow</h2>
      <form onSubmit={apply} noValidate>
        <Controls>
          <label htmlFor="plan-track">
            Study track
            <select
              id="plan-track"
              value={track}
              onChange={(e) => setTrack(e.target.value as StudyTrack)}
            >
              {Object.entries(studyTracks).map(([id, value]) => (
                <option key={id} value={id}>
                  {value.title}
                </option>
              ))}
            </select>
          </label>
          <label htmlFor="plan-days">
            Study days (3–60)
            <input
              id="plan-days"
              type="number"
              min="3"
              max="60"
              step="1"
              value={days}
              onChange={(e) => setDays(e.target.value)}
            />
          </label>
          <label htmlFor="plan-minutes">
            Minutes per study day
            <select
              id="plan-minutes"
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
            >
              {[30, 60, 90, 120].map((n) => (
                <option key={n} value={n}>
                  {n} minutes
                </option>
              ))}
            </select>
          </label>
        </Controls>
        <Buttons>
          <button type="submit">Build plan</button>
        </Buttons>
      </form>
      {error && <ErrorText role="alert">{error}</ErrorText>}
      <p role="status">{notice}</p>
      <p>
        Current plan: {studyTracks[plan.options.track].title}. {plan.options.days} study days,{' '}
        {plan.options.minutes} minutes per day, {reviews} review{' '}
        {reviews === 1 ? 'block' : 'blocks'}. Each block reserves 25 minutes for work and 5 for
        notes. Add rest days to your own calendar.
      </p>
      <p aria-live="polite">
        {completed.length} of {sessions.length} blocks marked complete.
      </p>
      {plan.unfinished.length > 0 ? (
        <p>
          This schedule leaves {plan.unfinished.length}{' '}
          {plan.unfinished.length === 1 ? 'topic' : 'topics'} without an initial practice block:{' '}
          {plan.unfinished.map((module) => module.title).join(', ')}. Add days or carry these topics
          into your next plan.
        </p>
      ) : (
        <p>
          All track topics have an initial learning and practice block. Revisit anything you cannot
          yet explain independently.
        </p>
      )}
      <Buttons>
        <button onClick={download}>Download Markdown checklist</button>
        <button
          disabled={!completed.length}
          onClick={() => {
            setCompleted([]);
            setNotice('Completion marks cleared. The schedule is unchanged.');
          }}
        >
          Clear completion marks
        </button>
      </Buttons>
      <p>
        Settings and completion marks are saved in this browser. They are not synced to an account.
        Download a copy before switching devices.
      </p>
      {storageMessage && <p role="status">{storageMessage}</p>}
      <Schedule tabIndex={0} role="region" aria-label="Scrollable study schedule">
        <progress
          value={completed.length}
          max={sessions.length}
          aria-label="Completed study blocks"
        />
        {plan.days.map((day) => (
          <section key={day.day} aria-labelledby={`plan-day-${day.day}`}>
            <h3 id={`plan-day-${day.day}`}>
              Day {day.day} · {plan.options.minutes} minutes
            </h3>
            <ul>
              {day.sessions.map((session) => (
                <li key={session.id}>
                  <label htmlFor={session.id}>
                    <input
                      id={session.id}
                      type="checkbox"
                      checked={completed.includes(session.id)}
                      onChange={(event) => {
                        const checked = event.target.checked;
                        setCompleted((current) =>
                          checked
                            ? [...current, session.id]
                            : current.filter((id) => id !== session.id),
                        );
                      }}
                    />
                    <span>
                      {session.kind === 'learn'
                        ? 'Learn'
                        : session.kind === 'practice'
                        ? 'Practice'
                        : 'Review'}
                      : {session.module.title} (30 min)
                    </span>
                  </label>
                  <p>
                    <Link
                      href={
                        session.kind === 'learn' ? session.module.read : session.module.practice
                      }
                    >
                      <a>Open {session.kind === 'learn' ? 'reading' : 'exercise'}</a>
                    </Link>
                    . {session.module.objective}
                  </p>
                  {session.kind === 'review' && (
                    <p>
                      Retry without earlier code. Change one constraint, trace a failing case, and
                      record what still needs work.
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </Schedule>
    </ToolPanel>
  );
}
