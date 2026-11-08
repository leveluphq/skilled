import { VideoDetails } from 'utils/constants/lesson';

export const video: VideoDetails = {
  segments: [
    {
      name: 'Introduction',
      startTimeSeconds: 0,
      endTimeSeconds: 7,
    },
    {
      name: 'Question Prompt',
      startTimeSeconds: 7,
      endTimeSeconds: 45,
    },
    {
      name: 'Constraints',
      startTimeSeconds: 45,
      endTimeSeconds: 84,
    },
    {
      name: 'Brute Force Solution Overview',
      startTimeSeconds: 84,
      endTimeSeconds: 114,
    },
    {
      name: 'Visualizing the Problem',
      startTimeSeconds: 114,
      endTimeSeconds: 328,
    },
    {
      name: 'Optimizing the Solution',
      startTimeSeconds: 328,
      endTimeSeconds: 618,
    },
    {
      name: 'Solution Summary and Big O',
      startTimeSeconds: 618,
      endTimeSeconds: 666,
    },
    {
      name: 'Code Walkthrough',
      startTimeSeconds: 666,
      endTimeSeconds: 837,
    },
  ],
  changesSinceRecording: [
    'The Python bonus solution now uses integer division (`//`), so it returns integers.',
  ],
};
