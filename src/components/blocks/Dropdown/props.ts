export interface Item {
  name: string;
  href?: string;
  external?: boolean;
  onClick?: () => void;
}

export interface TriggerProps {
  isOpen: boolean;
  triggerText?: string | React.ReactElement;
  triggerLabel?: string;
  handleFocus: () => void;
  handleBlur: () => void;
  handleClick: () => void;
}

export interface MenuProps {
  up?: boolean;
  items: Item[];
  left?: boolean;
  minWidth?: number;
  verticalOffset?: number;
  mobileWidth?: string;
  Trigger?: React.ComponentType<TriggerProps>;
  triggerText?: string | React.ReactElement;
  triggerLabel?: string;
  handleFocus: () => void;
  handleBlur: () => void;
}
