import * as cookie from 'cookie';
import { StateKeys } from 'components/context/AppState/constants';

/**
 * Cookies the browser is allowed to receive back through page props.
 *
 * On the server, `req.headers.cookie` holds every cookie the browser sent —
 * including the httpOnly session JWT. Anything placed in a page's props is
 * serialized into `__NEXT_DATA__` and readable by any script on the page, so the
 * full header must never be returned from `getInitialProps`. Only the two cookies
 * the client actually reads are forwarded, and both are already non-httpOnly:
 *
 *  - `<JWT_TOKEN_NAME>-viewer`  the id/exp pair `getViewerFromCookie` parses
 *  - `videoWidth`              the persisted lesson layout in `getInitialAppState`
 */
const getClientReadableCookieNames = () => [
  `${process.env.JWT_TOKEN_NAME}-viewer`,
  StateKeys.VideoWidth as string,
];

export const filterClientReadableCookies = (cookieString = ''): string => {
  if (!cookieString) {
    return '';
  }

  let parsed: Record<string, string>;

  try {
    parsed = cookie.parse(cookieString);
  } catch (_error) {
    return '';
  }

  return getClientReadableCookieNames()
    .filter((name) => parsed[name] !== undefined)
    .map((name) => cookie.serialize(name, parsed[name]))
    .join('; ');
};

export default filterClientReadableCookies;
