/**
 * AuthCard is the paywall/upsell card injected into lesson content. It has to
 * disappear entirely for anyone who already has access, and its copy + buttons
 * flip on the IS_FULL_COURSE_FREE kill switch.
 */
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import { themeMap, ThemeNames } from 'style/theme';

const mockFlags = { isFullCourseFree: true, openAllLessons: false };

jest.mock('utils/constants/payments', () => {
  const actual = jest.requireActual('utils/constants/payments');
  return Object.defineProperties(
    { ...actual, __esModule: true },
    {
      IS_FULL_COURSE_FREE: { get: () => mockFlags.isFullCourseFree },
      OPEN_ALL_LESSONS: { get: () => mockFlags.openAllLessons },
    },
  );
});

import AuthCard from '../AuthCard';

const router: any = {
  route: '/course/two-sum',
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

const Wrapper: React.FC = ({ children }) => <section data-testid="wrapper">{children}</section>;

const renderCard = (props: any) =>
  render(
    <RouterContext.Provider value={router}>
      <ThemeProvider theme={themeMap[ThemeNames.Dark]}>
        <AuthCard Wrapper={Wrapper} {...props} />
      </ThemeProvider>
    </RouterContext.Provider>,
  );

const viewerData = (overrides: any = {}) => ({
  users_by_pk: {
    id: 'user-1',
    name: 'Ada',
    fullCourseAccessEndsAt: null,
    ...overrides,
  },
});

beforeEach(() => {
  mockFlags.isFullCourseFree = true;
  mockFlags.openAllLessons = false;
});

describe('AuthCard', () => {
  it('renders nothing while the viewer query is in flight', () => {
    const { container } = renderCard({ loading: true });

    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when the viewer query errored', () => {
    // Failing open here would flash a paywall at a paying customer.
    const { container } = renderCard({ loading: false, error: new Error('nope') });

    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing for a viewer whose full course access has not expired', () => {
    mockFlags.isFullCourseFree = false;
    const { container } = renderCard({
      loading: false,
      data: viewerData({
        fullCourseAccessEndsAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      }),
    });

    expect(container).toBeEmptyDOMElement();
  });

  describe('signed out', () => {
    it('prompts for login with free-course copy and no upgrade button', () => {
      renderCard({ loading: false });

      expect(
        screen.getByText('Log in for free access to the full course'),
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Sign Up / Log In' })).toBeInTheDocument();
      expect(screen.queryByText('Upgrade to Full Course')).not.toBeInTheDocument();
    });

    it('prompts for login with upgrade copy and an upgrade link when the course is paid', () => {
      mockFlags.isFullCourseFree = false;
      renderCard({ loading: false });

      expect(
        screen.getByText('Log in to continue or upgrade to the full course'),
      ).toBeInTheDocument();
      expect(screen.getByText('Upgrade to Full Course').closest('a')).toHaveAttribute(
        'href',
        '/pricing?from=auth_card',
      );
    });

    it('opens the auth modal when the register button is pressed', () => {
      renderCard({ loading: false });

      expect(screen.queryByText('Sign Up or Log In')).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Sign Up / Log In' }));

      expect(screen.getByText('Sign Up or Log In')).toBeInTheDocument();
    });
  });

  describe('signed in without access', () => {
    beforeEach(() => {
      mockFlags.isFullCourseFree = false;
    });

    it('shows the upgrade-only card with no login button', () => {
      renderCard({ loading: false, data: viewerData() });

      expect(screen.getByText('Upgrade to get access to the full course')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Sign Up / Log In' })).not.toBeInTheDocument();
      expect(screen.getByText('Upgrade to Full Course').closest('a')).toHaveAttribute(
        'href',
        '/pricing?from=auth_card',
      );
    });

    it('treats an expired subscription as still having access', () => {
      // IS_LIFETIME_ACCESS short-circuits expiry, so this asserts the *current*
      // behaviour: an expired viewer is still treated as having access.
      const { container } = renderCard({
        loading: false,
        data: viewerData({ fullCourseAccessEndsAt: '2019-01-01T00:00:00.000Z' }),
      });

      // BUG: `getHasSubscription` ORs `IS_LIFETIME_ACCESS` into the expiry check,
      // so any viewer who ever bought keeps access forever regardless of
      // fullCourseAccessEndsAt. If lifetime access is ever turned off this card
      // will suddenly reappear for those users.
      expect(container).toBeEmptyDOMElement();
    });
  });

  it('renders nothing when every lesson is open, signed in or not, free course or paid', () => {
    // With OPEN_ALL_LESSONS there's nothing to log in or pay for
    mockFlags.openAllLessons = true;

    for (const isFullCourseFree of [true, false]) {
      mockFlags.isFullCourseFree = isFullCourseFree;

      const signedOut = renderCard({ loading: false });
      const signedIn = renderCard({ loading: false, data: viewerData() });

      expect(signedOut.container).toBeEmptyDOMElement();
      expect(signedIn.container).toBeEmptyDOMElement();
    }
  });

  it('hides the upsell from any signed-in viewer while the course is free', () => {
    // getHasSubscription() returns true for *any* logged-in viewer when
    // IS_FULL_COURSE_FREE is on, so the "Upgrade" variant is unreachable.
    const { container } = renderCard({ loading: false, data: viewerData() });

    expect(container).toBeEmptyDOMElement();
  });
});
