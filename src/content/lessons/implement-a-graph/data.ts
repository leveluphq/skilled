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
      endTimeSeconds: 70,
    },
    {
      name: 'Example',
      startTimeSeconds: 70,
      endTimeSeconds: 191,
    },
    {
      name: 'Code Walkthrough',
      startTimeSeconds: 191,
      endTimeSeconds: 443,
    },
  ],
};
