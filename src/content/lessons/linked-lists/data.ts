import { VideoDetails } from 'utils/constants/lesson';

export const video: VideoDetails = {
  segments: [
    {
      name: 'Introduction',
      startTimeSeconds: 0,
      endTimeSeconds: 12,
    },
    {
      name: 'Linked Lists Explained',
      startTimeSeconds: 12,
      endTimeSeconds: 173,
    },
    {
      name: 'Real-World Analogy (Trains)',
      startTimeSeconds: 173,
      endTimeSeconds: 204,
    },
    {
      name: 'Singly vs. Doubly Linked Lists',
      startTimeSeconds: 204,
      endTimeSeconds: 324,
    },
    {
      name: 'Code Example of a Linked List',
      startTimeSeconds: 324,
      endTimeSeconds: 373,
    },
    {
      name: 'Linked Lists vs. Arrays',
      startTimeSeconds: 373,
      endTimeSeconds: 425,
    },
    {
      name: 'Big O',
      startTimeSeconds: 425,
      endTimeSeconds: 532,
    },
    {
      name: 'Pros and Cons',
      startTimeSeconds: 532,
      endTimeSeconds: 612,
    },
    {
      name: 'Linked Lists in Real Life',
      startTimeSeconds: 612,
      endTimeSeconds: 705,
    },
    {
      name: 'Linked Lists in Interviews',
      startTimeSeconds: 705,
      endTimeSeconds: 799,
    },
  ],
  changesSinceRecording: [
    'A blockchain links each block only to the block before it, not in both directions.',
  ],
};
