import { NextApiResponse } from 'next';
import querystring from 'querystring';
import url from 'url';
import { randomUUID } from 'crypto';
import { OAuth2Client } from 'google-auth-library';
// @ts-ignore no typings
import redirect from 'micro-redirect';
// @ts-ignore no typings
import microCookie from 'micro-cookie';
import { setOauthStateCookie, expireCookie } from 'utils/server/http';
import {
  IncomingMessageWithCookies,
  OauthProvider,
  NextOauthApiHandler,
} from 'utils/constants/auth';
import getAuthCookieName from './getAuthCookieName';
import sanitizeOauthError from './sanitizeOauthError';

const provider = OauthProvider.Google;
const cookieName = getAuthCookieName(provider);
/**
 * OpenID 2.0 compliance:
 * https://developers.google.com/identity/protocols/OpenIDConnect?hl=en#discovery
 */
const SCOPES = ['openid', 'email', 'profile'];
const USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

interface Options {
  clientId: string;
  clientSecret: string;
  scopes?: string[];
  callbackUrl: string;
  path: string;
  accessType?: string;
}

const microAuthGoogle = ({
  clientId,
  clientSecret,
  callbackUrl,
  path,
  scopes = SCOPES,
  accessType = 'offline',
}: Options) => {
  return (fn: NextOauthApiHandler) => async (
    req: IncomingMessageWithCookies,
    res: NextApiResponse,
    ...args: any[]
  ) => {
    const client = new OAuth2Client({ clientId, clientSecret, redirectUri: callbackUrl });
    const { pathname, query } = url.parse(req.url as string);

    if (pathname === path) {
      try {
        const state = randomUUID();
        const redirectUrl = client.generateAuthUrl({
          // eslint-disable-next-line camelcase
          access_type: accessType,
          scope: scopes,
          state,
        });

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

        const { tokens } = await client.getToken(code as string);

        client.setCredentials(tokens);

        const { data } = await client.request({
          url: USERINFO_URL,
        });

        const result = {
          provider,
          info: data,
          tokens,
        };

        args.push({ result, storedState });

        expireCookie(res, cookieName);

        return fn(req, res, ...args);
      } catch (err) {
        args.push({ err: sanitizeOauthError(err, provider), provider });
        expireCookie(res, cookieName);

        return fn(req, res, ...args);
      }
    }

    return fn(req, res, ...args);
  };
};

const handler = microCookie(microAuthGoogle) as (
  options: object,
) => (fn: NextOauthApiHandler) => NextOauthApiHandler;

export default handler;
