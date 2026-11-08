import { VideoDetails } from 'utils/constants/lesson';

export const video: VideoDetails = {
  segments: [
    {
      name: 'Introduction',
      startTimeSeconds: 0,
      endTimeSeconds: 9,
    },
    {
      name: 'Constraints',
      startTimeSeconds: 9,
      endTimeSeconds: 55,
    },
    {
      name: 'Explanation',
      startTimeSeconds: 55,
      endTimeSeconds: 266,
    },
    {
      name: 'Code Walkthrough',
      startTimeSeconds: 266,
      endTimeSeconds: 596,
    },
  ],
  changesSinceRecording: [
    'The Python `insert` now stops shifting at the insertion index, so inserting at index 0 works.',
  ],
};
