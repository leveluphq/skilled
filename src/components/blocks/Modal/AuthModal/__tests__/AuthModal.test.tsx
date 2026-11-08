/**
 * AuthModal is the only entry point into OAuth. The hrefs it builds are what the
 * user's browser is sent to, so the `next=` / `product=` query it encodes matters:
 * the callback uses it to decide where the user lands after authenticating.
 */
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import { themeMap, ThemeNames } from 'style/theme';

const mockFlags = { isFullCourseFree: true };

jest.mock('utils/constants/payments', () => {
  const actual = jest.requireActual('utils/constants/payments');
  return Object.defineProperty({ ...actual, __esModule: true }, 'IS_FULL_COURSE_FREE', {
    get: () => mockFlags.isFullCourseFree,
  });
});

import AuthModal from '../AuthModal';

const makeRouter = (pathname: string, asPath = pathname): any => ({
  route: pathname,
  pathname,
  query: {},
  asPath,
  basePath: '',
  events: { on: jest.fn(), off: jest.fn(), emit: jest.fn() },
  push: jest.fn(() => Promise.resolve(true)),
  replace: jest.fn(() => Promise.resolve(true)),
  prefetch: jest.fn(() => Promise.resolve()),
  beforePopState: jest.fn(),
});

const renderModal = (props: any = {}, pathname = '/course/[slug]', asPath?: string) =>
  render(
    <RouterContext.Provider value={makeRouter(pathname, asPath)}>
      <ThemeProvider theme={themeMap[ThemeNames.Dark]}>
        <AuthModal isOpen onClose={jest.fn()} {...props} />
      </ThemeProvider>
    </RouterContext.Provider>,
  );

const hrefFor = (label: string) => screen.getByText(label).closest('a')!.getAttribute('href');

beforeEach(() => {
  mockFlags.isFullCourseFree = true;
});

describe('AuthModal', () => {
  it('renders nothing when closed', () => {
    const { baseElement } = renderModal({ isOpen: false });

    expect(screen.queryByText('Sign Up or Log In')).not.toBeInTheDocument();
    expect(baseElement.querySelectorAll('a')).toHaveLength(0);
  });

  it('offers exactly the GitHub and Google providers', () => {
    // Facebook is wired up in utils/constants/auth but commented out here; if it
    // is ever re-enabled this test should be updated deliberately.
    renderModal();

    const providers = screen.getAllByRole('link').map((el) => el.textContent);
    expect(providers).toEqual(['GitHub', 'Google']);
  });

  it('sends each provider the current pathname as the post-login destination', () => {
    // The router here is on /course/two-sum (asPath) matched by /course/[slug]
    // (pathname).
    // BUG: CompanyButton uses `router.pathname`, the un-substituted route
    // template, so a viewer who signs in from a lesson is redirected to the
    // literal path "/course/[slug]" after OAuth instead of back to the lesson
    // they were reading. It should use `router.asPath`. The value is also not
    // URI-encoded, so the brackets go into the query string raw.
    renderModal({}, '/course/[slug]', '/course/two-sum');

    expect(hrefFor('GitHub')).toBe('/api/auth/github?next=/course/[slug]');
    expect(hrefFor('Google')).toBe('/api/auth/google?next=/course/[slug]');
  });

  it('appends the product when checking out so the purchase survives login', () => {
    renderModal({ product: 'full_course' }, '/pricing');

    expect(hrefFor('GitHub')).toBe('/api/auth/github?next=/pricing&product=full_course');
  });

  it('omits the product param entirely when no product is supplied', () => {
    renderModal({}, '/pricing');

    expect(hrefFor('Google')).toBe('/api/auth/google?next=/pricing');
  });

  it('shows the free-course copy while the course is free', () => {
    renderModal();

    expect(screen.getByText('Full course access is currently free.')).toBeInTheDocument();
    expect(screen.getByText('Create an account to access the entire course')).toBeInTheDocument();
    expect(
      screen.queryByText('Land a job you want and increase your salary 🤑'),
    ).not.toBeInTheDocument();
  });

  it('shows the salary pitch when the course is paid', () => {
    mockFlags.isFullCourseFree = false;
    renderModal();

    expect(screen.getByText('Land a job you want and increase your salary 🤑')).toBeInTheDocument();
    expect(screen.queryByText('Full course access is currently free.')).not.toBeInTheDocument();
  });
});
