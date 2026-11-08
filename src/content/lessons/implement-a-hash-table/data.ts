import { VideoDetails } from 'utils/constants/lesson';

export const video: VideoDetails = {
  segments: [
    {
      name: 'Introduction',
      startTimeSeconds: 0,
      endTimeSeconds: 10,
    },
    {
      name: 'Hash Table Constraints',
      startTimeSeconds: 10,
      endTimeSeconds: 91,
    },
    {
      name: 'Code Walkthrough',
      startTimeSeconds: 91,
      endTimeSeconds: 620,
    },
  ],
  changesSinceRecording: [
    '`remove()` now deletes the key-value pair from its bucket instead of setting the value to `undefined`, and `insert()` looks for an existing key by scanning the bucket, so a removed key can be added and read again.',
  ],
};
