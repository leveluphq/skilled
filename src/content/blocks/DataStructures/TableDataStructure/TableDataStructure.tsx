import React from 'react';

import { Table, Row, Cell } from './styles';

interface Item {
  key: string | number;
  value: string | number;
}

interface Props {
  items: Item[];
  keyTitle?: string;
  valueTitle?: string;
}

const TableDataStructure: React.FC<Props> = ({ items, keyTitle, valueTitle }) => {
  return (
    <Table>
      {(!!keyTitle || !!valueTitle) && (
        <thead>
          <tr>
            <th>{keyTitle || ''}</th>
            <th>{valueTitle || ''}</th>
          </tr>
        </thead>
      )}
      <tbody>
        {items.map(({ key, value }) => (
          <Row key={key}>
            <Cell>{key}</Cell>
            <Cell>{value}</Cell>
          </Row>
        ))}
      </tbody>
    </Table>
  );
};

export default TableDataStructure;
