import * as React from 'react';
import { DEFAULT_STATE, StateKeys } from './constants';

const AppStateContext = React.createContext({
  appState: DEFAULT_STATE,
  setAppStateLocal: (_key: StateKeys, _value: any) => {},
  setAppStateAndCookie: (_key: StateKeys, _value: any) => {},
});

export default AppStateContext;
