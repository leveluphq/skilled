import { Credentials } from 'google-auth-library';
import { StoredState } from 'utils/constants/auth';

// https://developers.google.com/identity/protocols/oauth2/openid-connect
export interface GoogleResponse {
  err: object | null;
  result: {
    provider: string;
    tokens: Credentials;
    info: {
      id: string;
      email: string;
      // The v2 userinfo endpoint returns `verified_email`; the OpenID Connect
      // endpoint returns `email_verified`. Accept either.
      verified_email?: boolean;
      email_verified?: boolean;
      picture?: string;
      name?: string;
      family_name?: string;
      given_name?: string;
      locale?: string;
    };
  };
  storedState: StoredState;
}
