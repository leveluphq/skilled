import * as React from 'react';
import { parseSmallNumbers, sortingTrace, SortMethod } from 'utils/shared/algorithmTraces';
import { ToolPanel, Controls, Buttons, ErrorText, TableScroll } from '../styles';
import TracePlayer, { StateCards } from './TracePlayer';

const methods: SortMethod[] = ['insertion', 'selection', 'bubble'];
export default function SortingComparison() {
  const [source, setSource] = React.useState('5, 2, 4, 2, 1');
  const [values, setValues] = React.useState([5, 2, 4, 2, 1]);
  const [method, setMethod] = React.useState<SortMethod>('insertion');
  const [index, setIndex] = React.useState(0);
  const [error, setError] = React.useState('');
  const traces = React.useMemo(() => methods.map((item) => sortingTrace(values, item)), [values]);
  const steps = traces[methods.indexOf(method)];
  const step = steps[Math.min(index, steps.length - 1)];
  const apply = () => {
    try {
      setValues(parseSmallNumbers(source));
      setIndex(0);
      setError('');
    } catch (failure) {
      setError((failure as Error).message);
    }
  };
  return (
    <ToolPanel aria-labelledby="sorting-tool-title">
      <h2 id="sorting-tool-title">Compare sorting operations</h2>
      <Controls>
        <label>
          Input values
          <input value={source} onChange={(event) => setSource(event.target.value)} />
        </label>
        <label>
          Method
          <select
            value={method}
            onChange={(event) => {
              setMethod(event.target.value as SortMethod);
              setIndex(0);
            }}
          >
            {methods.map((item) => (
              <option key={item} value={item}>
                {item} sort
              </option>
            ))}
          </select>
        </label>
      </Controls>
      <Buttons>
        <button onClick={apply}>Apply input</button>
        {[
          ['Sorted', '1, 2, 3, 4, 5'],
          ['Reversed', '5, 4, 3, 2, 1'],
          ['Equal', '3, 3, 3, 3, 3'],
        ].map(([label, input]) => (
          <button
            key={label}
            onClick={() => {
              setSource(input);
              setValues(parseSmallNumbers(input));
              setIndex(0);
              setError('');
            }}
          >
            {label}
          </button>
        ))}
      </Buttons>
      {error && <ErrorText role="alert">{error}</ErrorText>}
      <TracePlayer count={steps.length} index={index} setIndex={setIndex}>
        <p>
          <strong>{step.action}</strong>. {step.detail}
        </p>
        <StateCards aria-label="Array state">
          {step.values.map((value, i) => (
            <div key={i}>
              <small>index {i}</small>
              {value}
            </div>
          ))}
        </StateCards>
        {!step.values.length && <p>The array is empty.</p>}
        <p>
          {step.comparisons} value comparisons; {step.writes} array writes so far.
        </p>
      </TracePlayer>
      <h3>Completed counts on this input</h3>
      <TableScroll>
        <table>
          <thead>
            <tr>
              <th>Method</th>
              <th>Comparisons</th>
              <th>Array writes</th>
            </tr>
          </thead>
          <tbody>
            {traces.map((trace, i) => {
              const result = trace[trace.length - 1];
              return (
                <tr key={methods[i]}>
                  <th scope="row">{methods[i]}</th>
                  <td>{result.comparisons}</td>
                  <td>{result.writes}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </TableScroll>
      <p>
        These are deterministic operation counts for these implementations, not elapsed-time
        measurements.
      </p>
    </ToolPanel>
  );
}
