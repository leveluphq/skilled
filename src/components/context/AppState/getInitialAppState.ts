import * as cookie from 'cookie';
import { DEFAULT_STATE, StateKeys } from './constants';

interface ParsedCookie {
  [key: string]: string;
}

const extractValuesFromCookie = (parsedCookie: ParsedCookie) => {
  return {
    [StateKeys.VideoWidth]: parsedCookie[StateKeys.VideoWidth]
      ? Number(parsedCookie[StateKeys.VideoWidth])
      : DEFAULT_STATE[StateKeys.VideoWidth],
  };
};

const getInitialAppState = (cookieString: string) => {
  if (cookieString) {
    const parsedCookie = cookie.parse(cookieString);
    const appState = extractValuesFromCookie(parsedCookie);

    return appState;
  } else {
    return DEFAULT_STATE;
  }
};

export default getInitialAppState;
