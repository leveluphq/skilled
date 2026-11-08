import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { themeMap, ThemeNames } from 'style/theme';
import { OauthProvider } from 'utils/constants/auth';
import api from 'services/client/api';
import navigateTo from 'utils/client/navigateTo';
import SettingsPage from '../SettingsPage';

jest.mock('services/client/api', () => ({
  __esModule: true,
  default: { post: jest.fn() },
}));

const routerPush = jest.fn();
jest.mock('next/router', () => ({
  useRouter: () => ({ push: routerPush, pathname: '/my/settings', asPath: '/my/settings', query: {} }),
}));

// The page chrome (navbar/footer) needs Apollo + the Next router provider and is
// covered elsewhere; this suite is about the settings page's own behaviour.
jest.mock('components/pages/PageLayout/Default', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const mockApiPost = (api as unknown as { post: jest.Mock }).post;

const makeUser = (overrides: any = {}) => ({
  id: 'user-1',
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  registrationSource: OauthProvider.Github,
  fullCourseAccessEndsAt: null,
  activeLesson: null,
  sentGiftCards: [],
  receivedGiftCards: [],
  redeemedGiftCards: [],
  ...overrides,
});

const renderSettings = (props: any = {}) =>
  render(
    <ThemeProvider theme={themeMap[ThemeNames.Dark]}>
      <SettingsPage loading={false} {...props} />
    </ThemeProvider>,
  );

let locationHref = '';

// jsdom can't navigate, so record where the page sends the browser
jest.mock('utils/client/navigateTo', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('SettingsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    locationHref = '';
    (navigateTo as jest.Mock).mockImplementation((url: string) => {
      locationHref = url;
    });
    mockApiPost.mockResolvedValue({ ok: true });
  });

  it('shows only the heading while the viewer query is in flight and never redirects', () => {
    renderSettings({ loading: true });

    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();
    expect(screen.queryByText('User Details')).not.toBeInTheDocument();
    expect(routerPush).not.toHaveBeenCalled();
  });

  it('surfaces the query error instead of redirecting', () => {
    renderSettings({ error: { message: 'network exploded' } });

    expect(screen.getByText(/network exploded/)).toBeInTheDocument();
    expect(routerPush).not.toHaveBeenCalled();
  });

  it('redirects home and renders nothing when the viewer is not signed in', () => {
    const { container } = renderSettings({ data: { users_by_pk: null } });

    expect(routerPush).toHaveBeenCalledWith('/');
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the account identity and the provider the account was created with', () => {
    renderSettings({ data: { users_by_pk: makeUser() } });

    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('ada@example.com')).toBeInTheDocument();
    expect(screen.getByText(/OAuth Registration Source: GitHub/)).toBeInTheDocument();
    expect(screen.getByText(/Always use GitHub when logging in/)).toBeInTheDocument();
  });

  it('hides the membership/upsell section while the course is free for everyone', () => {
    // IS_FULL_COURSE_FREE is true today, so nobody should be told to buy a
    // subscription. Flipping that flag back on must bring this section back.
    renderSettings({ data: { users_by_pk: makeUser() } });

    expect(screen.queryByText('Membership')).not.toBeInTheDocument();
    expect(screen.queryByText(/You don't have a subscription/)).not.toBeInTheDocument();
  });

  it('tells a viewer with no gift cards that there is nothing to show', () => {
    renderSettings({ data: { users_by_pk: makeUser() } });

    expect(screen.getByText('You have not sent or redeemed any gift cards')).toBeInTheDocument();
    expect(screen.queryByText('RECEIVED')).not.toBeInTheDocument();
    expect(screen.queryByText('PURCHASED')).not.toBeInTheDocument();
    expect(screen.queryByText('REDEEMED')).not.toBeInTheDocument();
  });

  it('splits gift cards into received, purchased and redeemed, and only offers redeem on the unused ones', () => {
    renderSettings({
      data: {
        users_by_pk: makeUser({
          receivedGiftCards: [{ id: 'gc-r', productName: 'Gifted Course', code: 'CODE-R' }],
          sentGiftCards: [{ id: 'gc-s', productName: 'Bought Course', code: 'CODE-S' }],
          redeemedGiftCards: [
            { id: 'gc-d', productName: 'Used Course', code: 'CODE-D', redeemedAt: '2023-04-05T10:00:00Z' },
          ],
        }),
      },
    });

    expect(screen.getByText('RECEIVED')).toBeInTheDocument();
    expect(screen.getByText('PURCHASED')).toBeInTheDocument();
    expect(screen.getByText('REDEEMED')).toBeInTheDocument();
    expect(screen.queryByText('You have not sent or redeemed any gift cards')).not.toBeInTheDocument();
    // Only the two unused cards get a REDEEM button; the redeemed one shows its date.
    expect(screen.getAllByText('REDEEM')).toHaveLength(2);
    expect(screen.getByText('2023-04-05')).toBeInTheDocument();
  });

  it('redeems the code typed into the form and sends the viewer to the course on success', async () => {
    renderSettings({ data: { users_by_pk: makeUser() } });

    fireEvent.change(screen.getByPlaceholderText('Gift card code...'), {
      target: { value: 'GIFT-123' },
    });
    fireEvent.click(screen.getByText('Redeem Gift Card'));

    await waitFor(() => expect(mockApiPost).toHaveBeenCalledTimes(1));
    expect(mockApiPost).toHaveBeenCalledWith('giftcard/redeem', {
      payload: { code: 'GIFT-123' },
    });
    await waitFor(() => expect(locationHref).toContain('/course?subscribed=true'));
  });

  it('redeems the specific card whose button was pressed, not the form input', async () => {
    renderSettings({
      data: {
        users_by_pk: makeUser({
          receivedGiftCards: [{ id: 'gc-r', productName: 'Gifted Course', code: 'CODE-R' }],
        }),
      },
    });

    fireEvent.click(screen.getByText('REDEEM'));

    await waitFor(() => expect(mockApiPost).toHaveBeenCalledTimes(1));
    expect(mockApiPost).toHaveBeenCalledWith('giftcard/redeem', { payload: { code: 'CODE-R' } });
  });

  it('does not double-redeem when the button is pressed twice', async () => {
    renderSettings({ data: { users_by_pk: makeUser() } });

    fireEvent.change(screen.getByPlaceholderText('Gift card code...'), {
      target: { value: 'GIFT-123' },
    });
    fireEvent.click(screen.getByText('Redeem Gift Card'));
    fireEvent.click(screen.getByText('Redeem Gift Card'));

    await waitFor(() => expect(mockApiPost).toHaveBeenCalledTimes(1));
  });

  it('shows the server error, stays on the page and re-enables redeeming after a failure', async () => {
    mockApiPost.mockRejectedValue({ message: 'That gift card was already redeemed' });

    renderSettings({ data: { users_by_pk: makeUser() } });

    fireEvent.change(screen.getByPlaceholderText('Gift card code...'), {
      target: { value: 'BAD-CODE' },
    });
    fireEvent.click(screen.getByText('Redeem Gift Card'));

    await waitFor(() =>
      expect(screen.getByText('That gift card was already redeemed')).toBeInTheDocument(),
    );
    expect(locationHref).toBe('');
    expect(screen.getByText('Redeem Gift Card').closest('button')).not.toBeDisabled();
    // The typed code is kept so the user can correct it.
    expect(screen.getByPlaceholderText('Gift card code...')).toHaveValue('BAD-CODE');
  });

  // BUG: the registration source is used as an unchecked index into the company
  // map, so any value outside the five known providers (null for a legacy row, or
  // a provider added server-side but not to `style/company`) resolves the icon to
  // `undefined` and React throws "Element type is invalid" - the whole settings
  // page white-screens rather than degrading.
  // Expected: fall back to no icon / a generic label when the source is unknown.
  // `it.failing` documents the crash without cementing it: once the lookup is
  // guarded this test passes and jest flags the stale `.failing`.
  it.failing('renders for an account whose registration source is not in the company map', () => {
    // eslint-disable-next-line no-console
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    try {
      renderSettings({ data: { users_by_pk: makeUser({ registrationSource: null }) } });

      expect(screen.getByText('ada@example.com')).toBeInTheDocument();
    } finally {
      consoleError.mockRestore();
    }
  });
});
