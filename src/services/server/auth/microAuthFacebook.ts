import { NextApiResponse } from 'next';
import querystring from 'querystring';
import url from 'url';
import { randomUUID } from 'crypto';
// @ts-ignore no typings
import redirect from 'micro-redirect';
// @ts-ignore no typings
import microCookie from 'micro-cookie';
import { setOauthStateCookie, expireCookie } from 'utils/server/http';
import fetchJson from 'utils/server/fetchJson';
import {
  IncomingMessageWithCookies,
  OauthProvider,
  NextOauthApiHandler,
} from 'utils/constants/auth';
import getAuthCookieName from './getAuthCookieName';
import sanitizeOauthError from './sanitizeOauthError';

const provider = OauthProvider.Facebook;
const cookieName = getAuthCookieName(provider);

interface Options {
  appId: string;
  appSecret: string;
  fields?: string;
  callbackUrl: string;
  path: string;
  scope: string;
  apiVersion: string;
}

const microAuthFacebook = ({
  appId,
  appSecret,
  fields = 'id,name,email,picture,first_name,middle_name,last_name,name_format,short_name',
  callbackUrl,
  path,
  scope,
  apiVersion = '6.0',
}: Options) => {
  const getRedirectUrl = (state: string) => {
    return `https://www.facebook.com/dialog/oauth?client_id=${appId}&redirect_uri=${callbackUrl}&response_type=code&state=${state}&scope=${scope}`;
  };

  const getAccessTokenUrl = (code: string) => {
    return `https://graph.facebook.com/v${apiVersion}/oauth/access_token?client_id=${appId}&redirect_uri=${callbackUrl}&client_secret=${appSecret}&code=${code}`;
  };

  const getUserInfoUrl = (accessToken: string) => {
    return `https://graph.facebook.com/v${apiVersion}/me?access_token=${accessToken}&fields=${fields}`;
  };

  return (fn: NextOauthApiHandler) => async (
    req: IncomingMessageWithCookies,
    res: NextApiResponse,
    ...args: any[]
  ) => {
    const { pathname, query } = url.parse(req.url as string);

    if (pathname === path) {
      try {
        const state = randomUUID();
        const redirectUrl = getRedirectUrl(state);

        setOauthStateCookie(res, cookieName, JSON.stringify({ state, query }));

        return redirect(res, 302, redirectUrl);
      } catch (err) {
        args.push({ err: sanitizeOauthError(err, provider), provider });
        return fn(req, res, ...args);
      }
    }

    const callbackPath = url.parse(callbackUrl).pathname;
    if (pathname === callbackPath) {
      try {
        const { state, code } = querystring.parse(query || '');
        const clientState = req.cookies[cookieName];

        if (!clientState) {
          const err = new Error('Invalid state');
          args.push({ err, provider });
          expireCookie(res, cookieName);
          return fn(req, res, ...args);
        }

        const storedState = JSON.parse(clientState);

        if (!state || !storedState || storedState.state !== state) {
          const err = new Error('Invalid state');
          args.push({ err, provider });
          expireCookie(res, cookieName);
          return fn(req, res, ...args);
        }

        const response = await fetchJson({
          method: 'GET',
          url: getAccessTokenUrl(code as string),
        });

        const accessToken = response.access_token;
        const info = await fetchJson({
          method: 'GET',
          url: getUserInfoUrl(accessToken),
        });

        const result = {
          provider,
          accessToken,
          info,
        };

        args.push({ result, storedState });

        expireCookie(res, cookieName);

        return fn(req, res, ...args);
      } catch (err) {
        args.push({ err: sanitizeOauthError(err, provider), provider });
        return fn(req, res, ...args);
      }
    }

    return fn(req, res, ...args);
  };
};

const handler = microCookie(microAuthFacebook) as (
  options: object,
) => (fn: NextOauthApiHandler) => NextOauthApiHandler;

export default handler;
