import { Item } from 'content/blocks/InstructionalArticles/ProsCons/props';

const pros: Item[] = [
  {
    title: 'Speed',
    description:
      'Fast O(1) operations because keys map directly to a value, allowing us to quickly find/modify/delete the item we want without iterating through the data structure.',
  },
  {
    title: 'Meaningful and flexible keys',
    description:
      'Keys can be declared as strings allowing us to name them in the context of the problem.',
  },
  {
    title: 'Universal',
    description:
      'Key-value storage is easy to send through an API, store in a cache, and access in any language.',
  },
];

export default pros;
