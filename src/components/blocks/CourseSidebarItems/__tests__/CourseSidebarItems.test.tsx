/**
 * CourseSidebarItems turns the category/lesson tree into the course sidebar. The
 * behaviour that matters is which category is auto-expanded (the one holding the
 * lesson currently open) and which lesson is marked as current.
 */
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import { themeMap, ThemeNames } from 'style/theme';
import { LessonStatus } from 'utils/constants/lesson';
import CourseSidebarItems from '../CourseSidebarItems';

const makeRouter = (slug?: string): any => ({
  route: '/course/[slug]',
  pathname: '/course/[slug]',
  query: slug ? { slug } : {},
  asPath: slug ? `/course/${slug}` : '/course',
  basePath: '',
  events: { on: jest.fn(), off: jest.fn(), emit: jest.fn() },
  push: jest.fn(() => Promise.resolve(true)),
  replace: jest.fn(() => Promise.resolve(true)),
  prefetch: jest.fn(() => Promise.resolve()),
  beforePopState: jest.fn(),
});

const categories: any = [
  {
    id: 'cat-1',
    slug: 'arrays',
    title: 'Arrays',
    lessons: [
      { id: 'l1', slug: 'two-sum', title: 'Two Sum' },
      { id: 'l2', slug: 'three-sum', title: 'Three Sum' },
    ],
  },
  {
    id: 'cat-2',
    slug: 'graphs',
    title: 'Graphs',
    lessons: [{ id: 'l3', slug: 'bfs', title: 'Breadth First Search' }],
  },
];

const renderSidebar = (slug?: string, props: any = {}) =>
  render(
    <RouterContext.Provider value={makeRouter(slug)}>
      <ThemeProvider theme={themeMap[ThemeNames.Dark]}>
        <CourseSidebarItems categories={categories} statuses={{}} {...props} />
      </ThemeProvider>
    </RouterContext.Provider>,
  );

describe('CourseSidebarItems', () => {
  it('collapses every category when no lesson is open', () => {
    renderSidebar();

    expect(screen.getByText('Arrays')).toBeInTheDocument();
    expect(screen.getByText('Graphs')).toBeInTheDocument();
    expect(screen.queryByText('Two Sum')).not.toBeInTheDocument();
    expect(screen.queryByText('Breadth First Search')).not.toBeInTheDocument();
  });

  it('auto-expands only the category containing the open lesson', () => {
    renderSidebar('bfs');

    expect(screen.getByText('Breadth First Search')).toBeInTheDocument();
    expect(screen.queryByText('Two Sum')).not.toBeInTheDocument();
  });

  it('keeps every category collapsed when the slug matches no lesson', () => {
    renderSidebar('a-lesson-that-was-deleted');

    expect(screen.queryByText('Two Sum')).not.toBeInTheDocument();
    expect(screen.queryByText('Breadth First Search')).not.toBeInTheDocument();
  });

  it('lets the viewer expand a collapsed category by hand', () => {
    renderSidebar();

    fireEvent.click(screen.getByText('Arrays').closest('button')!);

    expect(screen.getByText('Two Sum')).toBeInTheDocument();
    expect(screen.getByText('Three Sum')).toBeInTheDocument();
  });

  it('links each lesson to its course route', () => {
    renderSidebar('two-sum');

    expect(screen.getByText('Two Sum').closest('a')).toHaveAttribute('href', '/course/two-sum');
    expect(screen.getByText('Three Sum').closest('a')).toHaveAttribute('href', '/course/three-sum');
  });

  it('styles the open lesson differently from its siblings', () => {
    renderSidebar('two-sum');

    const active = screen.getByText('Two Sum').closest('a')!;
    const sibling = screen.getByText('Three Sum').closest('a')!;

    expect(active.className).not.toEqual(sibling.className);
  });

  it('styles every lesson the same when none of them is open', () => {
    renderSidebar('bfs');
    fireEvent.click(screen.getByText('Arrays').closest('button')!);

    const first = screen.getByText('Two Sum').closest('a')!;
    const second = screen.getByText('Three Sum').closest('a')!;

    expect(first.className).toEqual(second.className);
  });

  it('shows the scroll-to-section shortcut only when asked to', () => {
    const { unmount } = renderSidebar('two-sum');
    expect(screen.queryByText(/Scroll to section/)).not.toBeInTheDocument();
    unmount();

    renderSidebar('two-sum', { showScrollToSection: true });

    // next/link resolves the bare hash against the current route
    const shortcut = screen.getByText(/Scroll to section/).closest('a')!;
    expect(shortcut).toHaveAttribute('href', '/course/two-sum#arrays');
  });

  it('renders a progress icon only for lessons that have a notable status', () => {
    renderSidebar('two-sum', {
      statuses: {
        l1: LessonStatus.Complete,
        l2: LessonStatus.InProgress,
      },
    });

    const complete = screen.getByText('Two Sum').closest('span')!.parentElement!;
    const inProgress = screen.getByText('Three Sum').closest('span')!.parentElement!;

    expect(complete.querySelector('svg')).toBeInTheDocument();
    expect(inProgress.querySelector('svg')).not.toBeInTheDocument();
  });

  it('renders nothing at all for an empty course', () => {
    const { container } = render(
      <RouterContext.Provider value={makeRouter()}>
        <ThemeProvider theme={themeMap[ThemeNames.Dark]}>
          <CourseSidebarItems categories={[] as any} statuses={{}} />
        </ThemeProvider>
      </RouterContext.Provider>,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
