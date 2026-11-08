import { VideoDetails } from 'utils/constants/lesson';

export const video: VideoDetails = {
  segments: [
    {
      name: 'Introduction',
      startTimeSeconds: 0,
      endTimeSeconds: 8,
    },
    {
      name: 'Stack Constraints',
      startTimeSeconds: 8,
      endTimeSeconds: 53,
    },
    {
      name: 'Example',
      startTimeSeconds: 53,
      endTimeSeconds: 161,
    },
    {
      name: 'Code Walkthrough',
      startTimeSeconds: 161,
      endTimeSeconds: 375,
    },
  ],
  changesSinceRecording: [
    '`pop()` returns null only when the stack is empty. Popping the last item returns that item.',
  ],
};
