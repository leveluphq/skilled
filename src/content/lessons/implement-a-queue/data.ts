import { VideoDetails } from 'utils/constants/lesson';

export const video: VideoDetails = {
  segments: [
    {
      name: 'Introduction',
      startTimeSeconds: 0,
      endTimeSeconds: 8,
    },
    {
      name: 'Queue Constraints',
      startTimeSeconds: 8,
      endTimeSeconds: 51,
    },
    {
      name: 'Example',
      startTimeSeconds: 51,
      endTimeSeconds: 176,
    },
    {
      name: 'Code Walkthrough',
      startTimeSeconds: 176,
      endTimeSeconds: 587,
    },
  ],
  changesSinceRecording: [
    'A queue can be built on an array (for example a circular buffer). A plain dynamic array is just O(n) at the front, which is why we use a linked list.',
  ],
};
