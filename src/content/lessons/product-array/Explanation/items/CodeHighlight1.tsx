import * as React from 'react';
import { HightlightFrontPattern, HightlightBackPattern } from '../../styles';

const CodeHighlight1 = () => {
  return (
    <pre className="language-javascript">
      <code className="language-javascript">
        <div>
          3 * 7 * <HightlightBackPattern>10 * 15 * 31</HightlightBackPattern>
        </div>
        <div>
          2 * 7 * <HightlightBackPattern>10 * 15 * 31</HightlightBackPattern>
        </div>
        <div>
          2 * 3 * <HightlightBackPattern>10 * 15 * 31</HightlightBackPattern>
        </div>
        <div>
          <HightlightFrontPattern>2 * 3 * 7</HightlightFrontPattern> * 15 * 31
        </div>
        <div>
          <HightlightFrontPattern>2 * 3 * 7</HightlightFrontPattern> * 10 * 31
        </div>
        <div>
          <HightlightFrontPattern>2 * 3 * 7</HightlightFrontPattern> * 10 * 15
        </div>
      </code>
    </pre>
  );
};

export default CodeHighlight1;
