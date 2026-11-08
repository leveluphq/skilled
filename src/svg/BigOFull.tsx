import * as React from 'react';

const BigOFull = (props: any) => (
  <svg width={800} height={500} xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M50 450V0h750v450z" fill="#ff8989" />
    <path d="M50 450 800 0v450z" fill="#FFC543" />
    <path d="M50 450h750V330z" fill="#ff0" />
    <path d="M50 450h750v-40z" fill="#C8EA00" />
    <path d="M50 450h750v-10z" fill="#53d000" />
    <path d="M50 0v450h750m-750-2h750" fill="transparent" stroke="#000" strokeWidth={2} />
    <text x={640} y={438} stroke="#000">
      {'O(log n), O(1)'}
    </text>
    <path d="m50 450 750-50" fill="transparent" stroke="#000" strokeWidth={2} />
    <text x={760} y={390} stroke="#000">
      {'O(n)'}
    </text>
    <path d="M50 450q350-100 750-300" fill="transparent" stroke="#000" strokeWidth={2} />
    <text x={630} y={190} stroke="#000">
      {'O(n log n)'}
    </text>
    <path d="M50 450Q180 380 250 0" fill="transparent" stroke="#000" strokeWidth={2} />
    <text x={260} y={30} stroke="#000">
      {'O(n^2)'}
    </text>
    <path d="M50 450c50-20 70-100 70-450" fill="transparent" stroke="#000" strokeWidth={2} />
    <text x={125} y={20} stroke="#000">
      {'O(2^n)'}
    </text>
    <path d="M50 450c30 0 30-100 30-450" fill="transparent" stroke="#000" strokeWidth={2} />
    <text x={80} y={20} stroke="#000">
      {'O(n!)'}
    </text>
    <text
      transform="rotate(-90 130 100)"
      fill="currentColor"
      dominantBaseline="middle"
      textAnchor="middle"
      fontSize={18}
      color="currentColor"
    >
      {'Operations'}
    </text>
    <text
      transform="translate(420 470)"
      fill="currentColor"
      dominantBaseline="middle"
      textAnchor="middle"
      fontSize={18}
      color="currentColor"
    >
      {'Input Size'}
    </text>
  </svg>
);

export default BigOFull;
