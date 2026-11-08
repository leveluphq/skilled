import { Item } from 'content/blocks/InstructionalArticles/ProsCons/props';

const cons: Item[] = [
  { title: 'No order', description: 'Since we store data by key name, we lose meaningful order.' },
  {
    title: 'One-way mapping',
    description: 'We can map keys to a value, but we cannot access the other way around.',
  },
  {
    title: 'Slow key iteration',
    description:
      'If we want to grab all the keys, it requires O(n) time because the only reference to them is stored in the table buckets.',
  },
];

export default cons;
