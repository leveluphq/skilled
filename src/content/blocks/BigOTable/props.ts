export enum ComplexityFields {
  Space = 'space',
  Traverse = 'traverse',
  Copy = 'copy',
  Lookup = 'lookup',
  Set = 'set',
  Search = 'search',
  SearchUnsorted = 'search (unsorted)',
  SearchSorted = 'search (sorted)',
  Insert = 'insert',
  Delete = 'delete',
  Prepend = 'prepend',
  Append = 'append',
  Push = 'push',
  Pop = 'pop',
  Enqueue = 'enqueue',
  Dequeue = 'dequeue',
  Peek = 'peek',
  AppendWithTail = 'append (w/ tail)',
  AppendWithoutTail = 'append (w/o tail)',
}

export interface BigOItem {
  name: ComplexityFields;
  average: React.FC;
  worst?: React.FC;
}

export interface Props {
  items: BigOItem[];
}
