import { NextApiResponse } from 'next';
import microAuthGithub from 'services/server/auth/microAuthGithub';
// @ts-ignore no typings
import redirect from 'micro-redirect';
import querystring from 'querystring';
import getGithubEmails from 'services/server/auth/getGithubEmails';
import getUserByEmail from 'services/server/graphql/queries/getUserByEmail';
import getUserByGithubNodeId from 'services/server/graphql/queries/getUserByGithubNodeId';
import updateUserGithubDetails from 'services/server/graphql/mutations/updateUserGithubDetails';
import insertUserFromGithub from 'services/server/graphql/mutations/insertUserFromGithub';
import insertAlternateEmails from 'services/server/graphql/mutations/insertAlternateEmails';
import linkStripeCustomer from 'services/server/stripe/linkStripeCustomer';
import { setAuthToken } from 'utils/server/jwt';
import { GithubEmail, GitHubResponse } from 'utils/constants/github';
import { createErrorObject, getSafeRedirectPath } from 'utils/server/http';
import {
  IncomingMessageWithCookies,
  OauthProvider,
  UNABLE_TO_OAUTH,
  UNVERIFIED_OAUTH_EMAIL,
} from 'utils/constants/auth';
import { subscribeToList, ListTag } from 'services/server/email/contacts';
import {
  sendTransactionalEmailFromTemplate,
  TemplateTag,
} from 'services/server/email/transactional';
import Sentry, { configureReq } from 'utils/shared/sentry';
import { PageRoot } from 'utils/constants/routes';
import { Users } from 'types/generated/server';
import { encrypt } from 'services/server/encryption';
import sanitizeOauthError from 'services/server/auth/sanitizeOauthError';

const options = {
  clientId: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackUrl: `${process.env.ROOT_URL}/api/auth/github/callback`,
  path: '/api/auth/github',
  scope: 'user:email',
};

const githubAuth = microAuthGithub(options);

const getPrimaryEmail = (emails: GithubEmail[]) => emails.find((email) => email.primary);

const buildAlternateEmails = (emails: GithubEmail[], userId: string) =>
  emails.map((e) => ({ email: e.email, userId, source: OauthProvider.Github }));

const handler = async (
  req: IncomingMessageWithCookies,
  res: NextApiResponse,
  auth?: GitHubResponse,
) => {
  configureReq(req);

  if (!auth) {
    Sentry.withScope((_scope) => {
      Sentry.captureException(new Error('Account not found'));
    });

    console.log('--- NO AUTH +++');
    return res.status(404).send(
      createErrorObject({
        message: 'Account not found',
        statusCode: 404,
      }),
    );
  }

  if (auth.err || !auth.result.accessToken) {
    Sentry.withScope((scope) => {
      scope.setTag('oauth_provider', OauthProvider.Github);
      // Never pass the provider error itself: it carries our client secret.
      Sentry.captureException(sanitizeOauthError(auth.err, OauthProvider.Github));
    });

    return res.status(403).send(createErrorObject({ ...UNABLE_TO_OAUTH, statusCode: 403 }));
  }

  try {
    const emails = await getGithubEmails(auth.result.accessToken);
    const primaryEmail = getPrimaryEmail(emails);

    if (!primaryEmail) {
      return res.status(403).send(createErrorObject({ ...UNABLE_TO_OAUTH, statusCode: 403 }));
    }

    const [emailUser, githubUser] = await Promise.all([
      getUserByEmail(primaryEmail.email),
      getUserByGithubNodeId(auth.result.info.node_id),
    ]);
    let existingUser;

    if (githubUser) {
      existingUser = githubUser;
    } else if (emailUser) {
      // GitHub lets an account add any address and mark it primary before
      // confirming it, so an unverified match proves nothing about ownership.
      if (!primaryEmail.verified) {
      return res.status(403).send(
        createErrorObject({ ...UNVERIFIED_OAUTH_EMAIL, statusCode: 403 }),
      );
      }

      existingUser = emailUser;
    }

    // Encrypt the GitHub access token before storage
    let encryptedAccessToken: string;
    try {
      encryptedAccessToken = encrypt(auth.result.accessToken);
    } catch (encryptionError) {
      // Log encryption error to Sentry without exposing the token
      Sentry.withScope((scope) => {
        scope.setContext('encryption', {
          error: encryptionError instanceof Error ? encryptionError.message : 'Unknown error',
          provider: 'github',
        });
        Sentry.captureException(
          new Error('Failed to encrypt GitHub OAuth token')
        );
      });

      // Return user-friendly error without exposing details
      return res.status(500).send(
        createErrorObject({
          message: 'Authentication failed. Please try again.',
          statusCode: 500,
        }),
      );
    }

    if (existingUser) {
      await updateUserGithubDetails({
        id: existingUser.id,
        githubProfile: auth.result.info,
        githubUsername: auth.result.info.login,
        githubNodeId: auth.result.info.node_id,
        githubId: auth.result.info.id,
        githubAccessToken: encryptedAccessToken,
      });
    } else {
      const insertResponse = await insertUserFromGithub({
        registrationSource: OauthProvider.Github,
        email: primaryEmail.email,
        name: auth.result.info.name,
        githubUsername: auth.result.info.login,
        githubProfile: auth.result.info,
        githubNodeId: auth.result.info.node_id,
        githubId: auth.result.info.id,
        githubAccessToken: encryptedAccessToken,
        bio: auth.result.info.bio,
        image: auth.result.info.avatar_url,
        location: auth.result.info.location,
        website: auth.result.info.blog,
        company: auth.result.info.company,
      });

      existingUser = insertResponse!.insert_users!.returning[0];
      const { id, email } = existingUser;

      await linkStripeCustomer({ id, email });

      try {
        const INCLUDE_IN_ALL_USERS_LIST = true;
        await subscribeToList(email, ListTag.RegisteredUsers, INCLUDE_IN_ALL_USERS_LIST);
        await sendTransactionalEmailFromTemplate(email, TemplateTag.AccountCreate);
      } catch (error) {
        Sentry.withScope((_scope) => {
          Sentry.captureException(error);
        });
      }
    }

    const userId = existingUser.id;
    const alternateEmails = buildAlternateEmails(emails || [], userId);

    if (alternateEmails && alternateEmails.length > 0) {
      await insertAlternateEmails({ emails: alternateEmails });
    }

    setAuthToken(existingUser as Users, res);

    const storyQuery = querystring.parse(auth.storedState.query || '');
    // `next` originates in the query string of the login link, so it is
    // attacker-controlled and must be constrained to a same-origin path.
    const next = getSafeRedirectPath(storyQuery.next);
    const product = storyQuery.product;

    if (product) {
      return redirect(res, 302, `/${PageRoot.Checkout}?product=${product}`);
    }

    return redirect(res, 302, next);
  } catch (error) {
    Sentry.withScope((_scope) => {
      Sentry.captureException(error);
    });

    return redirect(res, 302, '/');
  }
};

export default githubAuth(handler);
