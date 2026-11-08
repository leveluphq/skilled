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
      endTimeSeconds: 120,
    },
    {
      name: 'Solution Breakdown',
      startTimeSeconds: 120,
      endTimeSeconds: 827,
    },
    {
      name: 'Solution Summary and Big O',
      startTimeSeconds: 827,
      endTimeSeconds: 912,
    },
    {
      name: 'Code Walkthrough',
      startTimeSeconds: 912,
      endTimeSeconds: 1177,
    },
  ],
  changesSinceRecording: [
    'The solution now returns 0 for any negative board length before building its memo, so lengths below -1 no longer crash.',
  ],
};
