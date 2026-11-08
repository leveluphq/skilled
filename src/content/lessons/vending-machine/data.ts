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
      endTimeSeconds: 82,
    },
    {
      name: 'Solution Breakdown',
      startTimeSeconds: 82,
      endTimeSeconds: 2158,
    },
    {
      name: 'Solution Summary and Big O',
      startTimeSeconds: 2158,
      endTimeSeconds: 2230,
    },
    {
      name: 'Code Walkthrough',
      startTimeSeconds: 2230,
      endTimeSeconds: 2611,
    },
  ],
};
