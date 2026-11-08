import * as React from 'react';
import AppStateContext from './AppStateContext';
import getInitialAppState from './getInitialAppState';
import { StateKeys } from './constants';

interface Props {
  cookie: string;
}

const AppStateProvider: React.FC<Props> = ({ cookie, children }) => {
  const initialState = getInitialAppState(cookie);
  const [appState, setAppState] = React.useState(initialState);

  const setAppStateLocal = React.useCallback(
    (key: StateKeys, value: any) => {
      const updatedState = {
        ...appState,
        [key]: value,
      };

      setAppState(updatedState);
    },
    [appState, setAppState],
  );

  const setAppStateAndCookie = React.useCallback(
    (key: StateKeys, value: any) => {
      const updatedState = {
        ...appState,
        [key]: value,
      };

      setAppState(updatedState);
    },
    [appState, setAppState],
  );

  return (
    <AppStateContext.Provider value={{ appState, setAppStateLocal, setAppStateAndCookie }}>
      {children}
    </AppStateContext.Provider>
  );
};

export default AppStateProvider;
