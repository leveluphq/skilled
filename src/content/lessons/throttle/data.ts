import { VideoDetails } from 'utils/constants/lesson';

export const video: VideoDetails = {
  segments: [
    {
      name: 'Introduction',
      startTimeSeconds: 0,
      endTimeSeconds: 9,
    },
    {
      name: 'Overview of a Throttle',
      startTimeSeconds: 9,
      endTimeSeconds: 63,
    },
    {
      name: 'Question Prompt',
      startTimeSeconds: 63,
      endTimeSeconds: 122,
    },
    {
      name: 'Solution Breakdown',
      startTimeSeconds: 122,
      endTimeSeconds: 506,
    },
    {
      name: 'Code Walkthrough',
      startTimeSeconds: 506,
      endTimeSeconds: 755,
    },
  ],
  changesSinceRecording: [
    'The solution now tracks a waiting call with a `hasStoredEvent` flag, so the trailing call still runs when the handler gets no argument or a falsy one.',
  ],
};
