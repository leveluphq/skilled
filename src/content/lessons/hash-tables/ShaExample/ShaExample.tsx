import React from 'react';
import { Container } from 'style/elements';

import { ShaOutput, Input } from './styles';

const INITIAL_TEXT = 'Change this input string to create a new hash';

async function digestMessage(message: string) {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return hashHex;
}

const ShaExample: React.FC = () => {
  const [shaInput, setShaInput] = React.useState(INITIAL_TEXT);
  const [shaOutput, setShaOutput] = React.useState('');

  React.useEffect(() => {
    digestMessage(shaInput).then(message => setShaOutput(message));
  }, [shaInput]);

  return (
    <Container>
      <div>
        <Input
          value={shaInput}
          onChange={e => setShaInput(e.target.value)}
          placeholder="Enter a value..."
        />
      </div>
      <ShaOutput>
        Output SHA-256 hash: <code>{shaOutput}</code>
      </ShaOutput>
    </Container>
  );
};

export default ShaExample;
