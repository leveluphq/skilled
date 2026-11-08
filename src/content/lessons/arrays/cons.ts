import { Item } from 'content/blocks/InstructionalArticles/ProsCons/props';

const cons: Item[] = [
  {
    title: 'Slow insert / delete',
    description:
      'Inserting or deleting an item in the middle of an array requires every item after it to be re-indexed',
  },
  {
    title: 'Slow searches',
    description:
      'To find an item in the array, we must iterate through the list which requires O(n) time',
  },
  {
    title: 'Indexes are not flexible',
    description:
      'An index only points to a location in the array but provides no other meaning about the item',
  },
];

export default cons;
