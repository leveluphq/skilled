import { VideoDetails } from 'utils/constants/lesson';

export const video: VideoDetails = {
  segments: [
    {
      name: 'Introduction',
      startTimeSeconds: 0,
      endTimeSeconds: 8,
    },
    {
      name: 'DFS vs. BFS in Trees',
      startTimeSeconds: 8,
      endTimeSeconds: 96,
    },
    {
      name: 'Overview of Traversing Trees',
      startTimeSeconds: 96,
      endTimeSeconds: 238,
    },
    {
      name: 'In-Order Traversal',
      startTimeSeconds: 238,
      endTimeSeconds: 371,
    },
    {
      name: 'Pre-Order Traversal',
      startTimeSeconds: 371,
      endTimeSeconds: 412,
    },
    {
      name: 'Post-Order Traversal',
      startTimeSeconds: 412,
      endTimeSeconds: 463,
    },
    {
      name: 'BFS',
      startTimeSeconds: 463,
      endTimeSeconds: 571,
    },
  ],
  changesSinceRecording: [
    'In-order traversal visits nodes in ascending order only for a binary search tree.',
    'The BFS code now returns right away for an empty tree.',
  ],
};
