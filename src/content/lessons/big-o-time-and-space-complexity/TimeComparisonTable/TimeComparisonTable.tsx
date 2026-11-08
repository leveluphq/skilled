import * as React from 'react';
import { MarginContainerCenter } from 'content/blocks/styles';

import { Table } from './styles';

const TimeComparisonTable = () => {
  return (
    <MarginContainerCenter>
      <Table>
        <thead>
          <tr>
            <th>Input size</th>
            <th>log n</th>
            <th>n</th>
            <th>n log n</th>
            <th>
              n<sup>2</sup>
            </th>
            <th>
              2<sup>n</sup>
            </th>
            <th>n!</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>10</td>
            <td className="best">0.003µs</td>
            <td className="best">0.01µs</td>
            <td className="best">0.033µs</td>
            <td className="best">0.1µs</td>
            <td className="best">1µs</td>
            <td className="good">3.63ms</td>
          </tr>
          <tr>
            <td>20</td>
            <td className="best">0.004µs</td>
            <td className="best">0.02µs</td>
            <td className="best">0.086µs</td>
            <td className="best">0.4µs</td>
            <td className="good">1ms</td>
            <td className="bad">77years</td>
          </tr>
          <tr>
            <td>30</td>
            <td className="best">0.005µs</td>
            <td className="best">0.03µs</td>
            <td className="best">0.147µs</td>
            <td className="best">0.9µs</td>
            <td className="good">1sec</td>
            <td className="bad">
              8.4x10<sup>15</sup>years
            </td>
          </tr>

          <tr>
            <td>40</td>
            <td className="best">0.005µs</td>
            <td className="best">0.04µs</td>
            <td className="best">0.213µs</td>
            <td className="best">1.6µs</td>
            <td className="medium">18.3min</td>
            <td className="bad">--</td>
          </tr>
          <tr>
            <td>50</td>
            <td className="best">0.006µs</td>
            <td className="best">0.05µs</td>
            <td className="best">0.282µs</td>
            <td className="best">2.5µs</td>
            <td className="bad">13days</td>
            <td className="bad">--</td>
          </tr>
          <tr>
            <td>100</td>
            <td className="best">0.007µs</td>
            <td className="best">0.1µs</td>
            <td className="best">0.664µs</td>
            <td className="best">10µs</td>
            <td className="bad">
              4x10<sup>13</sup>years
            </td>
            <td className="bad">--</td>
          </tr>
          <tr>
            <td>1,000</td>
            <td className="best">0.010µs</td>
            <td className="best">1.00µs</td>
            <td className="best">9.966µs</td>
            <td className="good">1ms</td>
            <td className="bad">--</td>
            <td className="bad">--</td>
          </tr>
          <tr>
            <td>10,000</td>
            <td className="best">0.013µs</td>
            <td className="best">10µs</td>
            <td className="best">130µs</td>
            <td className="good">100ms</td>
            <td className="bad">--</td>
            <td className="bad">--</td>
          </tr>
          <tr>
            <td>100,000</td>
            <td className="best">0.017µs</td>
            <td className="good">0.10ms</td>
            <td className="good">1.67ms</td>
            <td className="okay">10sec</td>
            <td className="bad">--</td>
            <td className="bad">--</td>
          </tr>
          <tr>
            <td>1'000,000</td>
            <td className="best">0.020µs</td>
            <td className="good">1ms</td>
            <td className="good">19.93ms</td>
            <td className="medium">16.7min</td>
            <td className="bad">--</td>
            <td className="bad">--</td>
          </tr>
          <tr>
            <td>10'000,000</td>
            <td className="best">0.023µs</td>
            <td className="good">0.01sec</td>
            <td className="good">0.23sec</td>
            <td className="bad">1.16days</td>
            <td className="bad">--</td>
            <td className="bad">--</td>
          </tr>
          <tr>
            <td>100'000,000</td>
            <td className="best">0.027µs</td>
            <td className="good">0.10sec</td>
            <td className="good">2.66sec</td>
            <td className="bad">115.7days</td>
            <td className="bad">--</td>
            <td className="bad">--</td>
          </tr>
          <tr>
            <td>1,000'000,000</td>
            <td className="best">0.030µs</td>
            <td className="good">1sec</td>
            <td className="okay">29.90sec</td>
            <td className="bad">31.7years</td>
            <td className="bad">--</td>
            <td className="bad">--</td>
          </tr>
        </tbody>
      </Table>
    </MarginContainerCenter>
  );
};

export default TimeComparisonTable;
