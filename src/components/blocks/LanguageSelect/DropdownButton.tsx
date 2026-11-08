import * as React from 'react';
import { ChevronDown16 } from '@carbon/icons-react';
import Dropdown from 'components/blocks/Dropdown';
import { TriggerProps, MenuProps } from 'components/blocks/Dropdown/props';

import { ToggleButton } from './styles';

// NOTE: This is basically TriggerDefault.
// Should probably just pass ToggleButton as the wrapper
const Trigger: React.FC<TriggerProps> = ({
  isOpen,
  triggerText,
  handleClick,
  handleFocus,
  handleBlur,
}) => {
  return (
    <ToggleButton
      onClick={handleClick}
      onFocus={handleFocus}
      onBlur={handleBlur}
      aria-haspopup={true}
      aria-expanded={isOpen}
    >
      {triggerText} <ChevronDown16 style={{ marginRight: '-2px' }} />
    </ToggleButton>
  );
};

const DropdownButton: React.FC<MenuProps> = ({
  triggerText,
  items,
  left,
  handleFocus,
  handleBlur,
  up,
}) => {
  return (
    <Dropdown
      up={up}
      minWidth={0}
      verticalOffset={18}
      mobileWidth="auto"
      Trigger={Trigger}
      left={left}
      handleFocus={handleFocus}
      handleBlur={handleBlur}
      items={items}
      triggerText={triggerText}
    />
  );
};

export default DropdownButton;
