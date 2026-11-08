import { Item } from 'content/blocks/InstructionalArticles/ProsCons/props';

const pros: Item[] = [
  {
    title: 'Fast Access at the Last Item',
    description: 'We can add/remove/access the last item in O(1) time.',
  },
  {
    title: 'Ordered',
    description:
      'The data is ordered where the most recently added items are at the top of the stack, and the oldest items are at the bottom.',
  },
];

export default pros;
