import { VideoDetails } from 'utils/constants/lesson';

export const video: VideoDetails = {
  segments: [
    {
      name: 'Introduction',
      startTimeSeconds: 0,
      endTimeSeconds: 9,
    },
    {
      name: 'DFS Explained',
      startTimeSeconds: 9,
      endTimeSeconds: 62,
    },
    {
      name: 'DFS in Trees',
      startTimeSeconds: 62,
      endTimeSeconds: 75,
    },
    {
      name: 'DFS Analogy',
      startTimeSeconds: 75,
      endTimeSeconds: 96,
    },
    {
      name: 'DFS Walkthrough',
      startTimeSeconds: 96,
      endTimeSeconds: 432,
    },
    {
      name: 'Pros and Cons',
      startTimeSeconds: 432,
      endTimeSeconds: 478,
    },
    {
      name: 'Summary of DFS Logic',
      startTimeSeconds: 478,
      endTimeSeconds: 548,
    },
    {
      name: 'Code Walkthrough',
      startTimeSeconds: 548,
      endTimeSeconds: 873,
    },
  ],
  changesSinceRecording: [
    'The iterative DFS now marks a node as visited when it is popped from the stack, not when it is pushed, so it always follows a path to its end before backtracking.',
  ],
};
