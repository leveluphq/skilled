import * as React from 'react';
import { Container } from 'style/elements';
import { Props } from './props';

import { Table } from './styles';

const BigOChart: React.FC<Props> = () => {
  return (
    <Container>
      <Table>
        <thead>
          <tr>
            <th>
              input size
              <br />n
            </th>
            <th>O(n)</th>
            <th>O(log n)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>2</td>
            <td>2</td>
            <td>1</td>
          </tr>
          <tr>
            <td>4</td>
            <td>4</td>
            <td>2</td>
          </tr>
          <tr>
            <td>8</td>
            <td>8</td>
            <td>3</td>
          </tr>
          <tr>
            <td>16</td>
            <td>16</td>
            <td>4</td>
          </tr>
          <tr>
            <td>...</td>
            <td>...</td>
            <td>...</td>
          </tr>
          <tr>
            <td>1024</td>
            <td>1024</td>
            <td>10</td>
          </tr>
          <tr>
            <td>2048</td>
            <td>2048</td>
            <td>11</td>
          </tr>
          <tr>
            <td>4096</td>
            <td>4096</td>
            <td>12</td>
          </tr>
          <tr>
            <td>...</td>
            <td>...</td>
            <td>...</td>
          </tr>
          <tr>
            <td>1048576</td>
            <td>1048576</td>
            <td>20</td>
          </tr>
        </tbody>
      </Table>
    </Container>
  );
};

export default BigOChart;
