import * as React from 'react';
import TableDataStructure from '../TableDataStructure';

const DEMO_ITEMS = [
  {
    key: '"grass"',
    value: '"green"',
  },
  {
    key: '"sky"',
    value: '"blue"',
  },
  {
    key: '"sun"',
    value: '"orange"',
  },
  {
    key: '"cloud"',
    value: '"white"',
  },
  {
    key: '"lemon"',
    value: '"yellow"',
  },
];

const HashTableSimple = () => {
  return <TableDataStructure items={DEMO_ITEMS} keyTitle="key" valueTitle="value" />;
};

export default HashTableSimple;
