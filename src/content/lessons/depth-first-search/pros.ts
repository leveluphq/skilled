import { Item } from 'content/blocks/InstructionalArticles/ProsCons/props';

const pros: Item[] = [
  {
    title: 'Less memory used',
    description:
      'We often assume paths tend to contain less nodes than the width, so DFS is typically better with memory than BFS. DFS is better if the graph is wider than it is deep.',
  },
  {
    title: 'Determine if a path exists',
    description: 'It is efficient in finding if a path between a source and target exists.',
  },
];

export default pros;
