import { VideoDetails } from 'utils/constants/lesson';

export const video: VideoDetails = {
  segments: [
    {
      name: 'Introduction',
      startTimeSeconds: 0,
      endTimeSeconds: 63,
    },
    {
      name: 'Linked List Review',
      startTimeSeconds: 63,
      endTimeSeconds: 124,
    },
    {
      name: 'Solution Breakdown',
      startTimeSeconds: 124,
      endTimeSeconds: 244,
    },
    {
      name: 'Code Walkthrough',
      startTimeSeconds: 244,
      endTimeSeconds: 396,
    },
  ],
  changesSinceRecording: ['The node class is now called `ListNode` (the video calls it `Node`).'],
};
