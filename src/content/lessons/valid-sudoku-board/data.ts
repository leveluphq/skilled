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
      endTimeSeconds: 50,
    },
    {
      name: 'Constraints',
      startTimeSeconds: 50,
      endTimeSeconds: 249,
    },
    {
      name: 'Examples',
      startTimeSeconds: 249,
      endTimeSeconds: 310,
    },
    {
      name: 'Solution Breakdown',
      startTimeSeconds: 310,
      endTimeSeconds: 780,
    },
    {
      name: 'Solution Summary and Big O',
      startTimeSeconds: 780,
      endTimeSeconds: 932,
    },
    {
      name: 'Code Walkthrough',
      startTimeSeconds: 932,
      endTimeSeconds: 1608,
    },
  ],
};
