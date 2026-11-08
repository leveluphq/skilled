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
      endTimeSeconds: 35,
    },
    {
      name: 'Constraints',
      startTimeSeconds: 35,
      endTimeSeconds: 68,
    },
    {
      name: 'Solution Breakdown',
      startTimeSeconds: 68,
      endTimeSeconds: 304,
    },
    {
      name: 'Solution Summary',
      startTimeSeconds: 304,
      endTimeSeconds: 347,
    },
    {
      name: 'Big O',
      startTimeSeconds: 347,
      endTimeSeconds: 420,
    },
    {
      name: 'Code Walkthrough',
      startTimeSeconds: 420,
      endTimeSeconds: 630,
    },
  ],
};
