/**
 * NavigateCourseButtons is the prev/next pager between lessons. The edges of the
 * course are the interesting part: the first lesson has no previous URL and the
 * last has no next one, and those must render as inert controls rather than
 * links to nowhere.
 */
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import { themeMap, ThemeNames } from 'style/theme';
import { EMPTY_LINK_PROPS } from 'utils/constants/http';
import NavigateCourseButtons from '../NavigateCourseButtons';

const router: any = {
  route: '/course/[slug]',
  pathname: '/course/[slug]',
  query: { slug: 'three-sum' },
  asPath: '/course/three-sum',
  basePath: '',
  events: { on: jest.fn(), off: jest.fn(), emit: jest.fn() },
  push: jest.fn(() => Promise.resolve(true)),
  replace: jest.fn(() => Promise.resolve(true)),
  prefetch: jest.fn(() => Promise.resolve()),
  beforePopState: jest.fn(),
};

const prev = { href: '/course/two-sum', text: 'Two Sum' };
const next = { href: '/course/four-sum', text: 'Four Sum' };

const renderPager = (props: any = {}) =>
  render(
    <RouterContext.Provider value={router}>
      <ThemeProvider theme={themeMap[ThemeNames.Dark]}>
        <NavigateCourseButtons
          slug="three-sum"
          previousLessonUrl={prev}
          nextLessonUrl={next}
          {...props}
        />
      </ThemeProvider>
    </RouterContext.Provider>,
  );

const hrefs = () => screen.getAllByRole('link').map((el) => el.getAttribute('href'));

describe('NavigateCourseButtons', () => {
  it('links to the neighbouring lessons and back to the course index', () => {
    renderPager();

    expect(hrefs()).toEqual(['/course/two-sum', '/course', '/course/four-sum']);
  });

  it('renders the previous control inert at the first lesson', () => {
    renderPager({ previousLessonUrl: EMPTY_LINK_PROPS });

    expect(hrefs()).toEqual(['/course', '/course/four-sum']);
  });

  it('renders the next control inert at the last lesson', () => {
    renderPager({ nextLessonUrl: EMPTY_LINK_PROPS });

    expect(hrefs()).toEqual(['/course/two-sum', '/course']);
  });

  it('exposes the neighbouring lesson titles as hover popovers in icon mode', () => {
    renderPager();

    expect(screen.getByText('Two Sum')).toBeInTheDocument();
    expect(screen.getByText('Four Sum')).toBeInTheDocument();
  });

  it('does not render a popover for a lesson that does not exist', () => {
    renderPager({ previousLessonUrl: EMPTY_LINK_PROPS });

    expect(screen.queryByText('Two Sum')).not.toBeInTheDocument();
  });

  it('shows the "Navigate Course" heading by default in icon mode', () => {
    renderPager();

    expect(screen.getByText('Navigate Course')).toBeInTheDocument();
  });

  it('hides the heading when the caller opts out', () => {
    renderPager({ displayTitle: false });

    expect(screen.queryByText('Navigate Course')).not.toBeInTheDocument();
  });

  describe('text mode', () => {
    it('swaps the home button for Prev/Next labels and lesson names', () => {
      renderPager({ displayText: true });

      expect(screen.getByText('Prev')).toBeInTheDocument();
      expect(screen.getByText('Next')).toBeInTheDocument();
      // no link back to the course index in this layout
      expect(hrefs()).toEqual([
        '/course/two-sum',
        '/course/four-sum',
        'https://jobs.levelup.dev/talent/welcome?referral=true',
      ]);
    });

    it('never renders the heading even when displayTitle is on', () => {
      renderPager({ displayText: true, displayTitle: true });

      expect(screen.queryByText('Navigate Course')).not.toBeInTheDocument();
    });

    it('drops the Prev label at the start of the course but keeps the control', () => {
      renderPager({ displayText: true, previousLessonUrl: EMPTY_LINK_PROPS });

      expect(screen.queryByText('Prev')).not.toBeInTheDocument();
      expect(screen.getByText('Next')).toBeInTheDocument();
    });

    it('opens the jobs board in a new tab without leaking the referrer', () => {
      renderPager({ displayText: true });

      const jobs = screen.getByText('Find a Job').closest('a')!;
      expect(jobs).toHaveAttribute('target', '_blank');
      expect(jobs).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('hides the jobs call to action in icon mode', () => {
      renderPager();

      expect(screen.queryByText('Find a Job')).not.toBeInTheDocument();
    });
  });
});
