import { VideoDetails } from 'utils/constants/lesson';

export const video: VideoDetails = {
  segments: [
    {
      name: 'Introduction',
      startTimeSeconds: 0,
      endTimeSeconds: 15,
    },
    {
      name: 'Definition',
      startTimeSeconds: 15,
      endTimeSeconds: 67,
    },
    {
      name: 'Comparing Iterative and Recursive Algorithms',
      startTimeSeconds: 67,
      endTimeSeconds: 466,
    },
    {
      name: 'Stack Overflows',
      startTimeSeconds: 466,
      endTimeSeconds: 533,
    },
    {
      name: 'Code Walkthrough',
      startTimeSeconds: 533,
      endTimeSeconds: 870,
    },
  ],
  changesSinceRecording: [
    'The iterative flatten now puts nested items at the front of its queue, so it keeps the original order: [1, [2, 3], 4] becomes [1, 2, 3, 4].',
    "Tail-call optimization only applies to a call in tail position. Python doesn't implement it, and among JavaScript engines only Safari's does.",
  ],
};
