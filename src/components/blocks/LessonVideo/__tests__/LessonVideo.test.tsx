/**
 * LessonVideo plays a lesson's solution video with its table of contents. These
 * tests cover the note listing corrections made after the video was recorded,
 * which should appear only alongside a video the learner can actually watch.
 */
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { themeMap, ThemeNames } from 'style/theme';
import LessonVideo from '../LessonVideo';
import { Props } from '../props';
import videos from 'content/videos/catalog.json';

// The real player loads YouTube's iframe API, which has no place in jsdom.
jest.mock('react-player', () => {
  const React = require('react');
  return React.forwardRef(() => <div data-testid="player" />);
});

const SEGMENTS = [{ name: 'Code Walkthrough', startTimeSeconds: 0, endTimeSeconds: 60 }];
const CHANGES = [
  'The solution now also fires the trailing call when the handler gets no argument.',
  'The complexity is O(number of digits), not O(1).',
];

const renderVideo = (props: Partial<Props> = {}) =>
  render(
    <ThemeProvider theme={themeMap[ThemeNames.Dark]}>
      <LessonVideo
        url="https://youtu.be/video"
        segments={SEGMENTS}
        uniqueKey="lesson-1"
        {...props}
      />
    </ThemeProvider>,
  );

const changesNote = () =>
  screen.queryByRole('complementary', { name: 'The written lesson is newer than this video' });

describe('LessonVideo changes since recording', () => {
  it('offers every published public recording when private playback is absent', () => {
    for (const video of videos) {
      const { container, unmount } = renderVideo({
        url: null,
        slug: video.slug,
        segments: video.chapters.map((chapter) => ({
          name: chapter.name,
          startTimeSeconds: chapter.start,
          endTimeSeconds: chapter.end,
        })),
      });
      expect(screen.getByRole('link', { name: 'Watch the free lesson video' })).toHaveAttribute(
        'href',
        `/watch/${video.slug}`,
      );
      expect(screen.queryByText('Log in to watch videos')).toBeNull();
      expect(
        Array.from(container.querySelectorAll('a[href*="?t="]')).map((link) =>
          link.getAttribute('href'),
        ),
      ).toEqual(video.chapters.map((chapter) => `/watch/${video.slug}?t=${chapter.start}`));
      unmount();
    }
  });

  it('keeps explicit empty messages and never invents a public video for an unpublished slug', () => {
    const { unmount } = renderVideo({
      url: null,
      slug: 'debounce',
      emptyMessage: 'Custom video message',
    });
    expect(screen.getByText('Custom video message')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Watch the free lesson video' })).toBeNull();
    unmount();
    renderVideo({ url: null, slug: 'knapsack' });
    expect(screen.queryByRole('link', { name: 'Watch the free lesson video' })).toBeNull();
    expect(screen.getByRole('button', { name: /Code Walkthrough/ })).toBeDisabled();
  });

  it('lists each change under the video', () => {
    renderVideo({ changesSinceRecording: CHANGES });

    const note = changesNote();
    expect(note).not.toBeNull();
    // Says which to trust before listing what changed
    expect(note).toHaveTextContent('Where the video differs, follow the written lesson');
    expect(Array.from(note!.querySelectorAll('li')).map((item) => item.textContent)).toEqual(
      CHANGES,
    );
  });

  it('shows text in backticks as code', () => {
    renderVideo({
      changesSinceRecording: ['The solution now uses `number // 10`, so it stays exact.'],
    });

    const item = changesNote()!.querySelector('li')!;
    expect(item.textContent).toBe('The solution now uses number // 10, so it stays exact.');
    expect(item.querySelector('code')!.textContent).toBe('number // 10');
  });

  it('shows nothing when the lesson has no changes', () => {
    renderVideo();
    expect(changesNote()).toBeNull();

    renderVideo({ changesSinceRecording: [] });
    expect(changesNote()).toBeNull();
  });

  it('waits for the video to load, and stays hidden when there is no video to watch', () => {
    const { unmount } = renderVideo({ changesSinceRecording: CHANGES, isLoading: true });
    expect(changesNote()).toBeNull();
    unmount();

    renderVideo({ changesSinceRecording: CHANGES, url: null });
    expect(changesNote()).toBeNull();
    expect(screen.queryByTestId('player')).toBeNull();
  });

  it('scrolls with the table of contents rather than staying under the video', () => {
    renderVideo({ changesSinceRecording: CHANGES });

    // The table of contents is the part of the video panel that scrolls
    const tableOfContents = screen.getByText('Table of Contents').parentElement!;
    expect(tableOfContents).toContainElement(changesNote());
    expect(tableOfContents.firstElementChild).toBe(changesNote());
  });

  it('still shows the changes, right after the video, when the table of contents is hidden', () => {
    renderVideo({ changesSinceRecording: CHANGES, hideTableOfContents: true });

    expect(changesNote()).not.toBeNull();
    expect(screen.queryByText('Table of Contents')).toBeNull();
    expect(changesNote()!.previousElementSibling).toContainElement(screen.getByTestId('player'));
  });
});
