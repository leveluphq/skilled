import { VideoDetails } from 'utils/constants/lesson';

export const video: VideoDetails = {
  segments: [
    {
      name: 'Introduction',
      startTimeSeconds: 0,
      endTimeSeconds: 9,
    },
    {
      name: 'Question Prompt',
      startTimeSeconds: 9,
      endTimeSeconds: 86,
    },
    {
      name: 'Brute Force Solution Breakdown',
      startTimeSeconds: 86,
      endTimeSeconds: 121,
    },
    {
      name: 'Optimized Solution Breakdown',
      startTimeSeconds: 121,
      endTimeSeconds: 443,
    },
    {
      name: 'Solution Summary and Big O',
      startTimeSeconds: 443,
      endTimeSeconds: 513,
    },
    {
      name: 'Code Walkthrough',
      startTimeSeconds: 513,
      endTimeSeconds: 835,
    },
  ],
};
