import * as React from 'react';

const CodeHighlight1 = () => {
  return (
    <pre className="language-javascript">
      <code className="language-javascript">
        log<sub>2</sub>(8) = <span style={{ color: '#5CC872' }}>3</span>
        {'\n\n'}8 / 2 / 2 / 2 = 1{'\n'}
        {'    '}-{'   '}-{'   '}-{'\n'}
        {'    '}1{'   '}2{'   '}
        <span style={{ color: '#5CC872' }}>3</span>
      </code>
    </pre>
  );
};

export default CodeHighlight1;
