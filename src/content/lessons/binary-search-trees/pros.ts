import { Item } from 'content/blocks/InstructionalArticles/ProsCons/props';

const pros: Item[] = [
  {
    title: 'Fast O(log n) for all operations',
    description: 'Assuming we have a balanced tree, all of our operations are fast.',
  },
  {
    title: 'Ordered',
    description: 'We maintain a BST in ascending sorted order.',
  },
  {
    title: 'Flexible Size',
    description:
      'Data does not need to be sequential in memory. We can arbitrarily add/remove items on a tree as long as we have a way to point to the next item.',
  },
];

export default pros;
