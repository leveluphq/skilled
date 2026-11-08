import * as React from 'react';

const GraphExample = (props: any) => (
  <svg viewBox="0 0 640 360" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="m211.08 261.972-82.16-73.944M132 180h176m-188-78v66m12-78h176m12 12v66m12-78h176m12 12v66m-208.92 20.028-82.16 73.944" />
    <circle r={16} cx={220} cy={270} />
    <text fill="currentColor" x={220} y={275.333} textAnchor="middle" fontWeight={700}>
      {'0'}
    </text>
    <circle r={16} cx={120} cy={180} />
    <text fill="currentColor" x={120} y={185.333} textAnchor="middle" fontWeight={700}>
      {'1'}
    </text>
    <circle r={16} cx={320} cy={180} />
    <text fill="currentColor" x={320} y={185.333} textAnchor="middle" fontWeight={700}>
      {'2'}
    </text>
    <circle r={16} cx={120} cy={90} />
    <text fill="currentColor" x={120} y={95.333} textAnchor="middle" fontWeight={700}>
      {'3'}
    </text>
    <circle r={16} cx={320} cy={90} />
    <text fill="currentColor" x={320} y={95.333} textAnchor="middle" fontWeight={700}>
      {'4'}
    </text>
    <circle r={16} cx={520} cy={90} />
    <text fill="currentColor" x={520} y={95.333} textAnchor="middle" fontWeight={700}>
      {'5'}
    </text>
    <circle r={16} cx={520} cy={180} />
    <text fill="currentColor" x={520} y={185.333} textAnchor="middle" fontWeight={700}>
      {'6'}
    </text>
  </svg>
);

export default GraphExample;
