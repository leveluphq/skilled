import { Item } from 'content/blocks/InstructionalArticles/ProsCons/props';

const cons: Item[] = [
  {
    title: 'Deep graphs are slow',
    description:
      'DFS can get slow if the graph is deep because it follows paths fully before moving to the next. BFS outperforms DFS when graphs are deeper than they are wide.',
  },
];

export default cons;
