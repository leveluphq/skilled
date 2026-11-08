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
      endTimeSeconds: 55,
    },
    {
      name: 'Solution Breakdown',
      startTimeSeconds: 55,
      endTimeSeconds: 480,
    },
    {
      name: 'Solution Summary and Big O',
      startTimeSeconds: 480,
      endTimeSeconds: 541,
    },
    {
      name: 'Code Walkthrough',
      startTimeSeconds: 541,
      endTimeSeconds: 685,
    },
  ],
  changesSinceRecording: [
    'We can eliminate a column because the target is larger than every item above it in that column.',
  ],
};
