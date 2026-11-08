import * as React from 'react';
import { Graph, parseGraph, traverseGraph, pathTo } from 'utils/shared/learningTools';
import { Diagram, ToolPanel, Controls, Buttons, ErrorText, TableScroll } from '../styles';

const examples: Record<string, string> = {
  'Branching graph': JSON.stringify(
    { A: ['B', 'C'], B: ['D', 'E'], C: ['F'], D: ['C'], E: ['F'], F: [] },
    null,
    2,
  ),
  'Cycle and disconnected node': JSON.stringify(
    { A: ['B'], B: ['C'], C: ['A', 'D'], D: [], X: [] },
    null,
    2,
  ),
  'Different path lengths': JSON.stringify(
    { A: ['B', 'C'], B: ['D'], C: ['F'], D: ['E'], E: ['F'], F: [] },
    null,
    2,
  ),
};

export default function GraphTraversal() {
  const [draft, setDraft] = React.useState(examples['Branching graph']);
  const [graph, setGraph] = React.useState<Graph>(() => parseGraph(examples['Branching graph']));
  const [mode, setMode] = React.useState<'bfs' | 'dfs'>('bfs');
  const [start, setStart] = React.useState('A');
  const [target, setTarget] = React.useState('F');
  const [index, setIndex] = React.useState(-1);
  const [error, setError] = React.useState('');
  const nodes = Object.keys(graph);
  const steps = traverseGraph(graph, start, mode);
  const step = steps[index];
  const visited = step?.visited || [];
  const route = step ? pathTo(step.parents, target) : [];
  const positions = Object.fromEntries(
    nodes.map((node, i) => [
      node,
      {
        x: 360 + 190 * Math.cos((2 * Math.PI * i) / Math.max(1, nodes.length) - Math.PI / 2),
        y: 235 + 180 * Math.sin((2 * Math.PI * i) / Math.max(1, nodes.length) - Math.PI / 2),
      },
    ]),
  );
  const apply = (source: string) => {
    try {
      const parsed = parseGraph(source);
      const ids = Object.keys(parsed);
      setGraph(parsed);
      setDraft(source);
      setStart(ids[0] || '');
      setTarget(ids[ids.length - 1] || '');
      setIndex(-1);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not read the graph.');
    }
  };
  return (
    <ToolPanel aria-labelledby="graph-tool-title">
      <h2 id="graph-tool-title">Step through a directed graph</h2>
      <Buttons>
        {Object.entries(examples).map(([name, value]) => (
          <button key={name} onClick={() => apply(value)}>
            {name}
          </button>
        ))}
      </Buttons>
      <Controls>
        <label htmlFor="graph-input">
          Adjacency list (JSON)
          <textarea
            id="graph-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            spellCheck={false}
          />
        </label>
        <div>
          <label htmlFor="graph-mode">
            Traversal
            <select
              id="graph-mode"
              value={mode}
              onChange={(e) => {
                setMode(e.target.value as 'bfs' | 'dfs');
                setIndex(-1);
              }}
            >
              <option value="bfs">Breadth-first search</option>
              <option value="dfs">Depth-first search</option>
            </select>
          </label>
          <label htmlFor="graph-start">
            Start node
            <select
              id="graph-start"
              value={start}
              onChange={(e) => {
                setStart(e.target.value);
                setIndex(-1);
              }}
            >
              {nodes.map((node) => (
                <option key={node}>{node}</option>
              ))}
            </select>
          </label>
          <label htmlFor="graph-target">
            Path target
            <select id="graph-target" value={target} onChange={(e) => setTarget(e.target.value)}>
              {nodes.map((node) => (
                <option key={node}>{node}</option>
              ))}
            </select>
          </label>
        </div>
      </Controls>
      <Buttons>
        <button onClick={() => apply(draft)}>Apply graph</button>
        <button onClick={() => setIndex((n) => n - 1)} disabled={index < 0}>
          Previous
        </button>
        <button onClick={() => setIndex((n) => n + 1)} disabled={index >= steps.length - 1}>
          Next step
        </button>
        <button
          onClick={() => setIndex(steps.length - 1)}
          disabled={!steps.length || index === steps.length - 1}
        >
          Complete traversal
        </button>
        <button onClick={() => setIndex(-1)} disabled={index < 0}>
          Reset steps
        </button>
      </Buttons>
      {error && <ErrorText role="alert">{error}</ErrorText>}
      <p className="diagram-help">
        Scroll the drawing horizontally on a narrow screen. The text output below gives the same
        results.
      </p>
      <Diagram tabIndex={0} role="region" aria-label="Scrollable graph diagram">
        <svg
          viewBox="0 0 720 465"
          role="img"
          aria-labelledby="graph-drawing-title graph-drawing-description"
        >
          <title id="graph-drawing-title">
            {mode.toUpperCase()} traversal from {start || 'an empty graph'}
          </title>
          <desc id="graph-drawing-description">
            {nodes.length} nodes. Visited: {visited.join(', ') || 'none'}. Current node:{' '}
            {step?.current || 'none'}. Arrows show directed edges.
          </desc>
          <defs>
            <marker
              id="traversal-arrow"
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L0,6 L6,3 z" fill="#7d8595" />
            </marker>
          </defs>
          {nodes.flatMap((node) =>
            graph[node].map((next) => {
              const from = positions[node];
              const to = positions[next];
              const dx = to.x - from.x;
              const dy = to.y - from.y;
              const length = Math.hypot(dx, dy) || 1;
              return node === next ? (
                <path
                  key={`${node}-${next}`}
                  d={`M ${from.x - 10} ${from.y - 18} C ${from.x - 70} ${from.y - 85}, ${
                    from.x + 70
                  } ${from.y - 85}, ${from.x + 15} ${from.y - 20}`}
                  fill="none"
                  stroke="#7d8595"
                  markerEnd="url(#traversal-arrow)"
                />
              ) : (
                <line
                  key={`${node}-${next}`}
                  x1={from.x + (dx / length) * 26}
                  y1={from.y + (dy / length) * 26}
                  x2={to.x - (dx / length) * 29}
                  y2={to.y - (dy / length) * 29}
                  stroke="#7d8595"
                  strokeWidth="1.5"
                  markerEnd="url(#traversal-arrow)"
                />
              );
            }),
          )}
          {nodes.map((node) => (
            <g key={node}>
              <title>{node}</title>
              <circle
                cx={positions[node].x}
                cy={positions[node].y}
                r="24"
                fill={
                  step?.current === node
                    ? '#89c2ff'
                    : visited.includes(node)
                    ? '#ffda70'
                    : '#30353f'
                }
                stroke="#929aa8"
              />
              <text
                x={positions[node].x}
                y={positions[node].y + 5}
                textAnchor="middle"
                fill={visited.includes(node) ? '#15171c' : '#f0f2f6'}
                fontSize={node.length > 6 ? '9' : '14'}
              >
                {node.length > 8 ? `${node.slice(0, 7)}…` : node}
              </text>
            </g>
          ))}
        </svg>
      </Diagram>
      <p aria-live="polite">
        Step {index + 1} of {steps.length}.{' '}
        {step ? `Visited ${step.current}.` : 'Press Next step to start.'}
      </p>
      <p>
        Visit order: <output>{visited.join(' → ') || 'None yet'}</output>
      </p>
      <p>
        {mode === 'bfs' ? 'Queue (next node first)' : 'Active recursive calls (root first)'}:{' '}
        <output>{step?.frontier.join(' → ') || 'Empty'}</output>
      </p>
      <p>
        {mode === 'bfs' ? 'Shortest discovered path' : 'DFS discovery path'} to {target || 'target'}
        :{' '}
        <output>
          {route.length
            ? route.join(' → ')
            : index === steps.length - 1 && steps.length
            ? 'Unreachable from the start'
            : 'Not discovered yet'}
        </output>
      </p>
      <TableScroll>
        <table>
          <caption>Visited nodes and their discovery parents</caption>
          <thead>
            <tr>
              <th scope="col">Visit</th>
              <th scope="col">Node</th>
              <th scope="col">Parent</th>
            </tr>
          </thead>
          <tbody>
            {visited.map((node, i) => (
              <tr key={node}>
                <td>{i + 1}</td>
                <th scope="row">{node}</th>
                <td>{step.parents[node] ?? 'Start'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableScroll>
      <p>
        Neighbors are considered in the order you enter them. An undirected edge needs both
        directions in the adjacency list. BFS finds shortest paths by edge count; this model has no
        edge weights. Disconnected nodes remain unvisited.
      </p>
    </ToolPanel>
  );
}
