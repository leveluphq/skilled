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
      endTimeSeconds: 26,
    },
    {
      name: 'Solution Breakdown',
      startTimeSeconds: 26,
      endTimeSeconds: 314,
    },
    {
      name: 'Solution Summary and Big O',
      startTimeSeconds: 314,
      endTimeSeconds: 366,
    },
    {
      name: 'Code Walkthrough',
      startTimeSeconds: 366,
      endTimeSeconds: 666,
    },
  ],
};
