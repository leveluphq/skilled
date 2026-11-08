import { videoStart, videoClips } from '../videoChapters';

it.each([undefined, [], ['10', '20'], '', '-1', '1.5', 'Infinity', '1e2', '600', '999999999999'])(
  'ignores invalid or out-of-range timestamp %p',
  (value) => {
    expect(videoStart(value as any, 600)).toBe(0);
  },
);
it.each([
  ['0', 0],
  ['1', 1],
  ['059', 59],
  ['599', 599],
])('accepts a bounded whole-second timestamp %s', (value, expected) => {
  expect(videoStart(String(value), 600)).toBe(expected);
});
it('preserves reviewed chapter boundaries and produces same-path deep links', () => {
  const clips = videoClips({
    slug: 'example',
    chapters: [
      { name: 'Setup', start: 0, end: 14 },
      { name: 'Trace', start: 14, end: 60 },
    ],
  });
  expect(clips.map((clip) => [clip.startOffset, clip.endOffset])).toEqual([
    [0, 14],
    [14, 60],
  ]);
  expect(clips[1].url).toMatch(/\/watch\/example\?t=14$/);
});
