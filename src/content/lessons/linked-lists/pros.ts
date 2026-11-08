import { Item } from 'content/blocks/InstructionalArticles/ProsCons/props';

const pros: Item[] = [
  {
    title: 'Flexible Size / Distributed',
    description:
      'Data does not need to be sequential in memory. We can arbitrarily add/remove items in a linked list as long as we have a way to point to the next item.',
  },
  {
    title: 'Ordered',
    description: 'Linked lists provide order by pointing to the `next` item in the linked list.',
  },
  {
    title: 'Fast Insert / Delete',
    description:
      'If we have access to a node (typically the head or tail), we get fast inserts and deletes because the only thing that is required is updating a pointer.',
  },
];

export default pros;
