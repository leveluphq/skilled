import { VideoDetails } from 'utils/constants/lesson';

export const video: VideoDetails = {
  segments: [
    {
      name: 'Introduction',
      startTimeSeconds: 0,
      endTimeSeconds: 10,
    },
    {
      name: 'Question Prompt',
      startTimeSeconds: 10,
      endTimeSeconds: 19,
    },
    {
      name: 'Solution Breakdown',
      startTimeSeconds: 19,
      endTimeSeconds: 1255,
    },
    {
      name: 'Solution Summary and Big O',
      startTimeSeconds: 1255,
      endTimeSeconds: 1396,
    },
    {
      name: 'Code Walkthrough',
      startTimeSeconds: 1396,
      endTimeSeconds: 1579,
    },
  ],
  changesSinceRecording: [
    'The four-house example said [5, 10, 20, 50] gives 55, but the best is 60, so the example now uses [10, 5, 20, 50].',
  ],
};
