/**
 * Countdown drives sale timers. The only logic worth protecting is the
 * days/hours/minutes/seconds split, the zero padding, and clamping to zero once
 * the deadline has passed (a negative countdown would read as "-1:-4:-3:-2").
 */
import * as React from 'react';
import { render, act } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { themeMap, ThemeNames } from 'style/theme';
import Countdown from '../Countdown';

const NOW = new Date('2021-06-01T00:00:00.000Z').getTime();
const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const renderCountdown = (endTimeMilliseconds?: number) =>
  render(
    <ThemeProvider theme={themeMap[ThemeNames.Dark]}>
      <Countdown endTimeMilliseconds={endTimeMilliseconds} />
    </ThemeProvider>,
  );

const readout = (container: HTMLElement) => container.textContent;

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(NOW);
});

afterEach(() => {
  jest.useRealTimers();
});

describe('Countdown', () => {
  it('splits the remaining time into days, hours, minutes and seconds', () => {
    const { container } = renderCountdown(NOW + 12 * DAY + 13 * HOUR + 14 * MINUTE + 15 * SECOND);

    expect(readout(container)).toBe('12:13:14:15');
  });

  it('zero-pads every single-digit segment', () => {
    const { container } = renderCountdown(NOW + 2 * DAY + 3 * HOUR + 4 * MINUTE + 5 * SECOND);

    expect(readout(container)).toBe('02:03:04:05');
  });

  it('does not roll extra hours into days past the 24 hour boundary', () => {
    const { container } = renderCountdown(NOW + 25 * HOUR);

    expect(readout(container)).toBe('01:01:00:00');
  });

  it('clamps to all zeroes once the deadline has passed', () => {
    const { container } = renderCountdown(NOW - DAY);

    expect(readout(container)).toBe('00:00:00:00');
  });

  it('clamps to all zeroes exactly at the deadline', () => {
    const { container } = renderCountdown(NOW);

    expect(readout(container)).toBe('00:00:00:00');
  });

  it('falls back to the hard-coded 2020 sale deadline, which has expired', () => {
    const { container } = renderCountdown();

    expect(readout(container)).toBe('00:00:00:00');
  });

  it('re-renders on its own as the clock advances', () => {
    const { container } = renderCountdown(NOW + 10 * SECOND);
    expect(readout(container)).toBe('00:00:00:10');

    act(() => {
      jest.setSystemTime(NOW + 4 * SECOND);
      jest.advanceTimersByTime(10);
    });

    // 5,990ms left floors to 5 seconds
    expect(readout(container)).toBe('00:00:00:05');
  });
});
