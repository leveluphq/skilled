import { VideoDetails } from 'utils/constants/lesson';

export const video: VideoDetails = {
  segments: [
    {
      name: 'Introduction',
      startTimeSeconds: 0,
      endTimeSeconds: 25,
    },
    {
      name: 'Arrays Overview',
      startTimeSeconds: 25,
      endTimeSeconds: 111,
    },
    {
      name: 'Fast Operations (push, pop, index access)',
      startTimeSeconds: 111,
      endTimeSeconds: 203,
    },
    {
      name: 'Operations That Move or Search Elements',
      startTimeSeconds: 203,
      endTimeSeconds: 293,
    },
    {
      name: 'Big O',
      startTimeSeconds: 293,
      endTimeSeconds: 355,
    },
    {
      name: 'Pros and Cons',
      startTimeSeconds: 355,
      endTimeSeconds: 443,
    },
    {
      name: 'Static vs. Dynamic Arrays',
      startTimeSeconds: 443,
      endTimeSeconds: 589,
    },
    {
      name: 'Amortized Time (advanced)',
      startTimeSeconds: 589,
      endTimeSeconds: 671,
    },
  ],
  changesSinceRecording: [
    'A Java `int` takes 4 bytes on any operating system, so `new int[20]` needs 80 bytes.',
  ],
};
