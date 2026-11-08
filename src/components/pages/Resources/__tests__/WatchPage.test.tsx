import * as React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import WatchPage from '../WatchPage';
import videos from 'content/videos/catalog.json';
import { absoluteUrl } from 'utils/shared/site';
import { getLessonWalkthroughs, walkthroughPath } from 'content/lesson-walkthroughs';

jest.mock('components/blocks/Head', () => () => null);
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children }: any) => React.cloneElement(children, { href }),
}));
afterEach(cleanup);
const mockRouter = {
  isReady: true,
  query: {} as { t?: string | string[] },
  push: jest.fn().mockResolvedValue(true),
};
jest.mock('next/router', () => ({ useRouter: () => mockRouter }));
afterEach(() => {
  mockRouter.query = {};
  mockRouter.push.mockClear();
});

it('shows each public player immediately with verified VideoObject metadata and current lesson links', () => {
  for (const video of videos) {
    const { container, unmount } = render(
      <WatchPage slug={video.slug}>
        <p>Reading notes</p>
      </WatchPage>,
    );
    const frame = screen.getByTitle(video.title);
    expect(frame).toHaveAttribute(
      'src',
      `https://www.youtube-nocookie.com/embed/${video.videoId}?start=0&rel=0`,
    );
    expect(frame).not.toHaveAttribute('loading', 'lazy');
    const [entity] = JSON.parse(
      container.querySelector('script[type="application/ld+json"]')!.textContent!,
    );
    expect(entity['@type']).toContain('VideoObject');
    expect(entity.uploadDate).toBe(video.uploadDate);
    expect(entity.duration).toBe(`PT${video.durationSeconds}S`);
    expect(entity.thumbnailUrl).toBe(absoluteUrl(`/images/videos/${video.slug}.jpg`));
    expect(entity.isAccessibleForFree).toBe(true);
    expect(entity.hasPart).toHaveLength(video.chapters.length);
    for (const [index, clip] of entity.hasPart.entries()) {
      expect(clip).toMatchObject({
        '@type': 'Clip',
        name: video.chapters[index].name,
        startOffset: video.chapters[index].start,
        endOffset: video.chapters[index].end,
      });
      expect(clip.url).toBe(
        absoluteUrl(`/watch/${video.slug}`) + '?t=' + video.chapters[index].start,
      );
    }
    expect(screen.getByRole('link', { name: 'Open the current lesson' })).toHaveAttribute(
      'href',
      `/course/${video.slug}`,
    );
    expect(screen.getByText(/not a verbatim transcript/)).toBeInTheDocument();
    const readings = screen.getByRole('navigation', { name: 'Video lesson programming-language walkthroughs' });
    expect(Array.from(readings.querySelectorAll('a')).map((link) => link.getAttribute('href'))).toEqual(
      getLessonWalkthroughs(video.slug).map(walkthroughPath),
    );
    expect(screen.getByText(/The recording is in English/)).toBeInTheDocument();
    unmount();
  }
});

it('seeks chapters without autoplay and leaves usable YouTube links for ordinary navigation', () => {
  render(
    <WatchPage slug="debounce">
      <p>Reading notes</p>
    </WatchPage>,
  );
  const link = screen.getByRole('link', { name: '2:56 Solution Breakdown' });
  expect(link).toHaveAttribute('href', '/watch/debounce?t=176');
  fireEvent.click(link);
  expect(screen.getByTitle('Debounce | JavaScript Interview Question')).toHaveAttribute(
    'src',
    'https://www.youtube-nocookie.com/embed/Lfdqz7FSS_g?start=176&rel=0',
  );
  expect(screen.getByText(/Selected start: 2:56/)).toBeInTheDocument();
  expect(mockRouter.push).toHaveBeenCalledWith('/watch/debounce?t=176', undefined, {
    shallow: true,
    scroll: false,
  });
  expect(screen.getByRole('link', { name: 'Watch on YouTube' })).toHaveAttribute(
    'href',
    'https://www.youtube.com/watch?v=Lfdqz7FSS_g&t=176s',
  );
});

it('restores direct timestamps and browser-history changes without autoplay', () => {
  mockRouter.query = { t: '176' };
  const content = (
    <WatchPage slug="debounce">
      <p>Notes</p>
    </WatchPage>
  );
  const { rerender } = render(content);
  expect(screen.getByTitle('Debounce | JavaScript Interview Question')).toHaveAttribute(
    'src',
    expect.stringContaining('start=176&rel=0'),
  );
  mockRouter.query = { t: '245' };
  rerender(
    <WatchPage slug="debounce">
      <p>Notes</p>
    </WatchPage>,
  );
  expect(screen.getByTitle('Debounce | JavaScript Interview Question')).toHaveAttribute(
    'src',
    expect.stringContaining('start=245&rel=0'),
  );
  mockRouter.query = {};
  rerender(
    <WatchPage slug="debounce">
      <p>Notes</p>
    </WatchPage>,
  );
  expect(screen.getByTitle('Debounce | JavaScript Interview Question')).toHaveAttribute(
    'src',
    expect.stringContaining('start=0&rel=0'),
  );
  expect(mockRouter.push).not.toHaveBeenCalled();
});

it('marks the chapter containing an offset between chapter boundaries', () => {
  mockRouter.query = { t: '177' };
  render(
    <WatchPage slug="debounce">
      <p>Notes</p>
    </WatchPage>,
  );
  expect(screen.getByRole('link', { name: '2:56 Solution Breakdown' })).toHaveAttribute(
    'aria-current',
    'true',
  );
  expect(screen.getByTitle('Debounce | JavaScript Interview Question')).toHaveAttribute(
    'src',
    expect.stringContaining('start=177&rel=0'),
  );
});
