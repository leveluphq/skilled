import * as React from 'react';

const GraphSingleNode = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={105} height={75} {...props}>
    <path
      d="M73.083 37.5a35.34 35.34 0 1 1-70.68 0 35.34 35.34 0 1 1 70.68 0z"
      fill="none"
      stroke="#000"
      strokeWidth={2.001}
      strokeLinecap="square"
      strokeLinejoin="bevel"
    />
    <path
      d="M44.46 44.532H30.88l-3.72 10.583h-4.785l12.565-35.23h5.8l12.371 35.23h-5.026L44.46 44.532zm-1.256-3.77L37.79 24.718l-5.799 16.044h11.212z"
      fontSize={12}
      fontWeight={400}
      fontFamily="FreeSans"
    />
    <path
      d="M75.497 21.906c36.472-9.772 37.224 41.674-4.419 30.516"
      fill="none"
      stroke="#000"
      strokeWidth={2}
      strokeLinecap="square"
      strokeLinejoin="bevel"
    />
    <path
      d="m87.795 25.701-16.787-2.755 14.573-8.776c-1.852 3.885-.943 8.54 2.214 11.531z"
      fontSize={12}
      fillRule="evenodd"
    />
  </svg>
);

export default GraphSingleNode;
