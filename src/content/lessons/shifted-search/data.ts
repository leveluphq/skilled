import { VideoDetails } from 'utils/constants/lesson';

export const video: VideoDetails = {
  segments: [
    {
      name: 'Introduction',
      startTimeSeconds: 0,
      endTimeSeconds: 17,
    },
    {
      name: 'Question Prompt',
      startTimeSeconds: 17,
      endTimeSeconds: 88,
    },
    {
      name: 'Solution Breakdown',
      startTimeSeconds: 88,
      endTimeSeconds: 535,
    },
    {
      name: 'Solution Summary and Big O',
      startTimeSeconds: 535,
      endTimeSeconds: 587,
    },
    {
      name: 'Code Walkthrough',
      startTimeSeconds: 587,
      endTimeSeconds: 947,
    },
  ],
  changesSinceRecording: [
    "To pick a half, we check whether the target (not the midpoint) falls within the sorted half's range.",
  ],
};
