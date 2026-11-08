import * as React from 'react';

interface Props {
  letter?: string;
  exponent?: string;
  base?: string;
}

const constant: React.FC<Props> = () => <em>O(1)</em>;
const n: React.FC<Props> = ({ letter = 'n' }) => <em>O({letter})</em>;
const n2: React.FC<Props> = ({ letter = 'n', exponent = 2 }) => (
  <em>
    O({letter}
    <sup>{exponent}</sup>)
  </em>
);
const logn: React.FC<Props> = ({ letter = 'n' }) => <em>O(log {letter})</em>;
const nlogn: React.FC<Props> = ({ letter = 'n' }) => (
  <em>
    O({letter} log {letter})
  </em>
);
const bin: React.FC<Props> = ({ base = 2, letter = 'n' }) => (
  <em>
    O({base}
    <sup>{letter}</sup>)
  </em>
);
const factorial: React.FC<Props> = ({ letter = 'n' }) => <em>O({letter}!)</em>;

const BigO = {
  constant,
  n,
  n2,
  logn,
  nlogn,
  bin,
  factorial,
};

export default BigO;
