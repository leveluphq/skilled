/**
 * CourseItems renders the course index: one section per category, split into
 * "Learn" and "Questions", filtered by the progress tab the viewer picked.
 */
import * as React from 'react';
import { render, screen, within } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import { themeMap, ThemeNames } from 'style/theme';
import { LessonStatus, LessonType } from 'utils/constants/lesson';
import CourseItems from '../CourseItems/CourseItems';
import { Tabs } from '../props';

const router: any = {
  route: '/course',
  pathname: '/course',
  query: {},
  asPath: '/course',
  basePath: '',
  events: { on: jest.fn(), off: jest.fn(), emit: jest.fn() },
  push: jest.fn(() => Promise.resolve(true)),
  replace: jest.fn(() => Promise.resolve(true)),
  prefetch: jest.fn(() => Promise.resolve()),
  beforePopState: jest.fn(),
};

const lesson = (id: string, title: string, type: LessonType) => ({
  id,
  title,
  slug: title.toLowerCase().replace(/\s+/g, '-'),
  description: `${title} description`,
  type,
});

const categories: any = [
  {
    id: 'cat-1',
    slug: 'arrays',
    title: 'Arrays',
    description: 'Everything about arrays',
    lessons: [
      lesson('l1', 'Big O', LessonType.Instructional),
      lesson('l2', 'Two Sum', LessonType.Question),
      lesson('l3', 'Three Sum', LessonType.Question),
    ],
  },
  {
    id: 'cat-2',
    slug: 'graphs',
    title: 'Graphs',
    description: null,
    lessons: [lesson('l4', 'BFS', LessonType.Question)],
  },
];

const ui = (props: any = {}) => (
  <RouterContext.Provider value={router}>
    <ThemeProvider theme={themeMap[ThemeNames.Dark]}>
      <CourseItems categories={categories} statuses={{}} activeTab={Tabs.All} {...props} />
    </ThemeProvider>
  </RouterContext.Provider>
);

const renderItems = (props: any = {}) => render(ui(props));

const lessonTitles = () => screen.getAllByRole('link').map((el) => el.textContent!.trim());

describe('CourseItems', () => {
  it('numbers the category headings starting from zero', () => {
    renderItems();

    // BUG: the heading uses the raw array index, so the first category on the
    // course page reads "0. Arrays" instead of "1. Arrays".
    expect(screen.getByText(/Arrays/).textContent).toBe('0. Arrays');
    expect(screen.getByText(/Graphs/).textContent).toBe('1. Graphs');
  });

  it('anchors each section to the category slug for the sidebar jump links', () => {
    const { container } = renderItems();

    expect(container.querySelector('#arrays')).toBeInTheDocument();
    expect(container.querySelector('#graphs')).toBeInTheDocument();
  });

  it('renders a category description only when there is one', () => {
    renderItems();

    expect(screen.getByText('Everything about arrays')).toBeInTheDocument();
    expect(screen.queryByText('null')).not.toBeInTheDocument();
  });

  it('splits lessons into Learn and Questions groups', () => {
    renderItems();

    expect(screen.getAllByText('Learn')).toHaveLength(1);
    expect(screen.getAllByText('Questions')).toHaveLength(2);
  });

  it('omits the Learn group entirely for a category with no instructional lessons', () => {
    renderItems({ categories: [categories[1]] });

    expect(screen.queryByText('Learn')).not.toBeInTheDocument();
    expect(screen.getByText('Questions')).toBeInTheDocument();
  });

  it('links every lesson to its course route', () => {
    renderItems({ categories: [categories[1]] });

    expect(screen.getByRole('link')).toHaveAttribute('href', '/course/bfs');
  });

  it('shows every lesson on the All tab', () => {
    renderItems({ activeTab: Tabs.All, statuses: { l1: LessonStatus.Complete } });

    expect(lessonTitles()).toHaveLength(4);
  });

  it('treats lessons with no recorded status as pending', () => {
    renderItems({
      activeTab: Tabs.Pending,
      statuses: { l1: LessonStatus.Complete, l2: LessonStatus.NeedsReview },
    });

    expect(lessonTitles()).toEqual(['Three Sum', 'BFS']);
  });

  it('counts init and in-progress lessons as pending', () => {
    renderItems({
      activeTab: Tabs.Pending,
      statuses: {
        l1: LessonStatus.Init,
        l2: LessonStatus.InProgress,
        l3: LessonStatus.Complete,
        l4: LessonStatus.NeedsReview,
      },
    });

    expect(lessonTitles()).toEqual(['Big O', 'Two Sum']);
  });

  it('shows only lessons flagged for review on the Review tab', () => {
    renderItems({
      activeTab: Tabs.NeedsReview,
      statuses: { l2: LessonStatus.NeedsReview, l3: LessonStatus.Complete },
    });

    expect(lessonTitles()).toEqual(['Two Sum']);
  });

  it('shows only completed lessons on the Complete tab', () => {
    renderItems({
      activeTab: Tabs.Complete,
      statuses: { l1: LessonStatus.Complete, l4: LessonStatus.Complete },
    });

    expect(lessonTitles()).toEqual(['Big O', 'BFS']);
  });

  it('renders the category shell with no lesson groups when the filter matches nothing', () => {
    renderItems({ activeTab: Tabs.Complete, statuses: {} });

    expect(screen.queryAllByRole('link')).toHaveLength(0);
    expect(screen.queryByText('Questions')).not.toBeInTheDocument();
    // the headings survive so the page does not look broken
    expect(screen.getByText('0. Arrays')).toBeInTheDocument();
  });

  it('refreshes the filtered list when statuses arrive after first paint', () => {
    const { rerender } = render(ui({ activeTab: Tabs.Pending, statuses: {} }));
    expect(lessonTitles()).toEqual(['Big O', 'Two Sum', 'Three Sum', 'BFS']);

    rerender(ui({ activeTab: Tabs.Pending, statuses: { l1: LessonStatus.Complete } }));

    expect(lessonTitles()).toEqual(['Two Sum', 'Three Sum', 'BFS']);
  });

  it('re-filters as soon as the viewer switches tabs', () => {
    const { rerender } = render(ui({ activeTab: Tabs.Pending, statuses: {} }));

    rerender(ui({ activeTab: Tabs.Complete, statuses: { l1: LessonStatus.Complete } }));

    expect(lessonTitles()).toEqual(['Big O']);
  });

  it('keeps the index cards compact by leaving descriptions off', () => {
    renderItems({ categories: [categories[1]] });

    // LessonCard only renders `description` when `showDescription` is passed,
    // and the course index deliberately does not - only the "continue where you
    // left off" card does.
    expect(screen.queryByText('BFS description')).not.toBeInTheDocument();
    expect(within(screen.getByRole('link')).getByText('BFS')).toBeInTheDocument();
  });
});
