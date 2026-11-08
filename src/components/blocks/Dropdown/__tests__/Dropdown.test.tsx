/**
 * Dropdown backs every menu in the app (account menu, language switcher, lesson
 * status). Its behaviour that actually breaks in practice: opening/closing, the
 * three item shapes (action / internal link / external link), and the keyboard
 * focus contract that closes the menu when focus leaves the last item.
 */
import * as React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import { themeMap, ThemeNames } from 'style/theme';
import Dropdown from '../Dropdown';

const router: any = {
  route: '/',
  pathname: '/',
  query: {},
  asPath: '/',
  basePath: '',
  events: { on: jest.fn(), off: jest.fn(), emit: jest.fn() },
  push: jest.fn(() => Promise.resolve(true)),
  replace: jest.fn(() => Promise.resolve(true)),
  prefetch: jest.fn(() => Promise.resolve()),
  beforePopState: jest.fn(),
};

const renderDropdown = (props: any = {}) => {
  const handleFocus = jest.fn();
  const handleBlur = jest.fn();
  const utils = render(
    <RouterContext.Provider value={router}>
      <ThemeProvider theme={themeMap[ThemeNames.Dark]}>
        <Dropdown
          triggerText="Menu"
          handleFocus={handleFocus}
          handleBlur={handleBlur}
          items={[]}
          {...props}
        />
      </ThemeProvider>
    </RouterContext.Provider>,
  );
  return { ...utils, handleFocus, handleBlur };
};

const trigger = () => screen.getByRole('button', { name: /Menu/ });
const open = () => fireEvent.click(trigger());

beforeEach(() => {
  router.push.mockClear();
  router.replace.mockClear();
});

describe('Dropdown', () => {
  it('starts closed and reports that through aria-expanded', () => {
    renderDropdown({ items: [{ name: 'Course', href: '/course' }] });

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
    expect(trigger()).toHaveAttribute('aria-haspopup', 'true');
  });

  it('opens on trigger click and closes on a second click', () => {
    renderDropdown({ items: [{ name: 'Course', href: '/course' }] });

    open();
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(trigger()).toHaveAttribute('aria-expanded', 'true');

    open();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('renders action items as buttons and invokes them', () => {
    const onClick = jest.fn();
    renderDropdown({ items: [{ name: 'Log out everywhere', onClick }] });

    open();
    const item = within(screen.getByRole('menu')).getByRole('menuitem');
    expect(item.tagName).toBe('BUTTON');

    fireEvent.click(item);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('prefers the action over the href when an item has both', () => {
    const onClick = jest.fn();
    renderDropdown({ items: [{ name: 'Both', href: '/somewhere', onClick }] });

    open();
    const item = within(screen.getByRole('menu')).getByRole('menuitem');

    expect(item.tagName).toBe('BUTTON');
    expect(item).not.toHaveAttribute('href');
  });

  it('routes an internal item through the client router instead of reloading', () => {
    renderDropdown({ items: [{ name: 'Course', href: '/course' }] });

    open();
    const link = within(screen.getByRole('menu')).getByText('Course').closest('a')!;
    expect(link).toHaveAttribute('href', '/course');

    fireEvent.click(link, { button: 0 });

    // next/link swallows the navigation and hands it to the router
    expect(router.push).toHaveBeenCalledTimes(1);
    expect(router.push.mock.calls[0][0]).toBe('/course');
  });

  it('leaves an external item to the browser so the server sees the request', () => {
    // `/logout` is a server-rendered page that clears the auth cookie on the
    // response. If next/link intercepted the click the cookie would survive, so
    // an `external` item must render a raw anchor the router never touches.
    renderDropdown({ items: [{ name: 'Logout', href: '/logout', external: true }] });

    open();
    const link = within(screen.getByRole('menu')).getByText('Logout').closest('a')!;
    expect(link).toHaveAttribute('href', '/logout');

    fireEvent.click(link, { button: 0 });

    expect(router.push).not.toHaveBeenCalled();
  });

  it('closes when anything inside the menu is activated', () => {
    renderDropdown({ items: [{ name: 'Course', href: '/course' }] });

    open();
    fireEvent.click(within(screen.getByRole('menu')).getByText('Course'));

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('closes when the viewer presses outside of it', () => {
    renderDropdown({ items: [{ name: 'Course', href: '/course' }] });

    open();
    fireEvent.mouseDown(document.body);

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('stays open when the press lands inside the dropdown', () => {
    renderDropdown({ items: [{ name: 'Course', href: '/course' }] });

    open();
    fireEvent.mouseDown(within(screen.getByRole('menu')).getByText('Course'));

    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('keeps the menu open while tabbing between items', () => {
    const { handleBlur } = renderDropdown({
      items: [
        { name: 'First', href: '/a' },
        { name: 'Last', href: '/b' },
      ],
    });

    open();
    const items = within(screen.getByRole('menu')).getAllByRole('menuitem');
    fireEvent.blur(items[0]);

    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(handleBlur).not.toHaveBeenCalled();
  });

  it('closes once focus leaves the last item', () => {
    const { handleBlur } = renderDropdown({
      items: [
        { name: 'First', href: '/a' },
        { name: 'Last', href: '/b' },
      ],
    });

    open();
    const items = within(screen.getByRole('menu')).getAllByRole('menuitem');
    fireEvent.blur(items[1]);

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  it('notifies the parent when an item takes focus', () => {
    const { handleFocus } = renderDropdown({ items: [{ name: 'First', href: '/a' }] });

    open();
    fireEvent.focus(within(screen.getByRole('menu')).getByRole('menuitem'));

    expect(handleFocus).toHaveBeenCalledTimes(1);
  });

  it('uses a supplied custom trigger instead of the default chevron button', () => {
    const CustomTrigger: React.FC<any> = ({ isOpen, handleClick }) => (
      <button onClick={handleClick}>{isOpen ? 'close me' : 'open me'}</button>
    );
    renderDropdown({ Trigger: CustomTrigger, items: [{ name: 'First', href: '/a' }] });

    fireEvent.click(screen.getByText('open me'));

    expect(screen.getByText('close me')).toBeInTheDocument();
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('renders an empty menu rather than crashing when there are no items', () => {
    renderDropdown({ items: [] });

    open();

    expect(within(screen.getByRole('menu')).queryAllByRole('menuitem')).toHaveLength(0);
  });
});
