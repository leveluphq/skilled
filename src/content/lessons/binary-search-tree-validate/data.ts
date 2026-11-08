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
      endTimeSeconds: 40,
    },
    {
      name: 'Constraints',
      startTimeSeconds: 40,
      endTimeSeconds: 72,
    },
    {
      name: 'Solution Breakdown',
      startTimeSeconds: 72,
      endTimeSeconds: 459,
    },
    {
      name: 'Solution Summary and Big O',
      startTimeSeconds: 459,
      endTimeSeconds: 524,
    },
    {
      name: 'Alternate Solution (In-Order Traversal)',
      startTimeSeconds: 524,
      endTimeSeconds: 632,
    },
    {
      name: 'Code Walkthrough',
      startTimeSeconds: 632,
      endTimeSeconds: 919,
    },
  ],
};
