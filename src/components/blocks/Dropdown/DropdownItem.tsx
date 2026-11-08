import * as React from 'react';
import Link from 'next/link';
import { Item } from './props';

import { DropdownItemContent, DropdownLink, DropdownButton } from './styles';

const DropdownItem: React.FC<{ item: Item; handleBlur: any; handleFocus: any }> = ({
  item,
  handleFocus,
  handleBlur,
}) => {
  if (item.onClick) {
    return (
      <DropdownButton
        onClick={item.onClick}
        onFocus={handleFocus}
        onBlur={handleBlur}
        role="menuitem"
      >
        <DropdownItemContent>{item.name}</DropdownItemContent>
      </DropdownButton>
    );
  }

  return item.external ? (
    <DropdownLink href={item.href!} onFocus={handleFocus} onBlur={handleBlur} role="menuitem">
      <DropdownItemContent>{item.name}</DropdownItemContent>
    </DropdownLink>
  ) : (
    <Link href={item.href!} passHref>
      <DropdownLink onFocus={handleFocus} onBlur={handleBlur} role="menuitem">
        <DropdownItemContent>{item.name}</DropdownItemContent>
      </DropdownLink>
    </Link>
  );
};

export default DropdownItem;
