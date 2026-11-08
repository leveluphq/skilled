export interface Item {
  title: string;
  description?: string;
}

export interface Props {
  pros: Item[];
  cons: Item[];
}
