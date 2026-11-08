import { NextApiResponse } from 'next';
import { IncomingMessage } from 'http';

export const HASURA_CLAIMS_KEY = 'https://hasura.io/jwt/claims';

// This should actually be an enym
export enum HasuraClaimKey {
  AllowedRoles = 'x-hasura-allowed-roles',
  DefaultRole = 'x-hasura-default-role',
  UserID = 'x-hasura-user-id',
}

export enum OauthProvider {
  Facebook = 'facebook',
  Github = 'github',
  Google = 'google',
}

export enum Company {
  Facebook = 'facebook',
  Twitter = 'twitter',
  Google = 'google',
  Linkedin = 'linkedin',
  Github = 'github',
}

export interface IncomingMessageWithCookies extends IncomingMessage {
  cookies: {
    [key: string]: string;
  };
}

export const UNABLE_TO_OAUTH = {
  message: 'Unable to register your account using OAuth',
};

export const UNVERIFIED_OAUTH_EMAIL = {
  message:
    'This email is already registered but the provider has not verified that you own it. Sign in with the provider you originally used, then link this account from your settings.',
};

export type NextOauthApiHandler<T = any> = (
  req: IncomingMessageWithCookies,
  res: NextApiResponse<T>,
  ...args: any[]
) => void | Promise<void>;

export interface StoredState {
  state: string;
  query?: string;
}
