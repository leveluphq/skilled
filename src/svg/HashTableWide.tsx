import * as React from 'react';

const HashTableWide = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    width={620}
    height={310}
    strokeLinejoin="round"
    strokeLinecap="round"
    fillRule="evenodd"
    fontFamily="Bitstream Courier"
    {...props}
  >
    <g fontSize={12} transform="translate(10 60)">
      <defs>
        <path id="c" fill="#0ff" d="M0 0h90v20H0z" />
        <path id="a" fill="#0ff" d="M0 0h90v20H0z" />
        <path id="k" fill="#9cff9c" stroke="#000" d="M0 0h90v20H0z" />
        <path id="f" fill="#ded" stroke="#000" d="M0 0h90v20H0z" />
        <path id="l" fill="#9cff9c" stroke="#000" d="M0 0h80v20H0z" />
        <path id="g" fill="#ded" stroke="#000" d="M0 0h80v20H0z" />
        <path id="m" fill="#9cff9c" stroke="#000" d="M0 0h20v20H0z" />
        <path id="h" fill="#ded" stroke="#000" d="M0 0h20v20H0z" />
        <path id="e" fill="#ded" d="M3 1h34v18H3z" />
        <path id="j" fill="#a8a8ff" d="M3 1h34v18H3z" />
        <path id="o" fill="#e44" d="M3 1h34v18H3z" />
        <marker
          id="n"
          viewBox="0 0 8 8"
          refX={4}
          refY={4}
          markerWidth={8}
          markerHeight={8}
          orient="auto"
        >
          <circle cx={4} cy={4} r={3} stroke="#000" />
        </marker>
        <marker
          id="i"
          viewBox="0 0 8 8"
          refX={4}
          refY={4}
          markerWidth={8}
          markerHeight={8}
          orient="auto"
        >
          <path stroke="#000" d="m1 1 6 6M1 7l6-6" />
        </marker>
        <marker
          id="d"
          viewBox="0 0 14 8"
          refX={13}
          refY={4}
          markerWidth={14}
          markerHeight={8}
          orient="auto"
        >
          <path stroke="#000" d="M1 4V1l12 3L1 7z" />
        </marker>
        <marker
          id="b"
          viewBox="0 0 14 8"
          refX={13}
          refY={4}
          markerWidth={14}
          markerHeight={8}
          orient="auto"
        >
          <path stroke="#c00" fill="#c00" d="M1 4V1l12 3L1 7z" />
        </marker>
      </defs>
      <g textAnchor="middle">
        <text x={45} y={-10} fontSize={15} fontWeight="bold" fill="currentColor">
          {'keys'}
        </text>
        <g transform="translate(0 30)">
          <use xlinkHref="#a" />
          <text x={45} y={14}>
            {'John Smith'}
          </text>
          <path stroke="#d00" d="M95 10h5m0 0 30 70" />
          <path stroke="#d00" markerEnd="url(#b)" d="M130 80h20" />
        </g>
        <g transform="translate(0 70)">
          <use xlinkHref="#c" />
          <text x={45} y={14}>
            {'Lisa Smith'}
          </text>
          <path stroke="#000" d="M95 10h5m0 0 30-50" />
          <path stroke="#000" markerEnd="url(#d)" d="M130-40h20" />
        </g>
        <g transform="translate(0 110)">
          <use xlinkHref="#c" />
          <text x={45} y={14}>
            {'Sam Doe'}
          </text>
          <path stroke="#000" d="M95 10h5m0 0 30 90" />
          <path stroke="#000" markerEnd="url(#d)" d="M130 100h20" />
        </g>
        <g transform="translate(0 150)">
          <use xlinkHref="#a" />
          <text x={45} y={14}>
            {'Sandra Dee'}
          </text>
          <path stroke="#d00" d="M95 10h5m0 0 30-50" />
          <path stroke="#d00" markerEnd="url(#b)" d="M130-40h20" />
        </g>
        <g transform="translate(0 190)">
          <use xlinkHref="#c" />
          <text x={45} y={14}>
            {'Ted Baker'}
          </text>
          <path stroke="#000" d="M95 10h5m0 0 30-70" />
          <path stroke="#000" markerEnd="url(#d)" d="M130-60h20" />
        </g>
      </g>
      <g textAnchor="middle">
        <text
          x={135}
          y={-10}
          fontSize={15}
          fontWeight="bold"
          fill="currentColor"
          transform="translate(150)"
        >
          {'buckets'}
        </text>
        <g transform="translate(150)">
          <use xlinkHref="#e" />
          <text x={20} y={14}>
            {'000'}
          </text>
          <use x={40} xlinkHref="#f" />
          <use x={130} xlinkHref="#g" />
          <use x={210} xlinkHref="#h" />
          <path stroke="#000" markerStart="url(#i)" d="M220 10h.001" />
        </g>
        <g transform="translate(150 20)">
          <use xlinkHref="#j" />
          <text x={20} y={14}>
            {'001'}
          </text>
          <use x={40} xlinkHref="#k" />
          <text x={85} y={14}>
            {'Lisa Smith'}
          </text>
          <use x={130} xlinkHref="#l" />
          <text x={170} y={14}>
            {'521-8976'}
          </text>
          <use x={210} xlinkHref="#m" />
          <path stroke="#000" markerStart="url(#n)" d="M220 10h.001" />
        </g>
        <g transform="translate(150 40)">
          <use xlinkHref="#e" />
          <text x={20} y={14}>
            {'002'}
          </text>
          <use x={40} xlinkHref="#f" />
          <use x={130} xlinkHref="#g" />
          <use x={210} xlinkHref="#h" />
          <path stroke="#000" markerStart="url(#i)" d="M220 10h.001" />
        </g>
        <g fontWeight="bold">
          <text x={20} y={14} transform="translate(150 60)">
            {':'}
          </text>
          <text x={85} y={14} transform="translate(150 60)">
            {':'}
          </text>
          <text x={170} y={14} transform="translate(150 60)">
            {':'}
          </text>
          <text x={220} y={14} transform="translate(150 60)">
            {':'}
          </text>
        </g>
        <g transform="translate(150 80)">
          <use xlinkHref="#e" />
          <text x={20} y={14}>
            {'151'}
          </text>
          <use x={40} xlinkHref="#f" />
          <use x={130} xlinkHref="#g" />
          <use x={210} xlinkHref="#h" />
          <path stroke="#000" markerStart="url(#i)" d="M220 10h.001" />
        </g>
        <g transform="translate(150 100)">
          <use xlinkHref="#o" />
          <text x={20} y={14}>
            {'152'}
          </text>
          <use x={40} xlinkHref="#k" />
          <text x={85} y={14}>
            {'John Smith'}
          </text>
          <use x={130} xlinkHref="#l" />
          <text x={170} y={14}>
            {'521-1234'}
          </text>
          <use x={210} xlinkHref="#m" />
          <path stroke="#000" markerStart="url(#n)" markerEnd="url(#d)" d="m220 10 40 10" />
        </g>
        <g transform="translate(150 120)">
          <use xlinkHref="#j" />
          <text x={20} y={14}>
            {'153'}
          </text>
          <use x={40} xlinkHref="#k" />
          <text x={85} y={14}>
            {'Ted Baker'}
          </text>
          <use x={130} xlinkHref="#l" />
          <text x={170} y={14}>
            {'418-4165'}
          </text>
          <use x={210} xlinkHref="#m" />
          <path stroke="#000" markerStart="url(#n)" d="M220 10h.001" />
        </g>
        <g transform="translate(150 140)">
          <use xlinkHref="#e" />
          <text x={20} y={14}>
            {'154'}
          </text>
          <use x={40} xlinkHref="#f" />
          <use x={130} xlinkHref="#g" />
          <use x={210} xlinkHref="#h" />
          <path stroke="#000" markerStart="url(#i)" d="M220 10h.001" />
        </g>
        <g fontWeight="bold">
          <text x={20} y={14} transform="translate(150 160)">
            {':'}
          </text>
          <text x={85} y={14} transform="translate(150 160)">
            {':'}
          </text>
          <text x={170} y={14} transform="translate(150 160)">
            {':'}
          </text>
          <text x={220} y={14} transform="translate(150 160)">
            {':'}
          </text>
        </g>
        <g transform="translate(150 180)">
          <use xlinkHref="#e" />
          <text x={20} y={14}>
            {'253'}
          </text>
          <use x={40} xlinkHref="#f" />
          <use x={130} xlinkHref="#g" />
          <use x={210} xlinkHref="#h" />
          <path stroke="#000" markerStart="url(#i)" d="M220 10h.001" />
        </g>
        <g transform="translate(150 200)">
          <use xlinkHref="#j" />
          <text x={20} y={14}>
            {'254'}
          </text>
          <use x={40} xlinkHref="#k" />
          <text x={85} y={14}>
            {'Sam Doe'}
          </text>
          <use x={130} xlinkHref="#l" />
          <text x={170} y={14}>
            {'521-5030'}
          </text>
          <use x={210} xlinkHref="#m" />
          <path stroke="#000" markerStart="url(#n)" d="M220 10h.001" />
        </g>
        <g transform="translate(150 220)">
          <use xlinkHref="#e" />
          <text x={20} y={14}>
            {'255'}
          </text>
          <use x={40} xlinkHref="#f" />
          <use x={130} xlinkHref="#g" />
          <use x={210} xlinkHref="#h" />
          <path stroke="#000" markerStart="url(#i)" d="M220 10h.001" />
        </g>
      </g>
      <g textAnchor="middle">
        <text
          x={95}
          y={-30}
          fontSize={15}
          fontWeight="bold"
          fill="currentColor"
          transform="translate(410)"
        >
          {'overflow'}
        </text>
        <text
          x={95}
          y={-10}
          fontSize={15}
          fontWeight="bold"
          fill="currentColor"
          transform="translate(410)"
        >
          {'entries'}
        </text>
        <g transform="translate(410 110)">
          <use xlinkHref="#m" />
          <path stroke="#000" markerStart="url(#i)" d="M10 10v.001" />
          <use x={20} xlinkHref="#k" />
          <text x={65} y={14}>
            {'Sandra Dee'}
          </text>
          <use x={110} xlinkHref="#l" />
          <text x={150} y={14}>
            {'521-9655'}
          </text>
        </g>
      </g>
    </g>
  </svg>
);

export default HashTableWide;
