import getInitialAppState from '../getInitialAppState';
import { DEFAULT_STATE, StateKeys } from '../constants';

describe('getInitialAppState', () => {
  it('returns the default state when the cookie string is empty', () => {
    expect(getInitialAppState('')).toEqual({ [StateKeys.VideoWidth]: 45 });
  });

  it('returns the default state for null/undefined cookie strings', () => {
    expect(getInitialAppState(null as unknown as string)).toEqual(DEFAULT_STATE);
    expect(getInitialAppState(undefined as unknown as string)).toEqual(DEFAULT_STATE);
  });

  it('parses a numeric videoWidth out of the cookie header as a number, not a string', () => {
    const state = getInitialAppState('videoWidth=60');

    expect(state).toEqual({ videoWidth: 60 });
    expect(typeof state.videoWidth).toBe('number');
  });

  it('only surfaces the videoWidth key and never leaks other cookies (e.g. the auth token) into app state', () => {
    const state = getInitialAppState('token=super-secret-jwt; videoWidth=30; other=value');

    expect(state).toEqual({ videoWidth: 30 });
    expect(Object.keys(state)).toEqual([StateKeys.VideoWidth]);
    expect(JSON.stringify(state)).not.toContain('super-secret-jwt');
  });

  it('falls back to the default when the cookie header has no videoWidth entry', () => {
    expect(getInitialAppState('token=abc; theme=dark')).toEqual({ videoWidth: 45 });
  });

  it('falls back to the default when videoWidth is present but empty', () => {
    // `videoWidth=` parses to '' which is falsy, so the default is used.
    expect(getInitialAppState('videoWidth=')).toEqual({ videoWidth: 45 });
  });

  it('falls back to the default when the cookie header is unparseable', () => {
    // cookie.parse returns {} for a header with no `=`.
    expect(getInitialAppState('not-a-cookie')).toEqual({ videoWidth: 45 });
    expect(getInitialAppState('videoWidth')).toEqual({ videoWidth: 45 });
  });

  it('keeps 0 as a real value rather than treating it as missing', () => {
    // '0' is a non-empty string so it is truthy - the default must not kick in.
    expect(getInitialAppState('videoWidth=0')).toEqual({ videoWidth: 0 });
  });

  it('uses the first occurrence when videoWidth is duplicated in the header', () => {
    expect(getInitialAppState('videoWidth=60; videoWidth=70')).toEqual({ videoWidth: 60 });
  });

  // BUG: a non-numeric videoWidth cookie yields NaN instead of falling back to the
  // default, and out-of-range values are passed straight through unclamped. Anyone
  // who can set a cookie on the domain (the user themselves, or any subdomain XSS)
  // sends `videoWidth=abc` and the lesson layout computes `textWidth = 100 - NaN`,
  // rendering `width: NaN%`; `videoWidth=1000` gives `textWidth = -900`.
  // Expected: reject non-finite values and clamp into 0-100.
  // `it.failing` documents the defect without cementing it - the day the validation
  // lands this test starts passing and jest flags the stale `.failing`.
  it.failing('validates the videoWidth cookie before handing it to the layout', () => {
    expect(getInitialAppState('videoWidth=abc')).toEqual(DEFAULT_STATE);
    expect(getInitialAppState('videoWidth=1000').videoWidth).toBeLessThanOrEqual(100);
    expect(getInitialAppState('videoWidth=-50').videoWidth).toBeGreaterThanOrEqual(0);
  });

  // BUG: the empty-cookie branch returns the shared DEFAULT_STATE object itself
  // rather than a copy. AppStateProvider seeds useState with it, so an in-place
  // mutation of app state would corrupt the module-level defaults for every
  // subsequent render/request in the same process (SSR).
  // Expected: return `{ ...DEFAULT_STATE }`.
  it.failing('returns a fresh object so the shared defaults cannot be mutated', () => {
    expect(getInitialAppState('')).not.toBe(DEFAULT_STATE);
  });
});
