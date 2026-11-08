import { VideoDetails } from 'utils/constants/lesson';

export const video: VideoDetails = {
  segments: [
    {
      name: 'Introduction',
      startTimeSeconds: 0,
      endTimeSeconds: 21,
    },
    {
      name: 'List of Topics for Interviews',
      startTimeSeconds: 21,
      endTimeSeconds: 65,
    },
    {
      name: '1. Sorting is O(n log n)',
      startTimeSeconds: 65,
      endTimeSeconds: 113,
    },
    {
      name: '2. Know your native sort',
      startTimeSeconds: 113,
      endTimeSeconds: 191,
    },
    {
      name: '3. Implications of sorted vs. unsorted',
      startTimeSeconds: 191,
      endTimeSeconds: 258,
    },
    {
      name: '4. Bucket sort special case O(n)',
      startTimeSeconds: 258,
      endTimeSeconds: 318,
    },
    {
      name: 'Overview of Popular Sorting Algorithms',
      startTimeSeconds: 318,
      endTimeSeconds: 360,
    },
    {
      name: 'Selection Sort',
      startTimeSeconds: 360,
      endTimeSeconds: 406,
    },
    {
      name: 'Bubble Sort',
      startTimeSeconds: 406,
      endTimeSeconds: 445,
    },
    {
      name: 'Quick Sort',
      startTimeSeconds: 445,
      endTimeSeconds: 483,
    },
    {
      name: 'Merge Sort',
      startTimeSeconds: 483,
      endTimeSeconds: 518,
    },
    {
      name: 'Additional Resources',
      startTimeSeconds: 518,
      endTimeSeconds: 559,
    },
  ],
  changesSinceRecording: [
    'Merge sort uses O(n) extra space and quick sort O(log n) on average, not O(n log n).',
    'A JavaScript sort comparator must return a number (like `a - b`), not a boolean.',
  ],
};
