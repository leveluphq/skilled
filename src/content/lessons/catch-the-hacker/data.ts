import { VideoDetails } from 'utils/constants/lesson';

export const video: VideoDetails = {
  segments: [
    {
      name: 'Introduction',
      startTimeSeconds: 0,
      endTimeSeconds: 8,
    },
    {
      name: 'Question Prompt',
      startTimeSeconds: 8,
      endTimeSeconds: 75,
    },
    {
      name: 'Constraints',
      startTimeSeconds: 75,
      endTimeSeconds: 107,
    },
    {
      name: 'Brute Force O(n^2) Solution Breakdown',
      startTimeSeconds: 107,
      endTimeSeconds: 199,
    },
    {
      name: 'Optimizing Brute Force',
      startTimeSeconds: 199,
      endTimeSeconds: 240,
    },
    {
      name: 'Optimized O(n) Solution Breakdown',
      startTimeSeconds: 240,
      endTimeSeconds: 316,
    },
    {
      name: 'Code Walkthrough',
      startTimeSeconds: 316,
      endTimeSeconds: 471,
    },
  ],
};
