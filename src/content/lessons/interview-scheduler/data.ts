import { VideoDetails } from 'utils/constants/lesson';

export const video: VideoDetails = {
  segments: [
    {
      name: 'Introduction',
      startTimeSeconds: 0,
      endTimeSeconds: 12,
    },
    {
      name: 'Question Prompt',
      startTimeSeconds: 12,
      endTimeSeconds: 190,
    },
    {
      name: 'Solution Breakdown',
      startTimeSeconds: 190,
      endTimeSeconds: 924,
    },
    {
      name: 'Solution Summary and Big O',
      startTimeSeconds: 924,
      endTimeSeconds: 1011,
    },
    {
      name: 'Code Walkthrough',
      startTimeSeconds: 1011,
      endTimeSeconds: 1352,
    },
  ],
};
