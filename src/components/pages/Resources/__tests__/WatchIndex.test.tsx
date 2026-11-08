import * as React from 'react';
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import WatchIndex from '../WatchIndex';
import videos from 'content/videos/catalog.json';
import course from 'content/resources/course.json';

jest.mock('components/blocks/Head', () => () => null);
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children }: any) => React.cloneElement(children, { href }),
}));
afterEach(cleanup);

it('shows every recording in course topic order with complete real links before search', () => {
  const { container } = render(<WatchIndex />);
  const cards = Array.from(container.querySelectorAll('h3')).map((heading) => heading.closest('a'));
  expect(cards.map((card) => card!.getAttribute('href'))).toEqual(course.lessons
    .filter((lesson) => videos.some((video) => video.slug === lesson.slug))
    .map((lesson) => `/watch/${lesson.slug}`));
  const topics = screen.getByRole('navigation', { name: 'Video topics' });
  expect(within(topics).getAllByRole('link')).toHaveLength(course.categories.length);
  expect(container.querySelector('a[href="/watch/javascript-interview-questions"]')).toBeNull();
});

it('filters by case-insensitive title, description, or topic and restores all cards after an empty result', () => {
  const { container } = render(<WatchIndex />);
  const input = screen.getByRole('searchbox', { name: 'Find a video lesson' });
  fireEvent.change(input, { target: { value: '  GRAPHS  ' } });
  expect(container.querySelectorAll('h3')).toHaveLength(course.lessons.filter((lesson) => lesson.category === 'graphs').length);
  expect(screen.getByRole('heading', { level: 2, name: 'Graphs' })).toBeInTheDocument();
  expect(screen.queryByRole('heading', { level: 2, name: 'Arrays' })).not.toBeInTheDocument();
  fireEvent.change(input, { target: { value: 'no-such-recording-xyz' } });
  expect(container.querySelectorAll('h3')).toHaveLength(0);
  expect(screen.getByRole('status')).toHaveTextContent(`0 of ${videos.length}`);
  const clear = screen.getByRole('button', { name: 'Clear search' });
  clear.focus();
  fireEvent.click(clear);
  expect(input).toHaveValue('');
  expect(input).toHaveFocus();
  expect(container.querySelectorAll('h3')).toHaveLength(videos.length);
});
