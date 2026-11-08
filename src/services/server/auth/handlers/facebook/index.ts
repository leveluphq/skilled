import microAuthFacebook from 'services/server/auth/microAuthFacebook';
// @ts-ignore no typings
import redirect from 'micro-redirect';
import { NextApiResponse } from 'next';
import querystring from 'querystring';
import Sentry, { configureReq } from 'utils/shared/sentry';
import { FacebookResponse } from 'utils/constants/facebook';
import { createErrorObject, getSafeRedirectPath } from 'utils/server/http';
import { IncomingMessageWithCookies, OauthProvider, UNABLE_TO_OAUTH } from 'utils/constants/auth';
import getUserByEmail from 'services/server/graphql/queries/getUserByEmail';
import getUserByFacebookId from 'services/server/graphql/queries/getUserByFacebookId';
import updateUserFacebookDetails from 'services/server/graphql/mutations/updateUserFacebookDetails';
import insertUserFromFacebook from 'services/server/graphql/mutations/insertUserFromFacebook';
import linkStripeCustomer from 'services/server/stripe/linkStripeCustomer';
import { subscribeToList, ListTag } from 'services/server/email/contacts';
import {
  sendTransactionalEmailFromTemplate,
  TemplateTag,
} from 'services/server/email/transactional';
import { setAuthToken } from 'utils/server/jwt';
import { PageRoot } from 'utils/constants/routes';
import { Users } from 'types/generated/server';
import { encrypt } from 'services/server/encryption';
import sanitizeOauthError from 'services/server/auth/sanitizeOauthError';

const options = {
  appId: process.env.FACEBOOK_APP_ID,
  appSecret: process.env.FACEBOOK_APP_SECRET,
  callbackUrl: `${process.env.ROOT_URL}/api/auth/facebook/callback`,
  path: '/api/auth/facebook',
  fields: 'id,name,email,picture,first_name,middle_name,last_name,name_format,short_name', // Check fields list here: https://developers.facebook.com/docs/graph-api/reference/v2.11/user
  scope: 'public_profile,email', // Check permissions list here: https://developers.facebook.com/docs/facebook-login/permissions
  apiVersion: '6.0',
};

const facebookAuth = microAuthFacebook(options);

const handler = async (
  req: IncomingMessageWithCookies,
  res: NextApiResponse,
  auth?: FacebookResponse,
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

  if (auth.err || !auth.result.accessToken || !auth.result.info?.email) {
    Sentry.withScope((scope) => {
      scope.setTag('oauth_provider', OauthProvider.Facebook);
      // Never pass the provider error itself: it carries our client secret.
      Sentry.captureException(sanitizeOauthError(auth.err, OauthProvider.Facebook));
    });

    return res.status(403).send(createErrorObject({ ...UNABLE_TO_OAUTH, statusCode: 403 }));
  }

  try {
    const { email, id } = auth.result.info;
    const [emailUser, facebookUser] = await Promise.all([
      getUserByEmail(email!),
      getUserByFacebookId(id),
    ]);
    let existingUser;

    if (facebookUser) {
      existingUser = facebookUser;
    } else if (emailUser) {
      // Facebook exposes no per-address verification flag, but the Graph API only
      // returns `email` once the account holder has confirmed it, so reaching here
      // already implies a provider-confirmed address.
      existingUser = emailUser;
    }

    // Encrypt the Facebook access token before storage
    let encryptedAccessToken: string;
    try {
      encryptedAccessToken = encrypt(auth.result.accessToken);
    } catch (encryptionError) {
      // Log encryption error to Sentry without exposing the token
      Sentry.withScope((scope) => {
        scope.setContext('encryption', {
          error: encryptionError instanceof Error ? encryptionError.message : 'Unknown error',
          provider: 'facebook',
        });
        Sentry.captureException(
          new Error('Failed to encrypt Facebook OAuth token')
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
      // update user and add new alternate emails
      await updateUserFacebookDetails({
        id: existingUser.id,
        facebookProfile: auth.result.info,
        facebookId: auth.result.info.id,
        facebookAccessToken: encryptedAccessToken,
      });
    } else {
      // create user
      // add alternate emails
      const insertResponse = await insertUserFromFacebook({
        registrationSource: OauthProvider.Facebook,
        email: auth.result.info.email!,
        name: auth.result.info.name,
        facebookProfile: auth.result.info,
        facebookId: auth.result.info.id,
        facebookAccessToken: encryptedAccessToken,
        image: auth.result.info.picture?.url,
        firstName: auth.result.info.first_name,
        middleName: auth.result.info.middle_name,
        lastName: auth.result.info.last_name,
        nameFormat: auth.result.info.name_format,
        shortName: auth.result.info.short_name,
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

export default facebookAuth(handler);
