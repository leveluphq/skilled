import React from 'react';
import { Props } from './props';

import { Table } from './styles';

const BigOTable: React.FC<Props> = ({ items }) => {
  return (
    <Table>
      <thead>
        <tr>
          <th />
          <th>Big O Complexity</th>
        </tr>
      </thead>
      <tbody>
        {items.map(Item => (
          <tr key={Item.name}>
            <td>{Item.name}</td>
            <td>{<Item.average />}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default BigOTable;
