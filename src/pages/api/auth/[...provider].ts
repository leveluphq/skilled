import { NextApiRequest, NextApiResponse } from 'next';
import Sentry, { configureReq } from 'utils/shared/sentry';
import { OauthProvider } from 'utils/constants/auth';
import facebookHandler from 'services/server/auth/handlers/facebook';
import googleHandler from 'services/server/auth/handlers/google';
import githubHandler from 'services/server/auth/handlers/github';
import { applySecurityHeaders } from 'services/server/security/headers';

const handlers = {
  [OauthProvider.Facebook]: facebookHandler,
  [OauthProvider.Google]: googleHandler,
  [OauthProvider.Github]: githubHandler,
};

const isValidProvider = (provider: string) => {
  const lowerCaseProvider = provider.toLowerCase();

  return (
    lowerCaseProvider === OauthProvider.Facebook ||
    lowerCaseProvider === OauthProvider.Google ||
    lowerCaseProvider === OauthProvider.Github
  );
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  applySecurityHeaders(res);
  configureReq(req);

  const provider = req?.query?.provider?.[0].toLowerCase();

  if (provider && !isValidProvider(provider)) {
    Sentry.withScope((_scope) => {
      Sentry.captureException(new Error('Invalid API route'));
    });

    return res.status(404).send('Invalid auth route');
  }

  // TODO: Once you log in to a page successfully, redirect to a page that gets the auth token from the server and stores it in local storage
  // @ts-ignore
  return handlers[provider as OauthProvider](req, res);
};

export default handler;
