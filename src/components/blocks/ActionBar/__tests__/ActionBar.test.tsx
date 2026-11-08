/**
 * ActionBar is the lesson toolbar: logo, prev/next, the lesson status dropdown
 * and the sign-up prompt. The status dropdown writes straight to the database,
 * so the guard around it and the variables it sends are the important part.
 */
import * as React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import { themeMap, ThemeNames } from 'style/theme';
import { LessonStatus } from 'utils/constants/lesson';

jest.mock('types/generated/client', () => ({
  __esModule: true,
  // NavigateCourseButtons (rendered through its container) needs the course list
  useGetLessonsQuery: () => ({ data: undefined, loading: false }),
}));

import ActionBar from '../ActionBar';

const router: any = {
  route: '/course/[slug]',
  pathname: '/course/[slug]',
  query: { slug: 'two-sum' },
  asPath: '/course/two-sum',
  basePath: '',
  events: { on: jest.fn(), off: jest.fn(), emit: jest.fn() },
  push: jest.fn(() => Promise.resolve(true)),
  replace: jest.fn(() => Promise.resolve(true)),
  prefetch: jest.fn(() => Promise.resolve()),
  beforePopState: jest.fn(),
};

const lessonData = (overrides: any = {}) => ({
  users_by_pk: { id: 'user-1', name: 'Ada' },
  lessons: [{ id: 'lesson-1', slug: 'two-sum' }],
  users_lessons_status: [
    {
      status: LessonStatus.InProgress,
      explanationStepsViewed: 3,
      validationStepsViewed: 2,
    },
  ],
  ...overrides,
});

const renderBar = (props: any = {}) => {
  const insertLessonStatus = jest.fn();
  const utils = render(
    <RouterContext.Provider value={router}>
      <ThemeProvider theme={themeMap[ThemeNames.Dark]}>
        <ActionBar
          slug="two-sum"
          loading={false}
          insertLessonStatus={insertLessonStatus as any}
          {...props}
        />
      </ThemeProvider>
    </RouterContext.Provider>,
  );
  return { ...utils, insertLessonStatus };
};

const statusTrigger = () =>
  screen.getByText(/Loading\.\.\.|Not Started|In Progress|Complete|Needs Review/).closest('button')!;

describe('ActionBar status control', () => {
  it('reflects the stored lesson status', () => {
    renderBar({ data: lessonData() });

    expect(statusTrigger()).toHaveTextContent('In Progress');
  });

  it('shows "Not Started" to a signed-out visitor once mounted', () => {
    renderBar({ data: undefined, loading: false });

    expect(statusTrigger()).toHaveTextContent('Not Started');
  });

  it('is stuck on "Loading..." for a signed-in viewer with no status row yet', () => {
    // BUG: the fallback to mapStatusToText[Init] only runs when there is *no*
    // viewer, so a logged-in viewer opening a lesson for the first time sees the
    // status dropdown permanently reading "Loading...".
    renderBar({ data: lessonData({ users_lessons_status: [] }), loading: false });

    expect(statusTrigger()).toHaveTextContent('Loading...');
  });

  it('offers all four statuses', () => {
    renderBar({ data: lessonData() });

    fireEvent.click(statusTrigger());

    expect(
      within(screen.getByRole('menu'))
        .getAllByRole('menuitem')
        .map((el) => el.textContent),
    ).toEqual(['Not Started', 'In Progress', 'Complete', 'Needs Review']);
  });

  // Every entry is checked, not just one: a dropdown that wired all four items to
  // the same status would pass a single-status assertion while silently
  // overwriting the viewer's real progress.
  it.each([
    ['Not Started', LessonStatus.Init],
    ['In Progress', LessonStatus.InProgress],
    ['Complete', LessonStatus.Complete],
    ['Needs Review', LessonStatus.NeedsReview],
  ])('persists "%s" while preserving the viewed step counters', (label, expected) => {
    const { insertLessonStatus } = renderBar({ data: lessonData() });

    fireEvent.click(statusTrigger());
    fireEvent.click(within(screen.getByRole('menu')).getByText(label));

    expect(insertLessonStatus).toHaveBeenCalledTimes(1);
    expect(insertLessonStatus).toHaveBeenCalledWith({
      variables: {
        userId: 'user-1',
        lessonId: 'lesson-1',
        status: expected,
        explanationStepsViewed: 3,
        validationStepsViewed: 2,
      },
    });
  });

  it('does not write a status for a signed-out visitor', () => {
    const { insertLessonStatus } = renderBar({ data: undefined });

    fireEvent.click(statusTrigger());
    fireEvent.click(within(screen.getByRole('menu')).getByText('Complete'));

    expect(insertLessonStatus).not.toHaveBeenCalled();
  });

  it('does not write a status when the lesson has no existing status row', () => {
    const { insertLessonStatus } = renderBar({
      data: lessonData({ users_lessons_status: [] }),
    });

    fireEvent.click(statusTrigger());
    fireEvent.click(within(screen.getByRole('menu')).getByText('Complete'));

    expect(insertLessonStatus).not.toHaveBeenCalled();
  });
});

describe('ActionBar chrome', () => {
  const logoLink = () =>
    screen.getAllByRole('link').find((el) => el.querySelector('svg[width="100"]'))!;

  it('points the logo at the marketing home page for a signed-out visitor', () => {
    renderBar({ data: undefined });

    expect(logoLink()).toHaveAttribute('href', '/');
  });

  it('points the logo at the course index for a signed-in viewer', () => {
    renderBar({ data: lessonData() });

    expect(logoLink()).toHaveAttribute('href', '/course');
  });

  it('prompts a signed-out visitor to sign up', () => {
    renderBar({ data: undefined, loading: false });

    expect(screen.getByRole('button', { name: 'Sign Up / Log In' })).toBeInTheDocument();
  });

  it('hides the sign-up prompt from a signed-in viewer', () => {
    renderBar({ data: lessonData() });

    expect(screen.queryByRole('button', { name: 'Sign Up / Log In' })).not.toBeInTheDocument();
  });

  it('hides the sign-up prompt while the viewer query is still loading', () => {
    renderBar({ data: undefined, loading: true });

    expect(screen.queryByRole('button', { name: 'Sign Up / Log In' })).not.toBeInTheDocument();
  });

  it('opens the auth modal from the sign-up prompt', () => {
    renderBar({ data: undefined });

    fireEvent.click(screen.getByRole('button', { name: 'Sign Up / Log In' }));

    expect(screen.getByText('Sign Up or Log In')).toBeInTheDocument();
  });

  it('opens the feedback modal', () => {
    renderBar({ data: lessonData() });

    expect(screen.queryByText('Feedback and Bug Reports')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Submit Feedback').closest('button')!);

    expect(screen.getByText('Feedback and Bug Reports')).toBeInTheDocument();
  });

  it('hides the left panel toggle when the page has no left panel', () => {
    renderBar({ data: lessonData() });

    expect(screen.queryByText('Solution Video')).not.toBeInTheDocument();
    expect(screen.queryByText('Question Breakdown')).not.toBeInTheDocument();
  });

  it('shows the left panel toggle when the page supplies one', () => {
    const toggleActiveLeftPanel = jest.fn();
    renderBar({
      data: lessonData(),
      activeLeftPanel: 'TEXT',
      toggleActiveLeftPanel,
    });

    fireEvent.click(screen.getByText('Question Breakdown').closest('button')!);

    expect(toggleActiveLeftPanel).toHaveBeenCalledTimes(1);
  });
});
