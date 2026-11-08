import { VideoDetails } from 'utils/constants/lesson';

export const video: VideoDetails = {
  segments: [
    {
      name: 'Introduction (long but it includes memes)',
      startTimeSeconds: 0,
      endTimeSeconds: 137,
    },
    {
      name: 'How Interview Candidates are Graded (Why Big O)',
      startTimeSeconds: 137,
      endTimeSeconds: 346,
    },
    {
      name: 'Intuition for How and Why Big O Best Measures Algorithms',
      startTimeSeconds: 346,
      endTimeSeconds: 862,
    },
    {
      name: 'Big O Terms Defined',
      startTimeSeconds: 862,
      endTimeSeconds: 944,
    },
    {
      name: 'Why We Care About Large Input',
      startTimeSeconds: 944,
      endTimeSeconds: 1080,
    },
    {
      name: 'Data Structures, Algorithms, and Big O',
      startTimeSeconds: 1080,
      endTimeSeconds: 1205,
    },
    {
      name: 'Real-World Big O Example',
      startTimeSeconds: 1205,
      endTimeSeconds: 1275,
    },
    {
      name: '4 Steps for Calculating Big O',
      startTimeSeconds: 1275,
      endTimeSeconds: 1404,
    },
    {
      name: 'Step 1: Worst Case',
      startTimeSeconds: 1404,
      endTimeSeconds: 1555,
    },
    {
      name: 'Step 2: Drop Constants',
      startTimeSeconds: 1555,
      endTimeSeconds: 1686,
    },
    {
      name: 'Step 3: Drop Less Significant Terms',
      startTimeSeconds: 1686,
      endTimeSeconds: 1797,
    },
    {
      name: 'Step 4: Account for All Input',
      startTimeSeconds: 1797,
      endTimeSeconds: 1878,
    },
    {
      name: 'O(n)',
      startTimeSeconds: 1878,
      endTimeSeconds: 1942,
    },
    {
      name: 'O(n^2)',
      startTimeSeconds: 1942,
      endTimeSeconds: 2012,
    },
    {
      name: 'O(1)',
      startTimeSeconds: 2012,
      endTimeSeconds: 2084,
    },
    {
      name: 'O(log n)',
      startTimeSeconds: 2084,
      endTimeSeconds: 2174,
    },
    {
      name: 'O(n log n)',
      startTimeSeconds: 2174,
      endTimeSeconds: 2213,
    },
    {
      name: 'O(2^n) and O(n!)',
      startTimeSeconds: 2213,
      endTimeSeconds: 2246,
    },
    {
      name: 'Space Complexity',
      startTimeSeconds: 2246,
      endTimeSeconds: 2303,
    },
  ],
  changesSinceRecording: [
    'The small values in the time comparison table are microseconds (they were labeled ns), and a few miscalculated cells were corrected.',
    'The hidden quadratic example now slices the input array, which is what makes it O(n²).',
  ],
};
