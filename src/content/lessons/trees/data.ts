import { VideoDetails } from 'utils/constants/lesson';

export const video: VideoDetails = {
  segments: [
    {
      name: 'Introduction',
      startTimeSeconds: 0,
      endTimeSeconds: 9,
    },
    {
      name: 'Trees Explained',
      startTimeSeconds: 9,
      endTimeSeconds: 159,
    },
    {
      name: 'Trees in the Real World',
      startTimeSeconds: 159,
      endTimeSeconds: 288,
    },
    {
      name: 'Tree Nodes',
      startTimeSeconds: 288,
      endTimeSeconds: 400,
    },
    {
      name: 'Tree Terms Defined',
      startTimeSeconds: 400,
      endTimeSeconds: 520,
    },
    {
      name: 'What Makes a Valid Tree',
      startTimeSeconds: 520,
      endTimeSeconds: 729,
    },
    {
      name: 'Types of Trees',
      startTimeSeconds: 729,
      endTimeSeconds: 857,
    },
    {
      name: 'Big O and Pros/Cons',
      startTimeSeconds: 857,
      endTimeSeconds: 1001,
    },
  ],
  changesSinceRecording: [
    'Binary search tree lookups, inserts and deletes are O(log n) only when the tree is balanced. An unbalanced one can degrade to O(n).',
  ],
};
