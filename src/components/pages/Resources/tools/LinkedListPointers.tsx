import * as React from 'react';
import { pointerTrace, PointerMethod } from 'utils/shared/algorithmTraces';
import { ToolPanel, Controls } from '../styles';
import TracePlayer, { StateCards } from './TracePlayer';

export default function LinkedListPointers() {
  const [length, setLength] = React.useState(4);
  const [method, setMethod] = React.useState<PointerMethod>('reverse');
  const [cycle, setCycle] = React.useState('1');
  const [index, setIndex] = React.useState(0);
  const cycleAt = cycle === 'none' || length === 0 ? null : Math.min(Number(cycle), length - 1);
  const steps = React.useMemo(
    () => pointerTrace(length, method, cycleAt),
    [length, method, cycleAt],
  );
  const step = steps[Math.min(index, steps.length - 1)];
  return (
    <ToolPanel aria-labelledby="pointer-tool-title">
      <h2 id="pointer-tool-title">Follow node identities and next links</h2>
      <Controls>
        <label>
          Number of nodes
          <select
            value={length}
            onChange={(event) => {
              setLength(Number(event.target.value));
              setIndex(0);
            }}
          >
            {Array.from({ length: 9 }, (_, i) => (
              <option key={i}>{i}</option>
            ))}
          </select>
        </label>
        <label>
          Operation
          <select
            value={method}
            onChange={(event) => {
              setMethod(event.target.value as PointerMethod);
              setIndex(0);
            }}
          >
            <option value="reverse">Reverse the list</option>
            <option value="insert">Insert at head</option>
            <option value="delete">Delete the head</option>
            <option value="cycle">Detect a cycle</option>
          </select>
        </label>
        {method === 'cycle' && (
          <label>
            Tail points to
            <select
              value={cycleAt === null ? 'none' : String(cycleAt)}
              onChange={(event) => {
                setCycle(event.target.value);
                setIndex(0);
              }}
            >
              <option value="none">null (no cycle)</option>
              {Array.from({ length }, (_, i) => (
                <option key={i} value={i}>
                  node {i}
                </option>
              ))}
            </select>
          </label>
        )}
      </Controls>
      <TracePlayer count={steps.length} index={index} setIndex={setIndex}>
        <p>
          <strong>{step.action}</strong>
        </p>
        <StateCards aria-label="Node links">
          {step.next.map((next, i) => (
            <div key={i}>
              <strong>node {i}</strong>
              <small>next → {next === null ? 'null' : `node ${next}`}</small>
            </div>
          ))}
        </StateCards>
        {!step.next.length && <p>No nodes are allocated.</p>}
        <p>
          {Object.entries(step.pointers)
            .map(([name, node]) => `${name} = ${node === null ? 'null' : `node ${node}`}`)
            .join('; ')}
        </p>
      </TracePlayer>
      <p>
        Node numbers are identities, not stored values. A detached node can remain allocated while
        another reference points to it.
      </p>
    </ToolPanel>
  );
}
