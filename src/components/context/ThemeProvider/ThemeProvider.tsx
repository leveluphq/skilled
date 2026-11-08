import * as React from 'react';
import { ThemeProvider } from 'styled-components';
import { themeMap, ThemeNames } from 'style/theme';
import GlobalStyles from 'style/GlobalStyle';

export const ThemeToggleContext = React.createContext({
  theme: ThemeNames.Dark,
  setTheme: (_theme: ThemeNames) => {},
});

const ThemeToggleContextProvider: React.FC = ({ children }) => {
  const [theme, setTheme] = React.useState(ThemeNames.Dark);

  return (
    <ThemeToggleContext.Provider value={{ setTheme, theme }}>
      {children}
    </ThemeToggleContext.Provider>
  );
};

const Wrapper: React.FC = ({ children }) => {
  return <ThemeToggleContextProvider>{children}</ThemeToggleContextProvider>;
};

const ThemeProviderWrapper: React.FC = ({ children }) => {
  const { theme } = React.useContext(ThemeToggleContext);
  const themeObject = themeMap[theme];

  return (
    <Wrapper>
      <ThemeProvider theme={themeObject}>
        <>
          <GlobalStyles />
          {children}
        </>
      </ThemeProvider>
    </Wrapper>
  );
};

export default ThemeProviderWrapper;
