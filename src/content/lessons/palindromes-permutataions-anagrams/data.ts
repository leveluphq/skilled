import { VideoDetails } from 'utils/constants/lesson';

export const video: VideoDetails = {
  segments: [
    {
      name: 'Introduction',
      startTimeSeconds: 0,
      endTimeSeconds: 43,
    },
    {
      name: 'Palindromes',
      startTimeSeconds: 43,
      endTimeSeconds: 113,
    },
    {
      name: 'Permutations',
      startTimeSeconds: 113,
      endTimeSeconds: 139,
    },
    {
      name: 'Anagrams',
      startTimeSeconds: 139,
      endTimeSeconds: 188,
    },
    {
      name: 'Recap',
      startTimeSeconds: 188,
      endTimeSeconds: 230,
    },
  ],
  changesSinceRecording: [
    'The Python `is_palindrome` now removes underscores too, matching the JavaScript version.',
  ],
};
