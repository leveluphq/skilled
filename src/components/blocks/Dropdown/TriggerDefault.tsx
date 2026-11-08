import * as React from 'react';
import { ChevronDown16, Menu32, Close32 } from '@carbon/icons-react';
import { TriggerProps } from './props';

import { Trigger, TriggerText, TriggerDesktop, TriggerMobile } from './styles';

const TriggerDefault: React.FC<TriggerProps> = ({
  isOpen,
  handleClick,
  handleFocus,
  handleBlur,
  triggerText,
  triggerLabel,
}) => {
  return (
    <Trigger
      onClick={handleClick}
      onFocus={handleFocus}
      onBlur={handleBlur}
      aria-haspopup={true}
      aria-expanded={isOpen}
      aria-label={triggerLabel || (typeof triggerText === 'string' ? triggerText : undefined)}
    >
      <TriggerDesktop>
        <TriggerText>{triggerText}</TriggerText> <ChevronDown16 />
      </TriggerDesktop>
      <TriggerMobile>
        {isOpen ? <Close32 aria-hidden="true" /> : <Menu32 aria-hidden="true" />}
      </TriggerMobile>
    </Trigger>
  );
};

export default TriggerDefault;
