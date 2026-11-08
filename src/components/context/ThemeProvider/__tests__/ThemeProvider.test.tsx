import * as React from 'react';
import { render, screen, act } from '@testing-library/react';
import styled, { useTheme } from 'styled-components';
import { themeDark, themeLight, ThemeNames, ThemeType } from 'style/theme';
import ThemeProvider, { ThemeToggleContext } from '../ThemeProvider';

jest.mock('style/GlobalStyle', () => ({
  __esModule: true,
  default: () => <div data-testid="global-style" />,
}));

const hexToRgb = (hex: string) => {
  const value = hex.replace('#', '');
  const int = parseInt(value, 16);
  // eslint-disable-next-line no-bitwise
  return `rgb(${(int >> 16) & 255}, ${(int >> 8) & 255}, ${int & 255})`;
};

const DARK_BACKGROUND_RGB = hexToRgb(themeDark.color.backgroundPrimary);

const Swatch = styled.div`
  background-color: ${({ theme }) => theme.color.backgroundPrimary};
`;

const ThemeReporter: React.FC = () => {
  const theme = useTheme() as unknown as ThemeType;
  const { theme: themeName, setTheme } = React.useContext(ThemeToggleContext);

  return (
    <div>
      <Swatch data-testid="swatch" />
      <span data-testid="styled-background">{theme.color.backgroundPrimary}</span>
      <span data-testid="styled-text">{theme.color.textPrimary}</span>
      <span data-testid="toggle-theme-name">{themeName}</span>
      <button onClick={() => setTheme(ThemeNames.Light)}>go light</button>
    </div>
  );
};

describe('ThemeProvider', () => {
  it('supplies the dark theme object to styled-components by default', () => {
    render(
      <ThemeProvider>
        <ThemeReporter />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('toggle-theme-name')).toHaveTextContent(ThemeNames.Dark);
    expect(screen.getByTestId('styled-background')).toHaveTextContent(
      themeDark.color.backgroundPrimary,
    );
    expect(screen.getByTestId('styled-text')).toHaveTextContent(themeDark.color.textPrimary);
  });

  it('actually applies the theme values as CSS so styled children are not unstyled', () => {
    render(
      <ThemeProvider>
        <ThemeReporter />
      </ThemeProvider>,
    );

    const swatch = screen.getByTestId('swatch');

    expect(window.getComputedStyle(swatch).backgroundColor).toBe(DARK_BACKGROUND_RGB);
  });

  // NOTE: `createGlobalStyle` injects nothing at all under jsdom (verified: zero
  // <style> tags exist after mounting the provider with a plain child), so the
  // only observable evidence that ThemeProvider still mounts the global stylesheet
  // is that it renders the component it imports. Asserting on `document.head`
  // style-tag counts is meaningless here - styled-components leaves tags behind
  // from earlier tests in the same file, so such an assertion passes even if
  // <GlobalStyles /> is deleted outright.
  it('mounts the global stylesheet alongside its children', () => {
    render(
      <ThemeProvider>
        <div data-testid="child">hello</div>
      </ThemeProvider>,
    );

    expect(screen.getByTestId('global-style')).toBeInTheDocument();
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  // BUG: ThemeProviderWrapper reads `theme` from ThemeToggleContext *above itself*,
  // then renders the ThemeToggleContextProvider (`Wrapper`) as its own child. The
  // state that `setTheme` mutates therefore lives below the styled-components
  // ThemeProvider, so switching the theme updates the context value consumers see
  // but never changes the theme object passed to styled-components - light mode is
  // permanently dead. Expected: the toggle provider must wrap the
  // styled-components ThemeProvider, not the other way round.
  // `it.failing` documents the defect without cementing it: the day the nesting is
  // fixed this test starts passing and jest reports it, prompting the `.failing` to
  // be dropped.
  it.failing('setTheme switches the palette handed to styled-components', () => {
    render(
      <ThemeProvider>
        <ThemeReporter />
      </ThemeProvider>,
    );

    act(() => {
      screen.getByText('go light').click();
    });

    // The consumer-facing context does flip...
    expect(screen.getByTestId('toggle-theme-name')).toHaveTextContent(ThemeNames.Light);
    // ...but every styled-component is still rendered with the dark palette.
    expect(screen.getByTestId('styled-background')).toHaveTextContent(
      themeLight.color.backgroundPrimary,
    );
    expect(window.getComputedStyle(screen.getByTestId('swatch')).backgroundColor).toBe(
      hexToRgb(themeLight.color.backgroundPrimary),
    );
  });
});
