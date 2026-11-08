import * as React from 'react';

const SimpleLinkedList = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    width={88}
    height={320}
    {...props}
  >
    <path
      id="b"
      className="de"
      d="M24 104v38"
      stroke="currentColor"
      strokeWidth={3}
      markerEnd="url(#a)"
    />
    <path
      id="c"
      className="de"
      d="M24 174v38"
      stroke="currentColor"
      strokeWidth={3}
      markerEnd="url(#a)"
    />
    <path
      id="d"
      className="de"
      d="M24 246v37"
      stroke="currentColor"
      strokeWidth={3}
      markerEnd="url(#a)"
    />
    <path
      id="e"
      className="de"
      d="M24 34v38"
      stroke="currentColor"
      strokeWidth={3}
      markerEnd="url(#a)"
    />
    <circle className="v2" cx={24} cy={160} fill="currentColor" r={16} />
    <circle className="v2" cx={24} cy={160} fill="#333" r={14} />
    <circle className="v3" cx={24} cy={230} fill="currentColor" r={16} />
    <circle className="v3" cx={24} cy={230} fill="#333" r={14} />
    <circle className="v1" cx={24} cy={90} fill="currentColor" r={16} />
    <circle className="v1" cx={24} cy={90} fill="#333" r={14} />
    <circle className="v0" cx={24} cy={20} fill="currentColor" r={16} />
    <circle className="v0" cx={24} cy={20} fill="#333" r={14} />
    <text
      className="v2"
      x={24}
      y={163.333}
      fill="currentColor"
      fontFamily="'PT Sans', sans-serif"
      fontSize={12}
      fontWeight="bold"
      textAnchor="middle"
    >
      {'17'}
    </text>
    <text
      className="v3"
      x={24}
      y={233.333}
      fill="currentColor"
      fontFamily="'PT Sans', sans-serif"
      fontSize={12}
      fontWeight="bold"
      textAnchor="middle"
    >
      {'69'}
    </text>
    <text
      className="v4"
      x={24}
      y={305.333}
      fill="currentColor"
      fontFamily="'PT Sans', sans-serif"
      fontSize={16}
      fontWeight="bold"
      textAnchor="middle"
    >
      {'null'}
    </text>
    <text
      className="v4"
      x={60}
      y={234}
      fill="currentColor"
      fontFamily="'PT Sans', sans-serif"
      fontSize={16}
      fontWeight="bold"
      textAnchor="middle"
    >
      {'tail'}
    </text>
    <text
      className="v1"
      x={24}
      y={93.333}
      fill="currentColor"
      fontFamily="'PT Sans', sans-serif"
      fontSize={12}
      fontWeight="bold"
      textAnchor="middle"
    >
      {'75'}
    </text>
    <text
      className="v0"
      x={24}
      y={23.333}
      fill="currentColor"
      fontFamily="'PT Sans', sans-serif"
      fontSize={12}
      fontWeight="bold"
      textAnchor="middle"
    >
      {'86'}
    </text>
    <text
      className="v0"
      x={64}
      y={25}
      fill="currentColor"
      fontFamily="'PT Sans', sans-serif"
      fontSize={16}
      fontWeight="bold"
      textAnchor="middle"
    >
      {'head'}
    </text>
    <g
      fill="#333"
      fontFamily="'PT Sans', sans-serif"
      fontSize={0}
      fontWeight="bold"
      textAnchor="middle"
    >
      <text textDecoration="underline">
        <textPath xlinkHref="#b" startOffset="75%">
          <tspan dy={-5}>{'1'}</tspan>
        </textPath>
      </text>
      <text textDecoration="underline">
        <textPath xlinkHref="#c" startOffset="75%">
          <tspan dy={-5}>{'1'}</tspan>
        </textPath>
      </text>
      <text textDecoration="underline">
        <textPath xlinkHref="#d" startOffset="75%">
          <tspan dy={-5}>{'1'}</tspan>
        </textPath>
      </text>
      <text textDecoration="underline">
        <textPath xlinkHref="#e" startOffset="75%">
          <tspan dy={-5}>{'1'}</tspan>
        </textPath>
      </text>
    </g>
    <marker id="a" viewBox="0 -5 10 10" refX={9} orient="auto">
      <path d="m0-5 12 5L0 5" fill="currentColor" />
    </marker>
  </svg>
);

export default SimpleLinkedList;
