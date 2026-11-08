/**
 * HiddenItemList drives the progressive reveal used by every lesson walkthrough:
 * the viewer clicks "next step" and one more item appears. Revealing too much
 * spoils the answer, so the visibility maths is the thing worth locking down.
 */
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { themeMap, ThemeNames } from 'style/theme';
import HiddenItemList from '../HiddenItemList';

const items = ['step one', 'step two', 'step three', 'step four'].map(
  (text) => () => <span>{text}</span>,
);

const renderList = (props: any = {}) =>
  render(
    <ThemeProvider theme={themeMap[ThemeNames.Dark]}>
      <HiddenItemList
        items={items}
        isComplete={false}
        numberViewed={0}
        isActiveSection={false}
        {...props}
      />
    </ThemeProvider>,
  );

const wrapperFor = (text: string) => screen.getByText(text).closest('div[tabindex]')!;

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('HiddenItemList', () => {
  it('mounts every item but hides them all before anything is revealed', () => {
    renderList({ numberViewed: 0 });

    expect(screen.getByText('step one')).toBeInTheDocument();
    ['step one', 'step two', 'step three', 'step four'].forEach((text) => {
      expect(wrapperFor(text)).not.toBeVisible();
    });
  });

  it('reveals exactly as many items as the viewer has stepped through', () => {
    renderList({ numberViewed: 2 });

    expect(wrapperFor('step one')).toBeVisible();
    expect(wrapperFor('step two')).toBeVisible();
    expect(wrapperFor('step three')).not.toBeVisible();
    expect(wrapperFor('step four')).not.toBeVisible();
  });

  it('reveals everything once the lesson is complete, whatever the counter says', () => {
    renderList({ numberViewed: 0, isComplete: true });

    ['step one', 'step two', 'step three', 'step four'].forEach((text) => {
      expect(wrapperFor(text)).toBeVisible();
    });
  });

  it('does not over-reveal when the counter runs past the end of the list', () => {
    renderList({ numberViewed: 99 });

    expect(wrapperFor('step four')).toBeVisible();
    expect(screen.queryByText('step five')).not.toBeInTheDocument();
  });

  it('points the cursor arrow at the newest item in the active section only', () => {
    const { unmount } = renderList({ numberViewed: 2, isActiveSection: true });

    const second = wrapperFor('step two').querySelector('svg')!.parentElement!;
    const first = wrapperFor('step one').querySelector('svg')!.parentElement!;
    expect(second.className).not.toEqual(first.className);
    unmount();

    renderList({ numberViewed: 2, isActiveSection: false });
    const inactiveSecond = wrapperFor('step two').querySelector('svg')!.parentElement!;
    const inactiveFirst = wrapperFor('step one').querySelector('svg')!.parentElement!;
    expect(inactiveSecond.className).toEqual(inactiveFirst.className);
  });

  it('renders nothing for an empty item list', () => {
    const { container } = renderList({ items: [], numberViewed: 0 });

    expect(container.querySelector('div[tabindex]')).not.toBeInTheDocument();
  });
});
