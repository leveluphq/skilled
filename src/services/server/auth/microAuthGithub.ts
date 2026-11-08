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

const provider = OauthProvider.Github;
const cookieName = getAuthCookieName(provider);

const wait = (TIMEOUT = 1000) => {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      return resolve();
    }, TIMEOUT);
  });
};

interface Options {
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
  path: string;
  scope: string | string[];
}

const microAuthGithub = ({
  clientId,
  clientSecret,
  callbackUrl,
  path = '/api/auth/github',
  scope = 'user:email',
}: Options) => {
  const getRedirectUrl = (state: string) => {
    return `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${callbackUrl}&scope=${scope}&state=${state}`;
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

        await wait();

        const response = await fetchJson({
          method: 'POST',
          url: 'https://github.com/login/oauth/access_token',
          body: {
            // eslint-disable-next-line camelcase
            client_id: clientId,
            // eslint-disable-next-line camelcase
            client_secret: clientSecret,
            code,
          },
        });

        if (response.error) {
          args.push({ err: sanitizeOauthError(response.error, provider), provider });
          return fn(req, res, ...args);
        }

        const accessToken = response.access_token;
        const user = await fetchJson({
          method: 'GET',
          url: 'https://api.github.com/user',
          headers: {
            Authorization: `token ${accessToken}`,
            'User-Agent': 'Skilled-dev',
          },
        });

        const result = {
          provider,
          accessToken,
          info: user,
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

const handler = microCookie(microAuthGithub) as (
  options: object,
) => (fn: NextOauthApiHandler) => NextOauthApiHandler;

export default handler;
