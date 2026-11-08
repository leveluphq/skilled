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
      endTimeSeconds: 28,
    },
    {
      name: 'Constraints',
      startTimeSeconds: 28,
      endTimeSeconds: 57,
    },
    {
      name: 'Solution Breakdown',
      startTimeSeconds: 57,
      endTimeSeconds: 440,
    },
    {
      name: 'Solution Summary and Big O',
      startTimeSeconds: 440,
      endTimeSeconds: 513,
    },
    {
      name: 'Code Walkthrough',
      startTimeSeconds: 513,
      endTimeSeconds: 671,
    },
  ],
  changesSinceRecording: [
    'The time and space complexity is O(d), where d is the number of digits, not O(1): Python integers have no maximum size.',
    'The Python solution now uses `number // 10`, so it stays exact for very large numbers.',
  ],
};
