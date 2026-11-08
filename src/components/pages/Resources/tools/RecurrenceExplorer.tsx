import * as React from 'react';
import { recurrenceTrace, RecurrenceMethod } from 'utils/shared/algorithmTraces';
import { ToolPanel, Controls, TableScroll } from '../styles';
import TracePlayer, { StateCards } from './TracePlayer';

export default function RecurrenceExplorer({ dynamic = false }: { dynamic?: boolean }) {
  const [n, setN] = React.useState(4);
  const [method, setMethod] = React.useState<RecurrenceMethod>(dynamic ? 'memoized' : 'recursive');
  const [index, setIndex] = React.useState(0);
  const steps = React.useMemo(() => recurrenceTrace(n, method), [n, method]);
  const step = steps[Math.min(index, steps.length - 1)];
  return (
    <ToolPanel aria-labelledby="recurrence-tool-title">
      <h2 id="recurrence-tool-title">
        {dynamic
          ? 'Compare repeated subproblems and stored answers'
          : 'Inspect recursive calls and returns'}
      </h2>
      <p>
        Count ordered sequences of one-step and two-step hops. There is one way to climb zero steps:
        choose no hops.
      </p>
      <Controls>
        <label>
          Stair count
          <select
            value={n}
            onChange={(event) => {
              setN(Number(event.target.value));
              setIndex(0);
            }}
          >
            {Array.from({ length: 11 }, (_, i) => (
              <option key={i}>{i}</option>
            ))}
          </select>
        </label>
        <label>
          Evaluation method
          <select
            value={method}
            onChange={(event) => {
              setMethod(event.target.value as RecurrenceMethod);
              setIndex(0);
            }}
          >
            <option value="recursive">Plain recursion</option>
            <option value="memoized">Memoized recursion</option>
            <option value="tabulated">Bottom-up table</option>
          </select>
        </label>
      </Controls>
      <TracePlayer count={steps.length} index={index} setIndex={setIndex}>
        <p>
          <strong>{step.action}</strong>
        </p>
        <p>Active calls, oldest to newest:</p>
        <StateCards aria-label="Active call stack">
          {step.stack.map((remaining, i) => (
            <div key={i}>
              ways({remaining})<small>frame {i + 1}</small>
            </div>
          ))}
        </StateCards>
        {!step.stack.length && <p>No active recursive frames.</p>}
        <p>
          {step.calls} function calls; {step.cacheHits} cached returns.
        </p>
        {Object.keys(step.known).length > 0 && (
          <TableScroll>
            <table>
              <caption>Stored answers</caption>
              <thead>
                <tr>
                  <th>Remaining stairs</th>
                  <th>Ways</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(step.known).map(([key, value]) => (
                  <tr key={key}>
                    <th scope="row">{key}</th>
                    <td>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableScroll>
        )}
        {step.result !== undefined && (
          <p>
            Returned value: {step.result}
            {index + 1 < steps.length ? ' (this call)' : ' (final result)'}
          </p>
        )}
      </TracePlayer>
      <p>
        The trace is capped at ten stairs so every frame remains inspectable. It is a model of this
        recurrence, not an arbitrary-code debugger.
      </p>
    </ToolPanel>
  );
}
