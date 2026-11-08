import { NextApiResponse, NextApiRequest } from 'next';
import { ServerResponse } from 'http';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { Role } from 'utils/constants/user';
import { CookieSerializeOptions } from 'cookie';
import { setCookie, expireCookie } from 'utils/server/http';
import { getViewerFromToken } from 'utils/shared/auth';
import { HASURA_CLAIMS_KEY, HasuraClaimKey } from 'utils/constants/auth';
import { Users } from 'types/generated/server';

/**
 * Validates that a secret is a 64-byte base64-encoded string
 */
function validateJWTSecret(secret: string): boolean {
  if (!secret || typeof secret !== 'string') {
    return false;
  }

  try {
    const decoded = Buffer.from(secret, 'base64');
    const reencoded = decoded.toString('base64');

    // Check round-trip encoding and length
    return reencoded === secret && decoded.length === 64;
  } catch {
    return false;
  }
}

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_TOKEN_NAME = process.env.JWT_TOKEN_NAME!;
const JWT_VIEWER_COOKIE_NAME = `${JWT_TOKEN_NAME}-viewer`;
const NODE_ENV = process.env.NODE_ENV;
const secure = NODE_ENV !== 'development';
// const yearInSeconds = 60 * 60 * 24 * 365;
const monthInSeconds = 60 * 60 * 24 * 30;
const authMaxAge = monthInSeconds;
const domain = process.env.ROOT_DOMAIN || '';

// Validate JWT_SECRET on module initialization
if (!JWT_SECRET) {
  throw new Error(
    'JWT_SECRET environment variable is required. ' +
      'Generate a secure 64-byte secret with: openssl rand -base64 64 | tr -d "\\n"'
  );
}

if (!validateJWTSecret(JWT_SECRET)) {
  console.error(
    'WARNING: JWT_SECRET is not a valid 64-byte base64-encoded string. ' +
      'This is a security risk. Generate a new secret with: openssl rand -base64 64 | tr -d "\\n"'
  );
  // In development, log warning but allow execution
  // In production, throw error
  if (NODE_ENV === 'production') {
    throw new Error(
      'JWT_SECRET must be a valid 64-byte base64-encoded string. ' +
        'Generate one with: openssl rand -base64 64 | tr -d "\\n"'
    );
  }
}

interface HasuraClaims {
  [HasuraClaimKey.AllowedRoles]: string[];
  [HasuraClaimKey.DefaultRole]: string;
  [HasuraClaimKey.UserID]: string;
}

export interface SessionToken {
  tokenId: string;
  sub: string;
  iat: number;
  exp: number;
  [HASURA_CLAIMS_KEY]: HasuraClaims;
  admin?: boolean;
}

export const cookieOptions: CookieSerializeOptions = {
  maxAge: authMaxAge,
  secure,
  httpOnly: true,
  sameSite: 'lax',
  path: '/',
  domain,
};

const buildHasuraClaims = (user: Users) => {
  return {
    [HasuraClaimKey.AllowedRoles]: [Role.User, Role.Anonymous],
    [HasuraClaimKey.DefaultRole]: Role.User,
    [HasuraClaimKey.UserID]: user.id,
  };
};

interface ViewerCookieSession {
  id: string;
  role: string;
  name: string | null;
  image: string | null;
  exp: number;
}

const createUserSession = (user: Users) => {
  const iat = Math.floor(Date.now() / 1000);

  const sessionToken: SessionToken = {
    tokenId: randomUUID(),
    sub: user.id,
    iat,
    exp: iat + authMaxAge,
    [HASURA_CLAIMS_KEY]: buildHasuraClaims(user),
  };

  if (user.role === Role.Admin) {
    sessionToken.admin = true;
    sessionToken[HASURA_CLAIMS_KEY][HasuraClaimKey.DefaultRole] = Role.Admin;
    sessionToken[HASURA_CLAIMS_KEY][HasuraClaimKey.AllowedRoles].push(Role.Admin);
  }

  const token = jwt.sign(sessionToken, JWT_SECRET);

  return { token, sessionToken };
};

const createViewerCookieSession = (user: Users, exp: number): ViewerCookieSession => {
  return {
    id: user.id,
    role: user.role,
    name: user.name || null,
    image: user.image || null,
    exp,
  };
};

export const setAuthToken = (user: Users, res: NextApiResponse) => {
  if (user) {
    const { token, sessionToken } = createUserSession(user);
    setCookie({ res, name: JWT_TOKEN_NAME, value: token, ...cookieOptions });

    const viewerSession = createViewerCookieSession(user, sessionToken.exp);
    setCookie({
      res,
      name: JWT_VIEWER_COOKIE_NAME,
      value: JSON.stringify(viewerSession),
      maxAge: authMaxAge,
      secure,
      httpOnly: false,
      sameSite: 'lax',
      path: '/',
      domain,
    });
  }

  return user;
};

export const logout = (res: ServerResponse | NextApiResponse) => {
  expireCookie(res, JWT_TOKEN_NAME);
  expireCookie(res, JWT_VIEWER_COOKIE_NAME);
  return;
};

export const getAuthToken = (
  cookies: Partial<{
    [key: string]: string;
  }> = {},
) => {
  return cookies[JWT_TOKEN_NAME];
};

export const isValidToken = (token: string) => {
  try {
    jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
    return true;
  } catch (error) {
    return false;
  }
};

export const tokenContainsViewer = (token: string) => {
  const isValid = !!token && isValidToken(token);

  if (!isValid) {
    return false;
  }

  const viewer = getViewerFromToken(token);

  return !!viewer.id;
};

export const getValidViewerId = (req: NextApiRequest) => {
  const { cookies } = req;
  const token = getAuthToken(cookies);

  if (!token || !tokenContainsViewer(token)) {
    return '';
  }

  const viewer = getViewerFromToken(token);

  return viewer.id;
};
