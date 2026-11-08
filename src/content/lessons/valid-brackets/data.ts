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
      endTimeSeconds: 33,
    },
    {
      name: 'Constraints',
      startTimeSeconds: 33,
      endTimeSeconds: 73,
    },
    {
      name: 'Example',
      startTimeSeconds: 73,
      endTimeSeconds: 133,
    },
    {
      name: 'Solution Breakdown',
      startTimeSeconds: 133,
      endTimeSeconds: 419,
    },
    {
      name: 'Solution Summary and Big O',
      startTimeSeconds: 419,
      endTimeSeconds: 470,
    },
    {
      name: 'Code Walkthrough',
      startTimeSeconds: 470,
      endTimeSeconds: 756,
    },
  ],
  changesSinceRecording: [
    'The Python solution now returns False for a closing bracket with nothing to match, like ")" or "())".',
  ],
};
