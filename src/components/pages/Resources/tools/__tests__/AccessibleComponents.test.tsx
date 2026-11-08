import * as React from 'react';
import { render, screen, fireEvent, within, cleanup } from '@testing-library/react';
import ThemeProvider from 'components/context/ThemeProvider';
import AccessibleComponents from '../AccessibleComponents';

afterEach(() => {
  cleanup();
  jest.restoreAllMocks();
});
const mount = () =>
  render(
    <ThemeProvider>
      <AccessibleComponents />
    </ThemeProvider>,
  );

it('maintains one keyboard tab stop and matching visible panels through wraparound, Home, and End', () => {
  mount();
  const tabs = screen.getAllByRole('tab');
  expect(tabs.map((tab) => tab.tabIndex)).toEqual([0, -1, -1]);
  expect(screen.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', tabs[0].id);
  fireEvent.keyDown(tabs[0], { key: 'ArrowLeft' });
  expect(tabs[2]).toHaveFocus();
  expect(tabs[2]).toHaveAttribute('aria-selected', 'true');
  fireEvent.keyDown(tabs[2], { key: 'Home' });
  expect(tabs[0]).toHaveFocus();
  fireEvent.keyDown(tabs[0], { key: 'End' });
  expect(tabs[2]).toHaveFocus();
  fireEvent.keyDown(tabs[2], { key: 'ArrowRight' });
  expect(tabs[0]).toHaveFocus();
  expect(screen.getAllByRole('tabpanel')).toHaveLength(1);
  for (const tab of tabs)
    expect(document.getElementById(tab.getAttribute('aria-controls')!)).toHaveAttribute(
      'aria-labelledby',
      tab.id,
    );
});

it('demonstrates snapshot replacement versus updater composition and retains state across tab switches', () => {
  mount();
  fireEvent.click(screen.getByRole('tab', { name: 'State' }));
  const panel = screen.getByRole('tabpanel');
  fireEvent.click(within(panel).getByRole('button', { name: 'Three snapshot updates' }));
  expect(within(panel).getByRole('status')).toHaveTextContent('Count: 1');
  fireEvent.click(within(panel).getByRole('button', { name: 'Three updater functions' }));
  expect(within(panel).getByRole('status')).toHaveTextContent('Count: 4');
  fireEvent.click(screen.getByRole('tab', { name: 'Tabs' }));
  fireEvent.click(screen.getByRole('tab', { name: 'State' }));
  expect(screen.getByRole('status')).toHaveTextContent('Count: 4');
  fireEvent.click(screen.getByRole('button', { name: 'Reset count' }));
  expect(screen.getByRole('status')).toHaveTextContent('Count: 0');
});

it('wires native dialog entry, explicit closure, and focus restoration without persisting note text', () => {
  // jsdom lacks the native top layer. This tests our wiring; containment,
  // inert background, and Escape are checked separately in a real browser.
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
    configurable: true,
    value: jest.fn(function (this: HTMLDialogElement) {
      this.open = true;
    }),
  });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', {
    configurable: true,
    value: jest.fn(function (this: HTMLDialogElement, result: string) {
      this.returnValue = result;
      this.open = false;
      this.dispatchEvent(new Event('close'));
    }),
  });
  mount();
  fireEvent.click(screen.getByRole('tab', { name: 'Modal' }));
  const opener = screen.getByRole('button', { name: 'Open practice dialog' });
  fireEvent.click(opener);
  expect(screen.getByLabelText('Practice note')).toHaveFocus();
  const close = screen.getByRole('button', { name: 'Close dialog' });
  close.focus();
  fireEvent.keyDown(close, { key: 'Tab' });
  expect(screen.getByLabelText('Practice note')).toHaveFocus();
  fireEvent.keyDown(screen.getByLabelText('Practice note'), { key: 'Tab', shiftKey: true });
  expect(close).toHaveFocus();
  fireEvent.click(screen.getByRole('button', { name: 'Close dialog' }));
  expect(opener).toHaveFocus();
  expect(screen.getByRole('status')).toHaveTextContent('Dialog canceled.');
});
