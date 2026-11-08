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
      endTimeSeconds: 30,
    },
    {
      name: 'Example',
      startTimeSeconds: 30,
      endTimeSeconds: 147,
    },
    {
      name: 'Solution Breakdown',
      startTimeSeconds: 147,
      endTimeSeconds: 678,
    },
    {
      name: 'Solution Summary and Big O',
      startTimeSeconds: 678,
      endTimeSeconds: 723,
    },
    {
      name: 'Code Walkthrough',
      startTimeSeconds: 723,
      endTimeSeconds: 1007,
    },
  ],
  changesSinceRecording: [
    'The perimeter walk now goes back up starting one row higher, so the bottom-left corner is not visited twice.',
  ],
};
