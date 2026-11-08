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
      endTimeSeconds: 63,
    },
    {
      name: 'Constraints',
      startTimeSeconds: 63,
      endTimeSeconds: 105,
    },
    {
      name: 'Solution Breakdown',
      startTimeSeconds: 105,
      endTimeSeconds: 497,
    },
    {
      name: 'Solution Summary and Big O',
      startTimeSeconds: 497,
      endTimeSeconds: 557,
    },
    {
      name: 'Code Walkthrough',
      startTimeSeconds: 557,
      endTimeSeconds: 761,
    },
  ],
  changesSinceRecording: ['The node class is now called `ListNode` (the video calls it `Node`).'],
};
