import * as React from 'react';
import Link from 'next/link';
import { ChevronDown16 } from '@carbon/icons-react';
import collectAriaAttributes from 'utils/client/collectAriaAttributes';
import { ItemProps, ContainerProps, SubmenuProps } from './props';

import {
  SidebarContainer,
  SidebarTitle,
  SidebarMenu,
  SidebarMenuTitle,
  SidebarMenuItems,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarToggleMenu,
  SidebarFooter,
} from './styles';

export const SidebarItem: React.FC<ItemProps> = ({
  href,
  as,
  onClick,
  text,
  isExternal,
  isHighlighted,
  children,
}) => {
  if (isExternal) {
    return (
      <SidebarMenuItem href={href} onClick={onClick} isHighlighted={isHighlighted}>
        {text}
        {children}
      </SidebarMenuItem>
    );
  }

  return (
    <Link href={href!} as={as} passHref>
      <SidebarMenuItem onClick={onClick} isHighlighted={isHighlighted}>
        {text}
        {children}
      </SidebarMenuItem>
    </Link>
  );
};

export const SidebarButton: React.FC<ItemProps> = ({
  onClick,
  text,
  disabled,
  children,
  ...rest
}) => {
  const ariaProps = collectAriaAttributes(rest);

  return (
    <SidebarMenuButton
      onClick={onClick}
      disabled={disabled}
      {...ariaProps}
    >
      {text}
      {children}
    </SidebarMenuButton>
  );
};

export const SidebarSubMenu: React.FC<SubmenuProps> = ({
  title,
  children,
  isDefaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = React.useState(isDefaultOpen);

  return (
    <SidebarToggleMenu>
      <SidebarMenuTitle onClick={() => setIsOpen(!isOpen)} isOpen={isOpen}>
        {title} <ChevronDown16 />
      </SidebarMenuTitle>
      {isOpen && <SidebarMenuItems>{children}</SidebarMenuItems>}
    </SidebarToggleMenu>
  );
};

export const Sidebar: React.FC<ContainerProps> = ({
  right,
  title = '',
  label = '',
  sidebarDepth,
  footer,
  children,
}) => {
  return (
    <SidebarContainer role="menu" aria-label={label} right={right} sidebarDepth={sidebarDepth}>
      {!!title && <SidebarTitle>{title}</SidebarTitle>}
      <SidebarMenu>{children}</SidebarMenu>
      {!!footer && <SidebarFooter>{footer}</SidebarFooter>}
    </SidebarContainer>
  );
};
