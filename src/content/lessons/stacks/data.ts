import { VideoDetails } from 'utils/constants/lesson';

export const video: VideoDetails = {
  segments: [
    {
      name: 'Introduction',
      startTimeSeconds: 0,
      endTimeSeconds: 8,
    },
    {
      name: 'Stacks Explained',
      startTimeSeconds: 8,
      endTimeSeconds: 181,
    },
    {
      name: 'Big O',
      startTimeSeconds: 181,
      endTimeSeconds: 222,
    },
    {
      name: 'Pros and Cons',
      startTimeSeconds: 222,
      endTimeSeconds: 288,
    },
    {
      name: 'The Call Stack and Stack Overflows',
      startTimeSeconds: 288,
      endTimeSeconds: 412,
    },
    {
      name: 'Stacks in the Real World',
      startTimeSeconds: 412,
      endTimeSeconds: 477,
    },
    {
      name: 'Stack in Interviews',
      startTimeSeconds: 477,
      endTimeSeconds: 519,
    },
  ],
  changesSinceRecording: [
    '`calculateTax` now returns only the tax (`price * 0.1`), so the total is 1.1 times the price.',
    'A stack overflow means the call stack has outgrown the memory set aside for it, not that the computer is out of memory.',
  ],
};
