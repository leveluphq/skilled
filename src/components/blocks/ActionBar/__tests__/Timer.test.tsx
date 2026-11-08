/**
 * Timer is the interview stopwatch in the lesson action bar. It owns a real
 * interval, so the tests drive it with fake timers and assert both the mm:ss
 * formatting and the start/stop bookkeeping.
 */
import * as React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { themeMap, ThemeNames } from 'style/theme';
import Timer from '../Timer';

const renderTimer = () =>
  render(
    <ThemeProvider theme={themeMap[ThemeNames.Dark]}>
      <Timer />
    </ThemeProvider>,
  );

const toggle = () => screen.getByLabelText('start or stop timer');
const displayed = () => toggle().textContent!.trim();
const tick = (ms: number) =>
  act(() => {
    jest.advanceTimersByTime(ms);
  });

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('Timer', () => {
  it('starts at zero and does not tick until it is started', () => {
    renderTimer();
    expect(displayed()).toBe('00:00');

    tick(10000);

    expect(displayed()).toBe('00:00');
  });

  it('jumps a second ahead the moment it is started', () => {
    renderTimer();

    fireEvent.click(toggle());

    // BUG: starting the timer does `setTime(time + 1)` *before* the interval is
    // installed, so the clock reads 00:01 with zero elapsed time and every
    // stop/start cycle silently adds another phantom second.
    expect(displayed()).toBe('00:01');
  });

  it('counts up once per second while running', () => {
    renderTimer();

    fireEvent.click(toggle());
    tick(3000);

    expect(displayed()).toBe('00:04');
  });

  it('freezes when stopped and resumes from where it left off', () => {
    renderTimer();

    fireEvent.click(toggle());
    tick(2000);
    expect(displayed()).toBe('00:03');

    fireEvent.click(toggle());
    tick(60000);
    expect(displayed()).toBe('00:03');

    fireEvent.click(toggle());
    tick(1000);
    // 3 frozen + 1 phantom restart second + 1 real tick
    expect(displayed()).toBe('00:05');
  });

  it('zero-pads seconds and rolls over into minutes', () => {
    renderTimer();

    fireEvent.click(toggle());
    tick(8000);
    expect(displayed()).toBe('00:09');

    tick(1000);
    expect(displayed()).toBe('00:10');

    tick(50000);
    expect(displayed()).toBe('01:00');
  });

  it('keeps counting minutes past an hour instead of rolling into hours', () => {
    renderTimer();

    fireEvent.click(toggle());
    tick(3600000 - 1000);

    expect(displayed()).toBe('60:00');
  });

  it('toggles the visibility eye without stopping the clock', () => {
    renderTimer();

    fireEvent.click(toggle());
    tick(5000);
    fireEvent.click(screen.getByLabelText('show or hide timer'));
    tick(5000);

    expect(displayed()).toBe('00:11');
  });

  it('clears the interval on unmount', () => {
    const { unmount } = renderTimer();

    fireEvent.click(toggle());
    unmount();

    // A leaked interval would keep calling setState on an unmounted component.
    expect(jest.getTimerCount()).toBe(0);
  });
});
