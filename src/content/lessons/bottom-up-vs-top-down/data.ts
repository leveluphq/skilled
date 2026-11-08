import { VideoDetails } from 'utils/constants/lesson';

export const video: VideoDetails = {
  segments: [
    {
      name: 'Introduction',
      startTimeSeconds: 0,
      endTimeSeconds: 21,
    },
    {
      name: 'Bottom-Up vs. Top-Down',
      startTimeSeconds: 21,
      endTimeSeconds: 82,
    },
    {
      name: 'Bottom-Up Explanation',
      startTimeSeconds: 82,
      endTimeSeconds: 134,
    },
    {
      name: 'Top-Down Explanation',
      startTimeSeconds: 134,
      endTimeSeconds: 248,
    },
    {
      name: 'In Interviews',
      startTimeSeconds: 248,
      endTimeSeconds: 286,
    },
  ],
  changesSinceRecording: [
    'The bottom-up `fibonacci` now returns n when n < 2, so `fibonacci(0)` is 0, the same as the top-down version.',
    'Tail-call optimization does not make most top-down solutions constant space.',
  ],
};
