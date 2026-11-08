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
      endTimeSeconds: 49,
    },
    {
      name: 'Solution Breakdown',
      startTimeSeconds: 49,
      endTimeSeconds: 269,
    },
    {
      name: 'Solution Summary and Big O',
      startTimeSeconds: 269,
      endTimeSeconds: 333,
    },
    {
      name: 'Code Walkthrough',
      startTimeSeconds: 333,
      endTimeSeconds: 502,
    },
  ],
};
