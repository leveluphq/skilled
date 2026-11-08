import { NextApiRequest } from 'next';
import { IncomingMessage, ServerResponse } from 'http';
import requestIp from 'request-ip';
import * as cookie from 'cookie';
import { ErrorObject } from 'utils/constants/http';

/**
 * Coerce a caller-supplied redirect target into a path on this site.
 *
 * Anything that could resolve to a different origin is discarded rather than
 * repaired: a protocol-relative value such as `//evil.com` begins with `/`, so a
 * leading-slash check alone would pass it straight through to the `Location`
 * header, where the browser treats it as an absolute URL to another host.
 */
export const getSafeRedirectPath = (redirectPath?: string | string[] | null): string => {
  const FALLBACK = '/';

  if (!redirectPath) {
    return FALLBACK;
  }

  const requested = Array.isArray(redirectPath) ? redirectPath.join('/') : redirectPath;

  // Strip characters that can terminate or split a header, then normalize
  // backslashes, which several browsers treat as path separators in a URL.
  const location = requested.replace(/[\r\n\t\0]/g, '').replace(/\\/g, '/');

  if (!location) {
    return FALLBACK;
  }

  // An explicit scheme (`https:`, `javascript:`, `data:`) always names another origin.
  if (/^[a-z][a-z0-9+.-]*:/i.test(location)) {
    return FALLBACK;
  }

  // `//host` and `/\host` are protocol-relative: same-origin only by appearance.
  // They must be rejected rather than prefixed, since they already begin with `/`.
  if (location.startsWith('//')) {
    return FALLBACK;
  }

  // A bare path such as `course` is a relative link on this site; keep the original
  // behaviour of promoting it to an absolute path.
  return location.startsWith('/') ? location : `/${location}`;
};

export const getDestinationPagePath = (redirectPath: string | string[] = '/') =>
  getSafeRedirectPath(redirectPath);

export const getIpAddress = (req: IncomingMessage) => requestIp.getClientIp(req) || '';
// req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || '';

export const getReferralUrl = (req: IncomingMessage) => req.headers.referer || '';

interface SetCookie extends cookie.CookieSerializeOptions {
  res: ServerResponse;
  name: string;
  value: string;
}

export const setCookie = ({
  res,
  name,
  value,
  maxAge,
  domain = process.env.ROOT_DOMAIN!,
  path = '/',
  secure,
  httpOnly,
  sameSite,
}: SetCookie) => {
  let cookiesToSet = [
    cookie.serialize(name, value, {
      maxAge,
      domain,
      path,
      secure,
      httpOnly,
      sameSite,
    }),
  ];
  let existingCookieHeaders = res.getHeader('Set-Cookie');

  if (Array.isArray(existingCookieHeaders)) {
    cookiesToSet = [...cookiesToSet, ...existingCookieHeaders];
  } else if (typeof existingCookieHeaders === 'string') {
    cookiesToSet.push(existingCookieHeaders);
  }

  res.setHeader('Set-Cookie', cookiesToSet);
};

const AFFILIATE_COOKIE_NAME = 'skilled-friend';
const REFERR_ID_COOKIE_NAME = 'skilled-ref-id';
const WEEK = 60 * 60 * 24 * 7;
const AFFILIATE_COOKIE_AGE_WEEKS = 4 * WEEK;
export const setAffiliateCookie = (res: ServerResponse, value: string) => {
  setCookie({
    res,
    name: AFFILIATE_COOKIE_NAME,
    value,
    maxAge: AFFILIATE_COOKIE_AGE_WEEKS,
  });
};

export const getAffiliateCookie = (req: NextApiRequest) => {
  return req.cookies[AFFILIATE_COOKIE_NAME];
};

export const setAffiliateReferralIdCookie = (res: ServerResponse, value: string) => {
  setCookie({
    res,
    name: REFERR_ID_COOKIE_NAME,
    value,
    maxAge: AFFILIATE_COOKIE_AGE_WEEKS,
  });
};

export const getAffiliateReferralIdCookie = (req: NextApiRequest) => {
  return req.cookies[REFERR_ID_COOKIE_NAME];
};

const DAY = 60 * 60 * 24;
const OAUTH_COOKIE_AGE_DAY = 0.25 * DAY;
export const setOauthStateCookie = (res: ServerResponse, name: string, value: string) => {
  setCookie({
    res,
    name,
    value,
    maxAge: OAUTH_COOKIE_AGE_DAY,
  });
};

export const expireCookie = (res: ServerResponse, name: string) => {
  setCookie({
    res,
    name,
    value: '',
    maxAge: -1,
  });
};

export const createErrorObject = (errorObject: ErrorObject) => errorObject;
