import * as React from 'react';

import { CloseButton as Button } from './styles';

interface Props {
  onExit: any;
}

const CloseButton: React.FC<Props> = ({ onExit }) => (
  <Button aria-label="Close dialog" onClick={onExit}>
    &times;
  </Button>
);

export default CloseButton;
