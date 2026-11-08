import { VideoDetails } from 'utils/constants/lesson';

export const video: VideoDetails = {
  segments: [
    {
      name: 'Introduction',
      startTimeSeconds: 0,
      endTimeSeconds: 10,
    },
    {
      name: 'Binary Search Trees Explained',
      startTimeSeconds: 12,
      endTimeSeconds: 140,
    },
    {
      name: 'BST Example',
      startTimeSeconds: 140,
      endTimeSeconds: 229,
    },
    {
      name: 'BST Benefits (O(log n) Time)',
      startTimeSeconds: 229,
      endTimeSeconds: 300,
    },
    {
      name: 'Unbalanced vs. Balanced Trees',
      startTimeSeconds: 300,
      endTimeSeconds: 463,
    },
    {
      name: 'Big O + Pros and Cons',
      startTimeSeconds: 463,
      endTimeSeconds: 589,
    },
    {
      name: 'Enforcing Balanced Trees',
      startTimeSeconds: 589,
      endTimeSeconds: 693,
    },
    {
      name: 'Bonus: AVL Trees',
      startTimeSeconds: 693,
      endTimeSeconds: 765,
    },
    {
      name: 'Bonus: Red-Black Trees',
      startTimeSeconds: 765,
      endTimeSeconds: 815,
    },
  ],
  changesSinceRecording: [
    'The smallest and largest values are at the left-most and right-most nodes, which are not necessarily leaves.',
  ],
};
