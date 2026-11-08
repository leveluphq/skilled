import * as React from 'react';
import TableDataStructure from '../TableDataStructure';

const DEMO_ITEMS = [
  {
    key: '0',
    value: '"Facebook"',
  },
  {
    key: '1',
    value: '"Amazon"',
  },
  {
    key: '2',
    value: '"Apple"',
  },
  {
    key: '3',
    value: '"Netflix"',
  },
  {
    key: '4',
    value: '"Google"',
  },
  {
    key: '5',
    value: '"Skilled.dev"',
  },
  {
    key: '6',
    value: '"gitconnected"',
  },
];

const ArraySimple = () => {
  return <TableDataStructure items={DEMO_ITEMS} />;
};

export default ArraySimple;
