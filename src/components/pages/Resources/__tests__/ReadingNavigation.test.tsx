import * as React from 'react';
import { render, screen, within, fireEvent } from '@testing-library/react';
import {
  lessonWalkthroughs,
  getWalkthroughNeighbors,
  walkthroughPath,
} from 'content/lesson-walkthroughs';
import { resources, resourcePath, lessons } from 'content/resources';
import { LANGUAGE_KEY } from 'utils/client/programmingLanguagePreference';
import { programmingLanguageLabel } from 'utils/shared/programmingLanguages';
import ThemeProvider from 'components/context/ThemeProvider';
import ReadingTrail from '../ReadingTrail';
import ResourcePage from '../ResourcePage';

jest.mock('components/blocks/Head', () => () => null);
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children }: any) => React.cloneElement(children, { href }),
}));
afterEach(() => window.localStorage.clear());

it('keeps every reading trail reciprocal, in the same language and topic, and in curriculum order', () => {
  for (const page of lessonWalkthroughs) {
    const { previous, next } = getWalkthroughNeighbors(page);
    const lesson = lessons.find((item) => item.slug === page.lesson)!;
    for (const neighbor of [previous, next]) {
      if (!neighbor) continue;
      expect(neighbor.language).toBe(page.language);
      expect(lessonWalkthroughs).toContain(neighbor);
      const target = lessons.find((item) => item.slug === neighbor.lesson)!;
      expect(target.category).toBe(lesson.category);
      if (neighbor === next) {
        expect(target.position).toBeGreaterThan(lesson.position);
        expect(getWalkthroughNeighbors(neighbor).previous).toBe(page);
      } else {
        expect(target.position).toBeLessThan(lesson.position);
        expect(getWalkthroughNeighbors(neighbor).next).toBe(page);
      }
    }
  }
});

it('handles topic boundaries, a singleton topic, and unpublished input without inventing destinations', () => {
  const page = (lesson: string, language = 'java') =>
    lessonWalkthroughs.find((item) => item.lesson === lesson && item.language === language)!;
  expect(getWalkthroughNeighbors(page('arrays')).previous).toBeUndefined();
  expect(getWalkthroughNeighbors(page('arrays')).next?.lesson).toBe('implement-an-array');
  expect(getWalkthroughNeighbors(page('best-time-to-buy-and-sell-stock')).next).toBeUndefined();
  expect(getWalkthroughNeighbors(page('big-o-time-and-space-complexity'))).toEqual({
    previous: undefined,
    next: undefined,
  });
  expect(getWalkthroughNeighbors({ ...page('arrays'), lesson: 'knapsack' })).toEqual({});
  expect(getWalkthroughNeighbors({ ...page('arrays'), language: 'missing' })).toEqual({});
  expect(getWalkthroughNeighbors(page('debounce', 'typescript')).next?.lesson).toBe('throttle');
});

it('renders ordinary previous/next anchors without changing the saved editor language', () => {
  const page = lessonWalkthroughs.find(
    (item) => item.lesson === 'implement-an-array' && item.language === 'java',
  )!;
  const neighbors = getWalkthroughNeighbors(page);
  window.localStorage.setItem(LANGUAGE_KEY, JSON.stringify('RUST'));
  render(
    <ThemeProvider>
      <ReadingTrail page={page} />
    </ThemeProvider>,
  );
  const nav = screen.getByRole('navigation', { name: 'Java reading sequence' });
  expect(nav.querySelector('a[rel="prev"]')).toHaveAttribute(
    'href',
    walkthroughPath(neighbors.previous!),
  );
  expect(nav.querySelector('a[rel="next"]')).toHaveAttribute(
    'href',
    walkthroughPath(neighbors.next!),
  );
  fireEvent.click(nav.querySelector('a[rel="next"]')!);
  expect(window.localStorage.getItem(LANGUAGE_KEY)).toBe(JSON.stringify('RUST'));
});

it('pairs matching reading companions with unchanged course actions on every language-specific resource', () => {
  for (const resource of resources.filter((item) => item.language)) {
    const { unmount } = render(
      <ResourcePage resourceId={resourcePath(resource).slice(1)} headings={[]} minutes={1}>
        Explanation
      </ResourcePage>,
    );
    const nav = screen.getByRole('navigation', {
      name: 'Course lessons and language walkthroughs',
    });
    for (const slug of resource.lessons) {
      expect(nav.querySelector(`a[href="/course/${slug}"]`)).not.toBeNull();
      const page = lessonWalkthroughs.find(
        (item) => item.lesson === slug && item.language === resource.language,
      );
      if (page) {
        const lesson = lessons.find((item) => item.slug === slug)!;
        expect(
          within(nav).getByRole('link', {
            name: `Read ${lesson.title} in ${programmingLanguageLabel(page.language)}`,
          }),
        ).toHaveAttribute('href', walkthroughPath(page));
      }
    }
    expect(
      Array.from(nav.querySelectorAll('a[href^="/course/"]'))
        .filter((link) => link.getAttribute('href')!.split('/').length === 4)
        .every((link) => link.getAttribute('href')!.endsWith('/' + resource.language)),
    ).toBe(true);
    unmount();
  }
});
