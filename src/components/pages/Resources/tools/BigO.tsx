import * as React from 'react';
import { growthFunctions, formatMagnitude } from 'utils/shared/learningTools';
import { Diagram, ToolPanel, Controls, Buttons, TableScroll } from '../styles';

export default function BigO() {
  const [n, setN] = React.useState(64);
  const [selected, setSelected] = React.useState(growthFunctions.map((g) => g.id));
  const [cap, setCap] = React.useState(12);
  const active = growthFunctions.filter((g) => selected.includes(g.id));
  const maxX = Math.max(1, Math.log2(n));
  const toggle = (id: string) =>
    setSelected((current) =>
      current.includes(id) ? current.filter((v) => v !== id) : [...current, id],
    );
  return (
    <ToolPanel aria-labelledby="growth-tool-title">
      <h2 id="growth-tool-title">Compare growth as input increases</h2>
      <Controls>
        <label htmlFor="growth-n">
          Input size n
          <input
            id="growth-n"
            type="number"
            min="1"
            max="1000000"
            step="1"
            value={n}
            onChange={(e) =>
              setN(Math.max(1, Math.min(1000000, Math.floor(Number(e.target.value)) || 1)))
            }
          />
        </label>
        <label htmlFor="growth-range">
          Input size by powers of two: <output>{n.toLocaleString('en-US')}</output>
          <input
            id="growth-range"
            type="range"
            min="0"
            max="19"
            step="1"
            value={Math.min(19, Math.log2(n))}
            onChange={(e) => setN(Math.pow(2, Number(e.target.value)))}
          />
        </label>
        <label htmlFor="growth-cap">
          Chart ceiling
          <select id="growth-cap" value={cap} onChange={(e) => setCap(Number(e.target.value))}>
            <option value="6">10^6 work units</option>
            <option value="12">10^12 work units</option>
            <option value="24">10^24 work units</option>
          </select>
        </label>
      </Controls>
      <Buttons>
        {growthFunctions.map((g) => (
          <button
            key={g.id}
            aria-pressed={selected.includes(g.id)}
            onClick={() => toggle(g.id)}
            style={{ borderColor: selected.includes(g.id) ? g.color : undefined }}
          >
            {g.label}
          </button>
        ))}
      </Buttons>
      <p>
        Both axes use logarithmic spacing. Each horizontal interval doubles n. The vertical axis
        counts powers of ten; curves stop at the chart ceiling. The table keeps the larger
        estimates.
      </p>
      <p className="diagram-help">
        Scroll the drawing horizontally on a narrow screen. The text output below gives the same
        results.
      </p>
      {n === 1 ? (
        <p role="status">
          At n = 1, use the table to compare the initial values. Increase n to draw growth across an
          interval.
        </p>
      ) : (
        <Diagram tabIndex={0} role="region" aria-label="Scrollable growth chart">
          <svg
            viewBox="0 0 800 410"
            role="img"
            aria-labelledby="growth-chart-title growth-chart-description"
          >
            <title id="growth-chart-title">Algorithm growth functions up to input size {n}</title>
            <desc id="growth-chart-description">
              Compare selected growth functions on a logarithmic chart. Values above ten to the
              power {cap} are clipped. Read numerical estimates in the table.
            </desc>
            {[0, 1, 2, 3, 4].map((i) => (
              <g key={i}>
                <line x1="80" y1={340 - i * 75} x2="770" y2={340 - i * 75} stroke="#424751" />
                <text x="70" y={345 - i * 75} textAnchor="end" fill="#b3bac8" fontSize="12">
                  10^{(cap * i) / 4}
                </text>
              </g>
            ))}
            {Array.from({ length: Math.min(6, Math.floor(maxX) + 1) }, (_, i) =>
              Math.round((i * maxX) / Math.max(1, Math.min(5, Math.floor(maxX)))),
            )
              .filter((value, i, all) => all.indexOf(value) === i)
              .map((power) => (
                <text
                  key={power}
                  x={80 + (power / maxX) * 690}
                  y="365"
                  textAnchor="middle"
                  fill="#b3bac8"
                  fontSize="12"
                >
                  {Math.pow(2, power).toLocaleString('en-US')}
                </text>
              ))}
            {active.map((g) => {
              const points: string[] = [];
              for (let i = 0; i <= 160; i += 1) {
                const x = i / 160;
                const input = Math.pow(2, x * maxX);
                const y = g.log10(input);
                points.push(`${80 + x * 690},${340 - (Math.min(cap, y) / cap) * 300}`);
                if (y >= cap) break;
              }
              return (
                <polyline
                  key={g.id}
                  points={points.join(' ')}
                  fill="none"
                  stroke={g.color}
                  strokeWidth="2.5"
                >
                  <title>{g.label}</title>
                </polyline>
              );
            })}
            <text x="420" y="400" fill="#b3bac8" fontSize="12" textAnchor="middle">
              Input size n (doubling scale)
            </text>
          </svg>
        </Diagram>
      )}
      <TableScroll>
        <table>
          <caption>Growth-function estimates at n = {n.toLocaleString('en-US')}</caption>
          <thead>
            <tr>
              <th scope="col">Growth</th>
              <th scope="col">Work units</th>
              <th scope="col">Chart status</th>
            </tr>
          </thead>
          <tbody>
            {active.map((g) => (
              <tr key={g.id}>
                <th scope="row" style={{ color: g.color }}>
                  {g.label}
                </th>
                <td>{formatMagnitude(g.log10(n))}</td>
                <td>{g.log10(n) > cap ? 'Above chart ceiling' : 'Within chart'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableScroll>
      {active.length === 0 && (
        <p role="status">Choose a growth function to show its curve and estimate.</p>
      )}
      <p>
        These are representative functions with a coefficient of one, not measured execution times.
        Logarithms use base two and are floored at one for n = 1. Large factorial estimates use
        Stirling’s approximation. Big O describes an upper bound; a real algorithm may do different
        work within that bound.
      </p>
    </ToolPanel>
  );
}
