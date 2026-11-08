/**
 * ContinueCourse is the "pick up where you left off" card at the top of the
 * course index. It must not appear for someone who cannot actually open the
 * lesson it points at.
 */
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import { themeMap, ThemeNames } from 'style/theme';
import { LessonStatus } from 'utils/constants/lesson';

const mockFlags = { isFullCourseFree: true };

jest.mock('utils/constants/payments', () => {
  const actual = jest.requireActual('utils/constants/payments');
  return Object.defineProperty({ ...actual, __esModule: true }, 'IS_FULL_COURSE_FREE', {
    get: () => mockFlags.isFullCourseFree,
  });
});

import ContinueCourse from '../ContinueCourse/ContinueCourse';

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

const activeLesson = {
  id: 'l1',
  slug: 'two-sum',
  title: 'Two Sum',
  description: 'Find the pair that adds up',
};

const renderContinue = (props: any = {}) =>
  render(
    <RouterContext.Provider value={router}>
      <ThemeProvider theme={themeMap[ThemeNames.Dark]}>
        <ContinueCourse loading={false} statuses={{}} {...props} />
      </ThemeProvider>
    </RouterContext.Provider>,
  );

const withViewer = (overrides: any = {}) => ({
  data: {
    users_by_pk: {
      id: 'user-1',
      activeLesson,
      fullCourseAccessEndsAt: null,
      ...overrides,
    },
  },
});

beforeEach(() => {
  mockFlags.isFullCourseFree = true;
});

describe('ContinueCourse', () => {
  it('renders nothing for a signed-out visitor', () => {
    const { container } = renderContinue();

    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when the viewer has never opened a lesson', () => {
    const { container } = renderContinue(withViewer({ activeLesson: null }));

    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when the viewer has no course access', () => {
    // getActiveLessonSlug returns an empty href for a viewer without a
    // subscription, so the card must not link to a lesson they will be
    // paywalled out of.
    mockFlags.isFullCourseFree = false;
    const { container } = renderContinue(withViewer());

    expect(container).toBeEmptyDOMElement();
  });

  it('links to the active lesson with its title and description', () => {
    renderContinue(withViewer());

    expect(screen.getByText('Continue where you left off:')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/course/two-sum');
    expect(screen.getByText('Two Sum')).toBeInTheDocument();
    expect(screen.getByText('Find the pair that adds up')).toBeInTheDocument();
  });

  it('shows the progress icon for the active lesson', () => {
    const { container } = renderContinue({
      ...withViewer(),
      statuses: { l1: LessonStatus.NeedsReview },
    });

    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders the card without an icon when the lesson has no status yet', () => {
    const { container } = renderContinue({ ...withViewer(), statuses: {} });

    expect(screen.getByRole('link')).toBeInTheDocument();
    expect(container.querySelector('svg')).not.toBeInTheDocument();
  });
});
