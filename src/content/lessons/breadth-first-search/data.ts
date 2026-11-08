import { VideoDetails } from 'utils/constants/lesson';

export const video: VideoDetails = {
  segments: [
    {
      name: 'Introduction',
      startTimeSeconds: 0,
      endTimeSeconds: 9,
    },
    {
      name: 'BFS Explained',
      startTimeSeconds: 10,
      endTimeSeconds: 57,
    },
    {
      name: 'BFS in Trees',
      startTimeSeconds: 57,
      endTimeSeconds: 73,
    },
    {
      name: 'BFS Walkthrough',
      startTimeSeconds: 73,
      endTimeSeconds: 556,
    },
    {
      name: 'Pros and Cons',
      startTimeSeconds: 556,
      endTimeSeconds: 590,
    },
    {
      name: 'Summary of DFS Logic',
      startTimeSeconds: 590,
      endTimeSeconds: 640,
    },
    {
      name: 'Code Walkthrough',
      startTimeSeconds: 640,
      endTimeSeconds: 980,
    },
  ],
  changesSinceRecording: [
    'The Python BFS now tracks visited nodes in a set, so checking whether a node was visited is O(1).',
  ],
};
