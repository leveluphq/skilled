import microAuthGoogle from 'services/server/auth/microAuthGoogle';
// @ts-ignore no typings
import redirect from 'micro-redirect';
import { NextApiResponse } from 'next';
import querystring from 'querystring';
import Sentry, { configureReq } from 'utils/shared/sentry';
import { GoogleResponse } from 'utils/constants/google';
import { createErrorObject, getSafeRedirectPath } from 'utils/server/http';
import {
  IncomingMessageWithCookies,
  OauthProvider,
  UNABLE_TO_OAUTH,
  UNVERIFIED_OAUTH_EMAIL,
} from 'utils/constants/auth';
import getUserByEmail from 'services/server/graphql/queries/getUserByEmail';
import getUserByGoogleId from 'services/server/graphql/queries/getUserByGoogleId';
import updateUserGoogleDetails from 'services/server/graphql/mutations/updateUserGoogleDetails';
import insertUserFromGoogle from 'services/server/graphql/mutations/insertUserFromGoogle';
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
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  scopes: ['openid', 'email', 'profile'],
  callbackUrl: `${process.env.ROOT_URL}/api/auth/google/callback`,
  path: '/api/auth/google',
  accessType: 'offline',
};

const googleAuth = microAuthGoogle(options);

const handler = async (
  req: IncomingMessageWithCookies,
  res: NextApiResponse,
  auth?: GoogleResponse,
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

  if (auth.err || !auth.result.tokens?.access_token || !auth.result.info?.email) {
    Sentry.withScope((scope) => {
      scope.setTag('oauth_provider', OauthProvider.Google);
      // Never pass the provider error itself: it carries our client secret.
      Sentry.captureException(sanitizeOauthError(auth.err, OauthProvider.Google));
    });

    return res.status(403).send(createErrorObject({ ...UNABLE_TO_OAUTH, statusCode: 403 }));
  }

  try {
    const { email, id } = auth.result.info;
    const isEmailVerified = Boolean(
      auth.result.info.verified_email ?? auth.result.info.email_verified,
    );
    const [emailUser, googleUser] = await Promise.all([
      getUserByEmail(email!),
      getUserByGoogleId(id),
    ]);
    let existingUser;

    if (googleUser) {
      existingUser = googleUser;
    } else if (emailUser) {
      // Matching on email alone would let anyone who can assert an address at the
      // provider take over the account that already owns it. Only an address the
      // provider vouches for is proof of ownership.
      if (!isEmailVerified) {
      return res.status(403).send(
        createErrorObject({ ...UNVERIFIED_OAUTH_EMAIL, statusCode: 403 }),
      );
      }

      existingUser = emailUser;
    }

    // Encrypt all Google OAuth tokens before storage
    let encryptedAccessToken: string;
    let encryptedRefreshToken: string | undefined;
    let encryptedIdToken: string | undefined;

    try {
      encryptedAccessToken = encrypt(auth.result.tokens.access_token);
      encryptedRefreshToken = auth.result.tokens.refresh_token
        ? encrypt(auth.result.tokens.refresh_token)
        : undefined;
      encryptedIdToken = auth.result.tokens.id_token
        ? encrypt(auth.result.tokens.id_token)
        : undefined;
    } catch (encryptionError) {
      // Log encryption error to Sentry without exposing the tokens
      Sentry.withScope((scope) => {
        scope.setContext('encryption', {
          error: encryptionError instanceof Error ? encryptionError.message : 'Unknown error',
          provider: 'google',
        });
        Sentry.captureException(
          new Error('Failed to encrypt Google OAuth tokens')
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
      await updateUserGoogleDetails({
        id: existingUser.id,
        googleProfile: auth.result.info,
        googleId: auth.result.info.id,
        googleEmailVerified: isEmailVerified,
        googleAccessToken: encryptedAccessToken,
        googleRefreshToken: encryptedRefreshToken,
        googleTokenExpiryDate: String(auth.result.tokens.expiry_date),
        googleTokenType: auth.result.tokens.token_type,
        googleIdToken: encryptedIdToken,
        locale: auth.result.info.locale,
      });
    } else {
      // create user
      // add alternate emails
      const insertResponse = await insertUserFromGoogle({
        registrationSource: OauthProvider.Google,
        email: auth.result.info.email!,
        name: auth.result.info.name,
        googleProfile: auth.result.info,
        googleId: auth.result.info.id,
        googleEmailVerified: isEmailVerified,
        googleAccessToken: encryptedAccessToken,
        googleRefreshToken: encryptedRefreshToken,
        googleTokenExpiryDate: String(auth.result.tokens.expiry_date),
        googleTokenType: auth.result.tokens.token_type,
        googleIdToken: encryptedIdToken,
        image: auth.result.info.picture,
        firstName: auth.result.info.given_name,
        lastName: auth.result.info.family_name,
        locale: auth.result.info.locale,
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

export default googleAuth(handler);
