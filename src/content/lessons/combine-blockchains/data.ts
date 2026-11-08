import { VideoDetails } from 'utils/constants/lesson';

export const video: VideoDetails = {
  segments: [
    {
      name: 'Introduction',
      startTimeSeconds: 0,
      endTimeSeconds: 8,
    },
    {
      name: 'Question Prompt',
      startTimeSeconds: 8,
      endTimeSeconds: 40,
    },
    {
      name: 'Solution Breakdown',
      startTimeSeconds: 40,
      endTimeSeconds: 331,
    },
    {
      name: 'Solution Summary and Big O',
      startTimeSeconds: 331,
      endTimeSeconds: 389,
    },
    {
      name: 'Code Walkthrough',
      startTimeSeconds: 389,
      endTimeSeconds: 722,
    },
  ],
  changesSinceRecording: [
    'A blockchain is a singly linked list where each block points back to the block before it, not a doubly linked list.',
    "The node class is now `ListNode`, and each block's timestamp is in its `data` field (the video uses `Node` and `timestamp`).",
  ],
};
