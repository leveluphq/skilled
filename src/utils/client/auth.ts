import * as cookie from 'cookie';
import { NextPageContext } from 'next';
import { Viewer } from 'utils/shared/auth';

export const getCookie = (context = {} as NextPageContext) => {
  let userCookie = '';

  if (typeof window !== 'undefined') {
    userCookie = document.cookie;
  }

  if (context.req && context.req.headers) {
    userCookie = context.req.headers.cookie || '';
  }

  return userCookie;
};

const getViewerCookieName = () => `${process.env.JWT_TOKEN_NAME!}-viewer`;

export const getViewerFromCookie = (cookieString = ''): Viewer => {
  const viewer: Viewer = { id: '' };

  if (!cookieString) {
    return viewer;
  }

  try {
    const parsedCookie = cookie.parse(cookieString);
    const rawViewerCookie = parsedCookie[getViewerCookieName()];

    if (!rawViewerCookie) {
      return viewer;
    }

    const parsedViewer = JSON.parse(rawViewerCookie);

    const nowSeconds = Math.floor(Date.now() / 1000);
    const isExpired = parsedViewer?.exp && Number(parsedViewer.exp) <= nowSeconds;

    if (!isExpired && parsedViewer?.id) {
      viewer.id = parsedViewer.id;
    }
  } catch (_error) {
    return viewer;
  }

  return viewer;
};
