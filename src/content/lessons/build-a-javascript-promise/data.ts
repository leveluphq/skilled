import { VideoDetails } from 'utils/constants/lesson';

export const video: VideoDetails = {
  segments: [
    {
      name: 'Introduction',
      startTimeSeconds: 0,
      endTimeSeconds: 79,
    },
    {
      name: 'Question Prompt',
      startTimeSeconds: 79,
      endTimeSeconds: 117,
    },
    {
      name: 'Solution Breakdown',
      startTimeSeconds: 117,
      endTimeSeconds: 928,
    },
    {
      name: 'Code Walkthrough',
      startTimeSeconds: 928,
      endTimeSeconds: 1451,
    },
  ],
  changesSinceRecording: [
    '`PromiseSimple` now runs its `.then()` and `.catch()` handlers in a `setTimeout`, so they also run when the promise resolves or rejects right away.',
  ],
};
