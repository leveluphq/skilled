import * as React from 'react';
import { render, screen, act } from '@testing-library/react';
import AppStateProvider from '../AppStateProvider';
import { StateKeys } from '../constants';
import { useAppState, useLessonDimensions } from '../useAppState';

const Consumer: React.FC = () => {
  const { appState, setAppStateLocal, setAppStateAndCookie } = useAppState();
  const { videoWidth, textWidth } = useLessonDimensions();

  return (
    <div>
      <span data-testid="video-width">{String(appState[StateKeys.VideoWidth])}</span>
      <span data-testid="dimensions">{`${videoWidth}/${textWidth}`}</span>
      <button onClick={() => setAppStateLocal(StateKeys.VideoWidth, 70)}>local</button>
      <button onClick={() => setAppStateAndCookie(StateKeys.VideoWidth, 80)}>cookie</button>
    </div>
  );
};

describe('AppStateProvider', () => {
  it('seeds state from the cookie string it is given', () => {
    render(
      <AppStateProvider cookie="videoWidth=62">
        <Consumer />
      </AppStateProvider>,
    );

    expect(screen.getByTestId('video-width')).toHaveTextContent('62');
  });

  it('falls back to the default width when no cookie is supplied', () => {
    render(
      <AppStateProvider cookie="">
        <Consumer />
      </AppStateProvider>,
    );

    expect(screen.getByTestId('video-width')).toHaveTextContent('45');
  });

  it('setAppStateLocal updates the value exposed to consumers', () => {
    render(
      <AppStateProvider cookie="videoWidth=45">
        <Consumer />
      </AppStateProvider>,
    );

    act(() => {
      screen.getByText('local').click();
    });

    expect(screen.getByTestId('video-width')).toHaveTextContent('70');
  });

  it('useLessonDimensions splits the remaining width between video and text', () => {
    render(
      <AppStateProvider cookie="videoWidth=30">
        <Consumer />
      </AppStateProvider>,
    );

    expect(screen.getByTestId('dimensions')).toHaveTextContent('30/70');

    act(() => {
      screen.getByText('local').click();
    });

    expect(screen.getByTestId('dimensions')).toHaveTextContent('70/30');
  });

  // BUG: `setAppStateAndCookie` is a byte-for-byte copy of `setAppStateLocal` - it
  // never writes the cookie its name promises. The chosen video width is therefore
  // lost on reload/SSR even though the cookie-reading half (getInitialAppState)
  // exists. Expected: persist the value to document.cookie as well as to state.
  // `it.failing` documents the gap without cementing it: once the write lands this
  // test passes and jest flags the stale `.failing`.
  it.failing('setAppStateAndCookie persists the new width to document.cookie', () => {
    document.cookie = 'videoWidth=45';

    render(
      <AppStateProvider cookie="videoWidth=45">
        <Consumer />
      </AppStateProvider>,
    );

    act(() => {
      screen.getByText('cookie').click();
    });

    expect(screen.getByTestId('video-width')).toHaveTextContent('80');
    expect(document.cookie).toContain('videoWidth=80');
  });
});
