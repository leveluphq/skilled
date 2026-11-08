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
      endTimeSeconds: 47,
    },
    {
      name: 'Solution Breakdown',
      startTimeSeconds: 47,
      endTimeSeconds: 716,
    },
    {
      name: 'Solution Summary and Big O',
      startTimeSeconds: 716,
      endTimeSeconds: 794,
    },
    {
      name: 'Code Walkthrough',
      startTimeSeconds: 794,
      endTimeSeconds: 1152,
    },
  ],
};
