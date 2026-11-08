import { VideoDetails } from 'utils/constants/lesson';

export const video: VideoDetails = {
  segments: [
    {
      name: 'Introduction',
      startTimeSeconds: 0,
      endTimeSeconds: 22,
    },
    {
      name: 'Question Prompt',
      startTimeSeconds: 22,
      endTimeSeconds: 46,
    },
    {
      name: 'Constraints',
      startTimeSeconds: 46,
      endTimeSeconds: 90,
    },
    {
      name: 'Solution Breakdown',
      startTimeSeconds: 90,
      endTimeSeconds: 797,
    },
    {
      name: 'Solution Summary and Big O',
      startTimeSeconds: 797,
      endTimeSeconds: 882,
    },
    {
      name: 'Code Walkthrough',
      startTimeSeconds: 882,
      endTimeSeconds: 1181,
    },
  ],
  changesSinceRecording: [
    'The time complexity is about O(n² · n!), not O(n · n!), because strings of up to n characters are rebuilt at each of the n levels of recursion.',
  ],
};
