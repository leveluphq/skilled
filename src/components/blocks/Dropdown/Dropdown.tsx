import * as React from 'react';
import useOnClickOutside from 'components/hooks/useOnOutsideClick';
import DropdownItem from './DropdownItem';
import TriggerDefault from './TriggerDefault';
import { MenuProps } from './props';

import { Container, DropdownMenu } from './styles';

const Dropdown: React.FC<MenuProps> = ({
  Trigger = TriggerDefault,
  triggerText,
  triggerLabel,
  minWidth = 220,
  up,
  items,
  handleFocus,
  handleBlur,
  left,
  verticalOffset,
  mobileWidth,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const triggerEl = React.useRef(null);
  const closeDropdown = React.useCallback(() => {
    setIsDropdownOpen(false);
  }, [isDropdownOpen, setIsDropdownOpen]);
  useOnClickOutside(triggerEl, closeDropdown);

  // TODO: Close it on escape key press
  return (
    <Container
      // onMouseEnter={() => setIsDropdownOpen(true)}
      // onMouseLeave={() => setIsDropdownOpen(false)}
      ref={triggerEl}
    >
      <Trigger
        isOpen={isDropdownOpen}
        handleClick={() => setIsDropdownOpen(!isDropdownOpen)}
        handleFocus={handleFocus}
        handleBlur={handleBlur}
        triggerText={triggerText}
        triggerLabel={triggerLabel}
      />
      {isDropdownOpen && (
        <DropdownMenu
          role="menu"
          aria-label="User Navigation"
          left={left}
          onClick={closeDropdown}
          minWidth={minWidth}
          up={up}
          verticalOffset={verticalOffset}
          mobileWidth={mobileWidth}
        >
          {items.map((item, i) => (
            <DropdownItem
              key={item.name}
              item={item}
              handleFocus={() => {
                setIsDropdownOpen(true);
                handleFocus();
              }}
              handleBlur={() => {
                if (i === items.length - 1) {
                  handleBlur();
                  setIsDropdownOpen(false);
                }
              }}
            />
          ))}
        </DropdownMenu>
      )}
    </Container>
  );
};

export default Dropdown;
