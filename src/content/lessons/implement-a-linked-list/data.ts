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
      endTimeSeconds: 55,
    },
    {
      name: 'Example',
      startTimeSeconds: 55,
      endTimeSeconds: 267,
    },
    {
      name: 'Code Walkthrough',
      startTimeSeconds: 267,
      endTimeSeconds: 722,
    },
  ],
  changesSinceRecording: [
    'The doubly linked list now starts `length` at 1, since the constructor already creates the first node.',
  ],
};
