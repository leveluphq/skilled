import * as React from 'react';
import { simulateDebounce, simulateThrottle, Invocation } from 'utils/shared/learningTools';
import { Diagram, ToolPanel, Controls, Buttons, TableScroll, ErrorText } from '../styles';

const countLabel = (count: number, noun: string) => `${count} ${noun}${count === 1 ? '' : 's'}`;

const presets: Record<string, number[]> = {
  'Typing a word': [0, 80, 160, 240, 320],
  'Two bursts': [0, 80, 160, 600, 680],
  'Continuous events': Array.from({ length: 21 }, (_, i) => i * 100),
  'One event': [0],
};

export default function DebounceThrottle() {
  const [events, setEvents] = React.useState(presets['Two bursts']);
  const [wait, setWait] = React.useState(250);
  const [leading, setLeading] = React.useState(false);
  const [trailing, setTrailing] = React.useState(true);
  const [draft, setDraft] = React.useState('0, 80, 160, 600, 680');
  const [error, setError] = React.useState('');
  const [recording, setRecording] = React.useState(false);
  const origin = React.useRef<number | null>(null);
  const options = { wait, leading, trailing };
  const debounced = simulateDebounce(events, options);
  const throttled = simulateThrottle(events, options);
  const end =
    Math.max(1000, ...events, ...debounced.map((v) => v.at), ...throttled.map((v) => v.at)) + 100;
  const rows: { name: string; values: Invocation[]; color: string }[] = [
    { name: 'Input events', values: events.map((at) => ({ at, eventAt: at })), color: '#b3bac8' },
    { name: 'Debounce', values: debounced, color: '#ffda70' },
    { name: 'Throttle', values: throttled, color: '#89c2ff' },
  ];
  const select = (value: number[]) => {
    setEvents(value);
    setDraft(value.join(', '));
    setError('');
    setRecording(false);
    origin.current = null;
  };
  const record = () => {
    const now = performance.now();
    if (!recording || origin.current === null) {
      origin.current = now;
      setEvents([0]);
      setRecording(true);
      setError('');
    } else
      setEvents((previous) =>
        previous.length < 100 ? [...previous, Math.round(now - origin.current!)] : previous,
      );
  };
  const apply = () => {
    const values = draft.trim() === '' ? [] : draft.split(',').map((value) => Number(value.trim()));
    if (
      values.length > 100 ||
      values.some((n) => !Number.isFinite(n) || n < 0 || n > 60000) ||
      draft.split(',').some((v) => draft.trim() !== '' && !v.trim())
    ) {
      setError('Enter up to 100 comma-separated times from 0 to 60,000 milliseconds.');
      return;
    }
    select(values.sort((a, b) => a - b));
  };
  return (
    <ToolPanel aria-labelledby="timing-tool-title">
      <h2 id="timing-tool-title">Compare the callbacks</h2>
      <p>
        The same options apply to both wrappers. A trailing callback receives the most recent event
        in its pending window.
      </p>
      <Controls>
        <label htmlFor="timing-wait">
          Wait: <output>{wait} ms</output>
          <input
            id="timing-wait"
            type="range"
            min="50"
            max="1500"
            step="50"
            value={wait}
            onChange={(e) => setWait(Number(e.target.value))}
          />
        </label>
        <div>
          <label>
            <input
              type="checkbox"
              checked={leading}
              onChange={(e) => setLeading(e.target.checked)}
            />
            Call on the leading edge
          </label>
          <label>
            <input
              type="checkbox"
              checked={trailing}
              onChange={(e) => setTrailing(e.target.checked)}
            />
            Call on the trailing edge
          </label>
        </div>
      </Controls>
      <Buttons>
        {Object.entries(presets).map(([name, value]) => (
          <button key={name} onClick={() => select(value)}>
            {name}
          </button>
        ))}
      </Buttons>
      <Buttons>
        <button onClick={record}>{recording ? 'Record another event' : 'Record my clicks'}</button>
        <button
          onClick={() => {
            setRecording(false);
            origin.current = null;
            setDraft(events.join(', '));
          }}
          disabled={!recording}
        >
          Finish recording
        </button>
        <button onClick={() => select([])}>Clear events</button>
      </Buttons>
      <p>
        {recording
          ? 'Click the record button repeatedly. Recording stops at 100 events; finish recording to edit the times.'
          : 'Choose a preset, record your own clicks, or enter exact timestamps.'}
      </p>
      <label htmlFor="event-times">
        Event times in milliseconds
        <input
          id="event-times"
          value={draft}
          disabled={recording}
          onChange={(e) => setDraft(e.target.value)}
        />
      </label>
      <Buttons>
        <button onClick={apply} disabled={recording}>
          Apply timestamps
        </button>
      </Buttons>
      {error && <ErrorText role="alert">{error}</ErrorText>}
      {!leading && !trailing && (
        <p role="status">Both edges are disabled, so neither wrapper invokes a callback.</p>
      )}
      <p className="diagram-help">
        Scroll the drawing horizontally on a narrow screen. The text output below gives the same
        results.
      </p>
      <Diagram tabIndex={0} role="region" aria-label="Scrollable event timeline">
        <svg
          viewBox="0 0 800 290"
          role="img"
          aria-labelledby="timing-chart-title timing-chart-description"
        >
          <title id="timing-chart-title">Input, debounce, and throttle event timelines</title>
          <desc id="timing-chart-description">
            {countLabel(events.length, 'input event')}{' '}
            {events.length === 1 ? 'produces' : 'produce'}{' '}
            {countLabel(debounced.length, 'debounce call')} and{' '}
            {countLabel(throttled.length, 'throttle call')}. Exact callback times follow in a table.
          </desc>
          {rows.map((row, index) => (
            <g key={row.name}>
              <text x="8" y={50 + index * 80} fill={row.color} fontSize="14">
                {row.name}
              </text>
              <line x1="135" y1={45 + index * 80} x2="780" y2={45 + index * 80} stroke="#626875" />
              {row.values.map((value, i) => (
                <circle
                  key={i}
                  cx={135 + (value.at / end) * 640}
                  cy={45 + index * 80}
                  r="6"
                  fill={row.color}
                >
                  <title>
                    {value.at} ms, input from {value.eventAt} ms
                  </title>
                </circle>
              ))}
            </g>
          ))}
          {[0, 1, 2, 3, 4].map((i) => (
            <text
              key={i}
              x={135 + i * 160}
              y="265"
              textAnchor="middle"
              fill="#b3bac8"
              fontSize="12"
            >
              {Math.round((end * i) / 4)} ms
            </text>
          ))}
        </svg>
      </Diagram>
      <p aria-live="polite">
        {countLabel(events.length, 'input event')} · {countLabel(debounced.length, 'debounce call')}{' '}
        · {countLabel(throttled.length, 'throttle call')}
      </p>
      <TableScroll>
        <table>
          <caption>Callback times and the input each call receives</caption>
          <thead>
            <tr>
              <th scope="col">Wrapper</th>
              <th scope="col">Callback time (ms)</th>
              <th scope="col">Input event time (ms)</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(1).flatMap((row) =>
              row.values.map((value, i) => (
                <tr key={`${row.name}-${i}`}>
                  <th scope="row">{row.name}</th>
                  <td>{value.at}</td>
                  <td>{value.eventAt}</td>
                </tr>
              )),
            )}
            {debounced.length + throttled.length === 0 && (
              <tr>
                <td colSpan={3}>No callbacks for the selected input and options.</td>
              </tr>
            )}
          </tbody>
        </table>
      </TableScroll>
      <p>
        This is a deterministic timing model. Due timers run before input at an identical timestamp.
        Browser timers can run later when the main thread is busy; this chart does not simulate that
        scheduling delay.
      </p>
    </ToolPanel>
  );
}
