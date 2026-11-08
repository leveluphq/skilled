import * as React from 'react';
import { HightlightFrontPattern, HightlightBackPattern } from '../../styles';

const CodeHighlight2 = () => {
  return (
    <pre className="language-javascript">
      <code className="language-javascript">
        <div>
          <HightlightBackPattern>3 * 7 * 10 * 15 * 31</HightlightBackPattern>
        </div>
        <div>
          2 * <HightlightBackPattern>7 * 10 * 15 * 31</HightlightBackPattern>
        </div>
        <div>
          2 * 3 * <HightlightBackPattern>10 * 15 * 31</HightlightBackPattern>
        </div>
        <div>
          2 * 3 * 7 * <HightlightBackPattern>15 * 31 </HightlightBackPattern>
        </div>
        <div>
          2 * 3 * 7 * 10 * <HightlightBackPattern>31 </HightlightBackPattern>
        </div>
        <div>2 * 3 * 7 * 10 * 15</div>
        <div> </div>
        <div>3 * 7 * 10 * 15 * 31</div>
        <div>
          <HightlightFrontPattern>2</HightlightFrontPattern> * 7 * 10 * 15 * 31
        </div>
        <div>
          <HightlightFrontPattern>2 * 3</HightlightFrontPattern> * 10 * 15 * 31
        </div>
        <div>
          <HightlightFrontPattern>2 * 3 * 7</HightlightFrontPattern> * 15 * 31
        </div>
        <div>
          <HightlightFrontPattern>2 * 3 * 7 * 10</HightlightFrontPattern> * 31
        </div>
        <div>
          <HightlightFrontPattern>2 * 3 * 7 * 10 * 15</HightlightFrontPattern>
        </div>
      </code>
    </pre>
  );
};

export default CodeHighlight2;
