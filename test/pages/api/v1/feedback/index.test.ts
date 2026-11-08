/**
 * Tests for `src/pages/api/v1/feedback/index.ts`.
 *
 * The Hasura insert and the SendinBlue email are mocked at the module boundary;
 * the JWT is real (signed in-process) so the "who is this feedback attributed
 * to" assertions exercise the actual session verification.
 */

import { createMocks, RequestOptions } from 'node-mocks-http';
import jwt from 'jsonwebtoken';
import type { NextApiRequest, NextApiResponse } from 'next';

jest.mock('services/server/graphql/mutations/insertUserFeedback', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('services/server/email/transactional', () => ({
  __esModule: true,
  sendTransactionalEmailFromTemplate: jest.fn(),
  TemplateTag: {
    AccountCreate: 'ACCOUNT_CREATE',
    FeedbackReceived: 'FEEDBACK_RECEIVED',
    CheckoutSessionCreated: 'CHECKOUT_SESSION_CREATED',
    CheckoutComplete: 'CHECKOUT_COMPLETE',
  },
}));

const JWT_SECRET = Buffer.alloc(64, 'f').toString('base64');
const JWT_TOKEN_NAME = 'skilled-feedback-token';
const HASURA_CLAIMS_KEY = 'https://hasura.io/jwt/claims';
const NOTIFICATION_EMAIL = 'internal@skilled.test';

const originalEnv = { ...process.env };

Object.assign(process.env, {
  JWT_SECRET,
  JWT_TOKEN_NAME,
  ROOT_DOMAIN: 'skilled.test',
  ROOT_URL: 'https://skilled.test',
  GRAPHQL_URL: 'https://hasura.internal.test/v1/graphql',
  HASURA_GRAPHQL_ADMIN_SECRET: 'admin-secret',
  INTERNAL_NOTIFICATION_EMAIL: NOTIFICATION_EMAIL,
});

// eslint-disable-next-line @typescript-eslint/no-var-requires
const insertUserFeedback = require('services/server/graphql/mutations/insertUserFeedback')
  .default as jest.Mock;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { sendTransactionalEmailFromTemplate } = require('services/server/email/transactional') as {
  sendTransactionalEmailFromTemplate: jest.Mock;
};
// eslint-disable-next-line @typescript-eslint/no-var-requires
const handler = require('pages/api/v1/feedback/index').default as (
  req: NextApiRequest,
  res: NextApiResponse,
) => Promise<void>;

const signToken = (userId: string, secret = JWT_SECRET) =>
  jwt.sign(
    {
      tokenId: 'token-id',
      sub: userId,
      [HASURA_CLAIMS_KEY]: {
        'x-hasura-allowed-roles': ['user', 'anonymous'],
        'x-hasura-default-role': 'user',
        'x-hasura-user-id': userId,
      },
    },
    secret,
    { expiresIn: '1h' },
  );

const VALID_BODY = {
  url: 'https://skilled.dev/course/arrays',
  name: 'Ada',
  email: 'ada@example.com',
  feedback: 'The editor lags on large inputs',
};

type CallOptions = Omit<RequestOptions, 'body'> & { body?: unknown };

const call = async (options: CallOptions = {}) => {
  const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
    method: 'POST',
    headers: { 'x-forwarded-for': '203.0.113.9' },
    body: VALID_BODY,
    ...options,
  } as RequestOptions);

  await handler(req, res);

  return res;
};

describe('api/v1/feedback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    insertUserFeedback.mockResolvedValue({
      insert_user_feedback: { returning: [{ id: 'feedback-1' }] },
    });
    sendTransactionalEmailFromTemplate.mockResolvedValue(undefined);
  });

  afterAll(() => {
    process.env = { ...originalEnv };
  });

  describe('request validation', () => {
    it('rejects non-POST requests with 405 and an Allow header', async () => {
      const res = await call({ method: 'GET' });

      expect(res._getStatusCode()).toBe(405);
      expect(res.getHeader('Allow')).toEqual(['POST']);
      expect(insertUserFeedback).not.toHaveBeenCalled();
    });

    it.each([
      ['an empty object', {}],
      ['an empty feedback string', { ...VALID_BODY, feedback: '' }],
      ['a null feedback field', { ...VALID_BODY, feedback: null }],
    ])('rejects %s with 400 and writes nothing', async (_label, body) => {
      const res = await call({ body });

      expect(res._getStatusCode()).toBe(400);
      expect(res._getData()).toEqual({ message: 'Request body not found', statusCode: 400 });
      expect(insertUserFeedback).not.toHaveBeenCalled();
      expect(sendTransactionalEmailFromTemplate).not.toHaveBeenCalled();
    });

    it('rejects a request with no parsed body with 400 instead of throwing', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({ method: 'POST' });
      (req as { body?: unknown }).body = undefined;

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(insertUserFeedback).not.toHaveBeenCalled();
    });

    it('stores whitespace-only feedback as-is because only falsiness is checked', async () => {
      const res = await call({ body: { ...VALID_BODY, feedback: '   ' } });

      // BUG: `!body.feedback` passes for "   ", so blank submissions are written
      // to the database and emailed. The check should trim before testing.
      expect(res._getStatusCode()).toBe(200);
      expect(insertUserFeedback.mock.calls[0][0].feedback).toBe('   ');
    });

    it('accepts unbounded feedback with no length limit', async () => {
      const huge = 'A'.repeat(1_000_000);

      const res = await call({ body: { ...VALID_BODY, feedback: huge } });

      // BUG: there is no maximum length (nor any recaptcha - see the TODO in the
      // handler), so a single unauthenticated request can push a 1MB row into
      // Hasura and a 1MB email into the transactional provider.
      expect(res._getStatusCode()).toBe(200);
      expect(insertUserFeedback.mock.calls[0][0].feedback).toHaveLength(1_000_000);
    });
  });

  describe('attribution', () => {
    it('records an anonymous submission with a null user id', async () => {
      await call();

      expect(insertUserFeedback).toHaveBeenCalledWith(
        expect.objectContaining({ userId: null, ip: '203.0.113.9' }),
      );
    });

    it('attributes the submission to the verified session user', async () => {
      await call({ cookies: { [JWT_TOKEN_NAME]: signToken('user-77') } });

      expect(insertUserFeedback).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user-77' }),
      );
    });

    it('ignores a userId and ip supplied in the request body', async () => {
      await call({
        cookies: { [JWT_TOKEN_NAME]: signToken('user-77') },
        body: { ...VALID_BODY, userId: 'someone-else', ip: '10.0.0.1' },
      });

      const payload = insertUserFeedback.mock.calls[0][0];

      expect(payload.userId).toBe('user-77');
      expect(payload.ip).toBe('203.0.113.9');
    });

    it('treats a token signed with the wrong secret as anonymous', async () => {
      const forged = signToken('admin-user', Buffer.alloc(64, 'z').toString('base64'));

      await call({ cookies: { [JWT_TOKEN_NAME]: forged } });

      expect(insertUserFeedback).toHaveBeenCalledWith(expect.objectContaining({ userId: null }));
    });

    it('treats an expired session as anonymous rather than failing the request', async () => {
      const expired = jwt.sign(
        {
          sub: 'user-77',
          [HASURA_CLAIMS_KEY]: {
            'x-hasura-allowed-roles': ['user'],
            'x-hasura-default-role': 'user',
            'x-hasura-user-id': 'user-77',
          },
        },
        JWT_SECRET,
        { expiresIn: -60 },
      );

      const res = await call({ cookies: { [JWT_TOKEN_NAME]: expired } });

      expect(res._getStatusCode()).toBe(200);
      expect(insertUserFeedback).toHaveBeenCalledWith(expect.objectContaining({ userId: null }));
    });
  });

  describe('notification email', () => {
    it('notifies the internal address with the stored feedback id', async () => {
      await call({ cookies: { [JWT_TOKEN_NAME]: signToken('user-77') } });

      expect(sendTransactionalEmailFromTemplate).toHaveBeenCalledWith(
        NOTIFICATION_EMAIL,
        'FEEDBACK_RECEIVED',
        {
          feedback: VALID_BODY.feedback,
          url: VALID_BODY.url,
          name: VALID_BODY.name,
          email: VALID_BODY.email,
          userId: 'user-77',
          feedbackId: 'feedback-1',
        },
      );
    });

    it('still returns 200 when the email provider throws', async () => {
      sendTransactionalEmailFromTemplate.mockRejectedValue(new Error('sendinblue down'));

      const res = await call();

      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual({ success: true });
      expect(insertUserFeedback).toHaveBeenCalledTimes(1);
    });

    it('still returns 200 when the email provider throws synchronously', async () => {
      sendTransactionalEmailFromTemplate.mockImplementation(() => {
        throw new Error('missing api key');
      });

      const res = await call();

      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual({ success: true });
    });

    it('swallows a malformed insert response and skips the email', async () => {
      insertUserFeedback.mockResolvedValue({ insert_user_feedback: { returning: [] } });

      const res = await call();

      // BUG: `returning[0].id` is not guarded (only `insert_user_feedback` is
      // optional-chained), so an empty `returning` throws a TypeError that the
      // inner catch swallows - the feedback is saved but nobody is notified.
      expect(res._getStatusCode()).toBe(200);
      expect(sendTransactionalEmailFromTemplate).not.toHaveBeenCalled();
    });
  });

  describe('persistence failure', () => {
    it('returns a generic 500 and does not email when the insert fails', async () => {
      insertUserFeedback.mockRejectedValue(new Error('hasura: permission denied for user_feedback'));

      const res = await call();

      expect(res._getStatusCode()).toBe(500);
      expect(res._getData()).toEqual({
        message: 'There was an internal error',
        statusCode: 500,
      });
      expect(JSON.stringify(res._getData())).not.toContain('permission denied');
      expect(sendTransactionalEmailFromTemplate).not.toHaveBeenCalled();
    });

    it('applies security headers even on the validation failure path', async () => {
      const res = await call({ body: {} });

      expect(res.getHeader('X-Frame-Options')).toBe('DENY');
      expect(res.getHeader('X-Content-Type-Options')).toBe('nosniff');
    });
  });
});
