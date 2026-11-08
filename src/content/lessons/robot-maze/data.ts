import { VideoDetails } from 'utils/constants/lesson';

export const video: VideoDetails = {
  segments: [
    {
      name: 'Introduction',
      startTimeSeconds: 0,
      endTimeSeconds: 10,
    },
    {
      name: 'Question Prompt',
      startTimeSeconds: 10,
      endTimeSeconds: 88,
    },
    {
      name: 'Solution Breakdown',
      startTimeSeconds: 88,
      endTimeSeconds: 988,
    },
    {
      name: 'Solution Summary and Big O',
      startTimeSeconds: 988,
      endTimeSeconds: 1079,
    },
    {
      name: 'Code Walkthrough',
      startTimeSeconds: 1079,
      endTimeSeconds: 1557,
    },
  ],
  changesSinceRecording: [
    "The brute-force recursion uses O(r + c) space for its call stack, not O(2^(r + c)). The memoized solution's O(r × c) space comes from its memo.",
  ],
};
