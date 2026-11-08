import * as React from 'react';
import { SolutionHighlight } from '../../styles';

const CodeHighlight3 = () => {
  return (
    <pre className="language-javascript">
      <code className="language-javascript">
        <div>
          0: [<SolutionHighlight>97650</SolutionHighlight> = 3 * 7 * 10 * 15 * 31]
        </div>
        <div>
          1: [2 * = <SolutionHighlight>65100</SolutionHighlight> = * 7 * 10 * 15 * 31]
        </div>
        <div>
          2: [2 * 3 * = <SolutionHighlight>27900</SolutionHighlight> = * 10 * 15 * 31]
        </div>
        <div>
          3: [2 * 3 * 7 * = <SolutionHighlight>19530</SolutionHighlight> = * 15 * 31]
        </div>
        <div>
          4: [2 * 3 * 7 * 10 * = <SolutionHighlight>13020</SolutionHighlight> = * 31]
        </div>
        <div>
          5: [2 * 3 * 7 * 10 * 15 * = <SolutionHighlight>6300</SolutionHighlight>]
        </div>
      </code>
    </pre>
  );
};

export default CodeHighlight3;
