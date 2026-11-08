/**
 * Navbar + AuthSection render a different nav for a logged-out viewer, a viewer
 * that is still loading, a signed-in viewer, and an affiliate. Several of those
 * branches are additionally gated on the `IS_FULL_COURSE_FREE` kill switch, so
 * the constant is mocked with a getter and flipped per test.
 */
import * as React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import { themeMap, ThemeNames } from 'style/theme';
import { CodingLanguage, codingLanguageList, LanguageName } from 'utils/constants/lesson';
import CodingLanguageContext from 'components/context/CodingLanguage/CodingLanguageContext';

const mockFlags = { isFullCourseFree: true };

jest.mock('utils/constants/payments', () => {
  const actual = jest.requireActual('utils/constants/payments');
  // NOTE: object spread is downlevelled to Object.assign at this TS target, which
  // would copy the getter's *value*. Define the accessor explicitly instead.
  return Object.defineProperty({ ...actual, __esModule: true }, 'IS_FULL_COURSE_FREE', {
    get: () => mockFlags.isFullCourseFree,
  });
});

import Navbar from '../Navbar';

const router: any = {
  route: '/',
  pathname: '/',
  query: {},
  asPath: '/',
  basePath: '',
  isFallback: false,
  isReady: true,
  isPreview: false,
  isLocaleDomain: false,
  events: { on: jest.fn(), off: jest.fn(), emit: jest.fn() },
  push: jest.fn(() => Promise.resolve(true)),
  replace: jest.fn(() => Promise.resolve(true)),
  reload: jest.fn(),
  back: jest.fn(),
  prefetch: jest.fn(() => Promise.resolve()),
  beforePopState: jest.fn(),
};

const renderNavbar = (props: any, languageContext?: any) =>
  render(
    <RouterContext.Provider value={router}>
      <CodingLanguageContext.Provider
        value={languageContext || { language: CodingLanguage.Javascript, setLanguage: jest.fn() }}
      >
        <ThemeProvider theme={themeMap[ThemeNames.Dark]}>
          <Navbar {...props} />
        </ThemeProvider>
      </CodingLanguageContext.Provider>
    </RouterContext.Provider>,
  );

const viewer = (overrides: any = {}) => ({
  data: {
    users_by_pk: {
      id: 'user-1',
      name: 'Ada Lovelace',
      activeLesson: null,
      fullCourseAccessEndsAt: null,
      affiliateStatus: null,
      affiliateId: null,
      ...overrides,
    },
  },
});

const linkHrefs = () => screen.queryAllByRole('link').map((el) => el.getAttribute('href'));

beforeEach(() => {
  mockFlags.isFullCourseFree = true;
});

describe('Navbar', () => {
  it('renders the signed-out call to action once the viewer query settles', () => {
    renderNavbar({ loading: false });

    expect(screen.getByRole('button', { name: 'Sign Up / Log In' })).toBeInTheDocument();
    expect(screen.getByText('Course')).toBeInTheDocument();
    expect(screen.getByText('Find a Job')).toBeInTheDocument();
  });

  it('renders no auth affordance while the viewer is still loading', () => {
    // isLoadingViewer = !viewer && !error && loading -> the whole auth section is null
    renderNavbar({ loading: true });

    expect(screen.queryByRole('button', { name: 'Sign Up / Log In' })).not.toBeInTheDocument();
    expect(screen.queryByText('Ada Lovelace')).not.toBeInTheDocument();
    // the static nav still renders so the bar does not collapse
    expect(screen.getByText('Course')).toBeInTheDocument();
  });

  it('treats a failed viewer query as signed-out rather than perpetually loading', () => {
    renderNavbar({ loading: true, error: new Error('boom') as any });

    expect(screen.getByRole('button', { name: 'Sign Up / Log In' })).toBeInTheDocument();
  });

  it('shows the viewer name as the account menu trigger instead of the login button', () => {
    renderNavbar({ loading: false, ...viewer() });

    expect(screen.queryByRole('button', { name: 'Sign Up / Log In' })).not.toBeInTheDocument();
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
  });

  it('falls back to "Settings" when the viewer has no name', () => {
    renderNavbar({ loading: false, ...viewer({ name: null }) });

    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('links "Continue" to the active lesson for a viewer with course access', () => {
    renderNavbar({
      loading: false,
      ...viewer({ activeLesson: { id: 'l1', slug: 'two-sum' } }),
    });

    expect(linkHrefs()).toContain('/course/two-sum');
  });

  it('hides "Continue" when the viewer has no active lesson', () => {
    renderNavbar({ loading: false, ...viewer() });

    expect(screen.queryByText(/Continue/)).not.toBeInTheDocument();
  });

  it('hides "Continue" when hideContinue is set even with an active lesson', () => {
    renderNavbar({
      loading: false,
      hideContinue: true,
      ...viewer({ activeLesson: { id: 'l1', slug: 'two-sum' } }),
    });

    expect(linkHrefs()).not.toContain('/course/two-sum');
  });

  it('hides "Continue" for a signed-out visitor', () => {
    // getActiveLessonSlug bails out when getHasSubscription() is false
    renderNavbar({ loading: false });

    expect(screen.queryByText(/Continue/)).not.toBeInTheDocument();
  });

  describe('when the full course is free', () => {
    it('hides the Pricing nav item and the "Go Pro" upsell from signed-out visitors', () => {
      renderNavbar({ loading: false });

      expect(screen.queryByText('Pricing')).not.toBeInTheDocument();
      expect(screen.queryByText('Go Pro')).not.toBeInTheDocument();
    });
  });

  describe('when the full course is paid', () => {
    beforeEach(() => {
      mockFlags.isFullCourseFree = false;
    });

    it('upsells signed-out visitors with Pricing and "Go Pro"', () => {
      renderNavbar({ loading: false });

      expect(linkHrefs()).toEqual(
        expect.arrayContaining(['/pricing?from=pricing_nav', '/pricing?from=go_pro_nav']),
      );
      expect(screen.getByText('Go Pro')).toBeInTheDocument();
    });

    it('drops the upsell for a viewer with an unexpired full course subscription', () => {
      renderNavbar({
        loading: false,
        ...viewer({ fullCourseAccessEndsAt: new Date(Date.now() + 86400000).toISOString() }),
      });

      expect(screen.queryByText('Go Pro')).not.toBeInTheDocument();
      expect(screen.queryByText('Pricing')).not.toBeInTheDocument();
    });

    it('keeps the upsell for a signed-in viewer who never purchased', () => {
      renderNavbar({ loading: false, ...viewer() });

      expect(screen.getByText('Go Pro')).toBeInTheDocument();
    });

    it('never upsells while the viewer is still loading', () => {
      renderNavbar({ loading: true });

      expect(screen.queryByText('Go Pro')).not.toBeInTheDocument();
      expect(screen.queryByText('Pricing')).not.toBeInTheDocument();
    });
  });
});

describe('Navbar account menu', () => {
  const openAccountMenu = (triggerText: string) => {
    fireEvent.click(screen.getByText(triggerText).closest('button')!);
    return screen.getByRole('menu');
  };

  it('offers course, resources, settings and logout to a signed-in viewer', () => {
    renderNavbar({ loading: false, ...viewer() });

    const menu = openAccountMenu('Ada Lovelace');
    const items = within(menu)
      .getAllByRole('menuitem')
      .map((el) => el.textContent);

    expect(items).toEqual(['Course', 'Resources', 'Settings', 'Logout']);

    // Logout must be a plain anchor (external) so the browser performs a full
    // request and /logout can clear the auth cookie on the response. An href
    // assertion alone would still pass if it were wrapped in next/link, so
    // assert the click is *not* swallowed by the client router.
    const logout = within(menu).getByText('Logout').closest('a')!;
    expect(logout).toHaveAttribute('href', '/logout');

    router.push.mockClear();
    fireEvent.click(logout, { button: 0 });
    expect(router.push).not.toHaveBeenCalled();
  });

  it('promotes the affiliate dashboard to affiliates only', () => {
    renderNavbar({
      loading: false,
      ...viewer({ affiliateStatus: 'ACTIVE', affiliateId: 'aff-1' }),
    });

    expect(screen.getByText('🤑 Affiliate Dashboard')).toBeInTheDocument();

    const menu = openAccountMenu('Ada Lovelace');
    expect(
      within(menu)
        .getAllByRole('menuitem')
        .map((el) => el.textContent),
    ).toEqual(['Affiliate Dashboard', 'Course', 'Resources', 'Settings', 'Logout']);
  });

  it('does not treat an active affiliate without an affiliate id as an affiliate', () => {
    renderNavbar({
      loading: false,
      ...viewer({ affiliateStatus: 'ACTIVE', affiliateId: null }),
    });

    expect(screen.queryByText('🤑 Affiliate Dashboard')).not.toBeInTheDocument();
  });

  it('does not treat an inactive affiliate as an affiliate', () => {
    renderNavbar({
      loading: false,
      ...viewer({ affiliateStatus: 'INACTIVE', affiliateId: 'aff-1' }),
    });

    expect(screen.queryByText('🤑 Affiliate Dashboard')).not.toBeInTheDocument();
  });

  it('gives signed-out visitors a mobile menu with login, course and resources', () => {
    renderNavbar({ loading: false });

    fireEvent.click(screen.getByText('Settings').closest('button')!);
    // The mobile menu lives inside a `display: none` desktop wrapper, so it is
    // hidden from the a11y tree at jsdom's default viewport.
    const menu = screen.getByRole('menu', { hidden: true });

    expect(
      within(menu)
        .getAllByRole('menuitem', { hidden: true })
        .map((el) => el.textContent),
    ).toEqual(['Sign Up / Log In', 'Course', 'Resources']);
  });

  it('keeps pricing in the mobile menu when the course is paid', () => {
    mockFlags.isFullCourseFree = false;
    renderNavbar({ loading: false });
    fireEvent.click(screen.getByText('Settings').closest('button')!);
    const menu = screen.getByRole('menu', { hidden: true });
    expect(within(menu).getByText('Resources').closest('a')).toHaveAttribute('href', '/learn');
    expect(within(menu).getByText('Pricing').closest('a')).toHaveAttribute('href', '/pricing');
  });

  it('keeps an upgrade route for signed-in viewers without access on a paid deployment', () => {
    mockFlags.isFullCourseFree = false;
    renderNavbar({ loading: false, ...viewer() });
    const menu = openAccountMenu('Ada Lovelace');
    expect(within(menu).getByText('Upgrade to Full Course').closest('a')).toHaveAttribute(
      'href',
      '/pricing',
    );
    expect(within(menu).getByText('Resources').closest('a')).toHaveAttribute('href', '/learn');
  });

  it('opens the auth modal from the mobile menu entry', () => {
    renderNavbar({ loading: false });

    fireEvent.click(screen.getByText('Settings').closest('button')!);
    const menu = screen.getByRole('menu', { hidden: true });
    fireEvent.click(within(menu).getByText('Sign Up / Log In'));

    expect(screen.getByText('Sign Up or Log In')).toBeInTheDocument();
  });

  it('opens the auth modal when the login button is pressed', () => {
    renderNavbar({ loading: false });

    const button = screen.getByRole('button', { name: 'Sign Up / Log In' });
    expect(button).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(button);

    expect(screen.getByText('Sign Up or Log In')).toBeInTheDocument();
    expect(screen.getByText('GitHub')).toBeInTheDocument();
    expect(screen.getByText('Google')).toBeInTheDocument();
  });

  it('shows the viewer’s current coding language as the switcher trigger', () => {
    renderNavbar(
      { loading: false, ...viewer() },
      { language: CodingLanguage.Python, setLanguage: jest.fn() },
    );

    expect(screen.getByText('Python')).toBeInTheDocument();
    expect(screen.queryByText('JavaScript')).not.toBeInTheDocument();
  });

  it('switches the coding language to the exact entry the viewer picked', () => {
    // Listing the three names proves nothing on its own - a switcher that wired
    // every entry to the same language would still render all three. Assert the
    // value each entry dispatches.
    const setLanguage = jest.fn();
    renderNavbar(
      { loading: false, ...viewer() },
      { language: CodingLanguage.Javascript, setLanguage },
    );

    fireEvent.click(screen.getByText('JavaScript').closest('button')!);
    const menu = screen.getByRole('menu');

    expect(
      within(menu)
        .getAllByRole('menuitem')
        .map((el) => el.textContent),
    ).toEqual(codingLanguageList.map((language) => LanguageName[language]));

    fireEvent.click(within(menu).getByText('TypeScript'));
    expect(setLanguage).toHaveBeenLastCalledWith(CodingLanguage.Typescript);

    fireEvent.click(screen.getByText('JavaScript').closest('button')!);
    fireEvent.click(within(screen.getByRole('menu')).getByText('Python'));
    expect(setLanguage).toHaveBeenLastCalledWith(CodingLanguage.Python);

    expect(setLanguage).toHaveBeenCalledTimes(2);
  });
});
