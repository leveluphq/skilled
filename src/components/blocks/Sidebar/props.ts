export interface ItemProps {
  href?: string;
  as?: string;
  isExternal?: boolean;
  onClick?: () => void;
  text?: string;
  isHighlighted?: boolean;
  disabled?: boolean;
}

export interface ContainerProps {
  title?: string;
  label?: string;
  footer?: React.ReactNode;
  right?: boolean;
  sidebarDepth?: boolean;
}

export interface SubmenuProps {
  title?: string;
  isDefaultOpen?: boolean;
}
