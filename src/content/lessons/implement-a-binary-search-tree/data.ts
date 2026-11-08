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
      endTimeSeconds: 39,
    },
    {
      name: 'Example',
      startTimeSeconds: 39,
      endTimeSeconds: 82,
    },
    {
      name: 'Solution Breakdown',
      startTimeSeconds: 82,
      endTimeSeconds: 143,
    },
    {
      name: 'Code Walkthrough',
      startTimeSeconds: 143,
      endTimeSeconds: 501,
    },
  ],
};
