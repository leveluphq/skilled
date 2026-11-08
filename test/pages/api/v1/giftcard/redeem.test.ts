/**
 * Tests for `src/pages/api/v1/giftcard/redeem.ts`.
 *
 * Every Hasura call is mocked at the module boundary, so nothing here touches a
 * network or a database. The interesting behaviour is the status machine
 * (UNPAID / REDEEMED / INACTIVE / ISSUED / unknown) and the redemption payload,
 * plus the read-then-write race documented at the bottom of the file.
 */

import { createMocks, RequestOptions } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';

jest.mock('services/server/graphql/queries/getViewerById', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('services/server/graphql/queries/getGiftCardByCode', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('services/server/graphql/mutations/redeemCourseAccessGiftCard', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const ENV = {
  JWT_SECRET: Buffer.alloc(64, 'a').toString('base64'),
  JWT_TOKEN_NAME: 'skilled-giftcard-token',
  ROOT_DOMAIN: 'skilled.test',
  ROOT_URL: 'https://skilled.test',
  GRAPHQL_URL: 'https://hasura.internal.test/v1/graphql',
  HASURA_GRAPHQL_ADMIN_SECRET: 'admin-secret',
};

const originalEnv = { ...process.env };
Object.assign(process.env, ENV);

// eslint-disable-next-line @typescript-eslint/no-var-requires
const getViewerById = require('services/server/graphql/queries/getViewerById').default as jest.Mock;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const getGiftCardByCode = require('services/server/graphql/queries/getGiftCardByCode')
  .default as jest.Mock;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const redeemCourseAccessGiftCard = require('services/server/graphql/mutations/redeemCourseAccessGiftCard')
  .default as jest.Mock;

// eslint-disable-next-line @typescript-eslint/no-var-requires
const handler = require('pages/api/v1/giftcard/redeem').default as (
  req: NextApiRequest,
  res: NextApiResponse,
) => Promise<void>;

const NOW = new Date('2024-03-01T12:00:00.000Z');
const DAY_MS = 24 * 60 * 60 * 1000;

const viewer = (overrides: Record<string, unknown> = {}) => ({
  id: 'user-1',
  email: 'user@example.com',
  role: 'USER',
  stripeCustomerId: null,
  fullCourseAccessEndsAt: null,
  fullCourseAccessLatestUpgradedAt: null,
  fullCourseAccessFirstUpgradedAt: null,
  ...overrides,
});

const giftCard = (overrides: Record<string, unknown> = {}) => ({
  id: 'gift-card-1',
  status: 'ISSUED',
  productAccessDays: 30,
  saleId: 'sale-1',
  productType: 'FULL_COURSE',
  productName: 'Full course',
  productDescription: 'Everything',
  product: { id: 'product-1', productAccessDays: 30 },
  ...overrides,
});

type CallOptions = Omit<RequestOptions, 'body'> & { body?: unknown };

const call = async (options: CallOptions = {}) => {
  const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
    method: 'POST',
    body: { code: 'GIFT-CODE' },
    ...options,
  } as RequestOptions);

  await handler(req, res);

  return res;
};

describe('api/v1/giftcard/redeem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] }).setSystemTime(NOW);
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    redeemCourseAccessGiftCard.mockResolvedValue({});
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  afterAll(() => {
    process.env = { ...originalEnv };
  });

  describe('method and authentication', () => {
    it('rejects non-POST requests with 405', async () => {
      const res = await call({ method: 'GET' });

      expect(res._getStatusCode()).toBe(405);
      expect(getViewerById).not.toHaveBeenCalled();
      // BUG: the endpoint only accepts POST but advertises `Allow: GET`, so a
      // client following the header will be rejected again. Should be `POST`.
      expect(res.getHeader('Allow')).toEqual(['GET']);
    });

    it('returns 401 and never looks up the gift card when there is no session', async () => {
      getViewerById.mockResolvedValue(null);

      const res = await call();

      expect(res._getStatusCode()).toBe(401);
      expect(res._getData()).toEqual({
        message: 'You must be logged in to apply a gift card',
        statusCode: 401,
      });
      expect(getGiftCardByCode).not.toHaveBeenCalled();
      expect(redeemCourseAccessGiftCard).not.toHaveBeenCalled();
    });

    it('applies security headers to the response', async () => {
      getViewerById.mockResolvedValue(null);

      const res = await call();

      expect(res.getHeader('X-Frame-Options')).toBe('DENY');
    });
  });

  describe('code lookup', () => {
    beforeEach(() => {
      getViewerById.mockResolvedValue(viewer());
    });

    it('returns 404 when the gift card does not exist', async () => {
      getGiftCardByCode.mockResolvedValue(undefined);

      const res = await call({ body: { code: 'NOPE' } });

      expect(res._getStatusCode()).toBe(404);
      expect(res._getData()).toEqual({ message: 'Gift card not found', statusCode: 404 });
      expect(redeemCourseAccessGiftCard).not.toHaveBeenCalled();
    });

    it('returns 404 when no code is supplied at all', async () => {
      getGiftCardByCode.mockResolvedValue(undefined);

      const res = await call({ body: {} });

      // BUG: there is no input validation - `undefined` is handed straight to the
      // Hasura query instead of short-circuiting with a 400 "code required".
      expect(getGiftCardByCode).toHaveBeenCalledWith(undefined);
      expect(res._getStatusCode()).toBe(404);
    });

    it('forwards a non-string code to the query without coercion or validation', async () => {
      getGiftCardByCode.mockResolvedValue(undefined);

      const malformed = { _ilike: '%' };
      const res = await call({ body: { code: malformed } });

      // BUG: an object/array code is passed to the GraphQL variable untouched.
      // Hasura rejects it (String! variable), which surfaces as a 500 rather than
      // a 400; the handler should reject non-string codes up front.
      expect(getGiftCardByCode).toHaveBeenCalledWith(malformed);
      expect(res._getStatusCode()).toBe(404);
    });

    it('returns 500 when the request has no parsed body at all', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({ method: 'POST' });
      // Next only populates `req.body` for recognised content types; an unparsed
      // POST leaves it undefined.
      (req as { body?: unknown }).body = undefined;

      await handler(req, res);

      // BUG: `body.code` throws a TypeError that the catch-all reports as a 500
      // "internal error" plus a Sentry event, where a 400 is the correct answer.
      expect(res._getStatusCode()).toBe(500);
      expect(getGiftCardByCode).not.toHaveBeenCalled();
    });
  });

  describe('status branches', () => {
    beforeEach(() => {
      getViewerById.mockResolvedValue(viewer());
    });

    it.each([
      [
        'UNPAID',
        'This gift card was never issued. If you think this is an issue, email hey@skilled.dev',
      ],
      [
        'REDEEMED',
        'This gift card has already been redeemed. If you think this is an issue, email hey@skilled.dev',
      ],
      [
        'INACTIVE',
        'This gift card is no longer active. If you think this is an issue, email hey@skilled.dev',
      ],
    ])('rejects a %s gift card with 400 and does not grant access', async (status, message) => {
      getGiftCardByCode.mockResolvedValue(giftCard({ status }));

      const res = await call();

      expect(res._getStatusCode()).toBe(400);
      expect(res._getData()).toEqual({ message, statusCode: 400 });
      expect(redeemCourseAccessGiftCard).not.toHaveBeenCalled();
    });

    it('returns 500 for an unrecognised status rather than granting access', async () => {
      getGiftCardByCode.mockResolvedValue(giftCard({ status: 'SOMETHING_NEW' }));

      const res = await call();

      expect(res._getStatusCode()).toBe(500);
      expect(res._getData()).toEqual({
        message: 'There was an internal error',
        statusCode: 500,
      });
      expect(redeemCourseAccessGiftCard).not.toHaveBeenCalled();
    });

    it.each([[null], [0], [undefined]])(
      'refuses to redeem an ISSUED card whose productAccessDays is %p',
      async (productAccessDays) => {
        getGiftCardByCode.mockResolvedValue(giftCard({ productAccessDays }));

        const res = await call();

        expect(redeemCourseAccessGiftCard).not.toHaveBeenCalled();
        // The "Gift card did not specify days" error is swallowed into a generic 500.
        expect(res._getStatusCode()).toBe(500);
        expect(res._getData()).toEqual({
          message: 'There was an internal error',
          statusCode: 500,
        });
      },
    );
  });

  describe('successful redemption', () => {
    beforeEach(() => {
      getViewerById.mockResolvedValue(viewer());
      getGiftCardByCode.mockResolvedValue(giftCard());
    });

    it('flips the card to REDEEMED and grants access from now for a first upgrade', async () => {
      const res = await call();

      expect(res._getStatusCode()).toBe(200);
      expect(redeemCourseAccessGiftCard).toHaveBeenCalledTimes(1);
      expect(redeemCourseAccessGiftCard).toHaveBeenCalledWith({
        userId: 'user-1',
        giftCardId: 'gift-card-1',
        redeemedAt: NOW.toISOString(),
        fullCourseAccessEndsAt: new Date(NOW.getTime() + 30 * DAY_MS).toISOString(),
        fullCourseAccessFirstUpgradedAt: NOW.toISOString(),
        fullCourseAccessLatestUpgradedAt: NOW.toISOString(),
        upgradeType: 'UPGRADE',
        saleId: 'sale-1',
        productType: 'FULL_COURSE',
        productName: 'Full course',
        productDescription: 'Everything',
        productAccessDays: 30,
        detailsObject: { id: 'product-1', productAccessDays: 30 },
        giftCardStatus: 'REDEEMED',
      });
    });

    it('extends existing access from the current end date instead of from today', async () => {
      const existingEnd = new Date(NOW.getTime() + 10 * DAY_MS).toISOString();
      getViewerById.mockResolvedValue(
        viewer({
          fullCourseAccessEndsAt: existingEnd,
          fullCourseAccessFirstUpgradedAt: '2023-01-01T00:00:00.000Z',
        }),
      );

      await call();

      const variables = redeemCourseAccessGiftCard.mock.calls[0][0];

      expect(variables.fullCourseAccessEndsAt).toBe(
        new Date(NOW.getTime() + 40 * DAY_MS).toISOString(),
      );
      // The original upgrade timestamp is preserved; only "latest" moves.
      expect(variables.fullCourseAccessFirstUpgradedAt).toBe('2023-01-01T00:00:00.000Z');
      expect(variables.fullCourseAccessLatestUpgradedAt).toBe(NOW.toISOString());
    });

    it('extends from an already expired end date, which can grant zero usable time', async () => {
      const expired = new Date(NOW.getTime() - 365 * DAY_MS).toISOString();
      getViewerById.mockResolvedValue(viewer({ fullCourseAccessEndsAt: expired }));

      await call();

      // BUG: access is extended from the stale end date, so redeeming a 30-day
      // card on an account that expired a year ago still leaves the user locked
      // out. The baseline should be `max(now, currentEnd)`.
      expect(redeemCourseAccessGiftCard.mock.calls[0][0].fullCourseAccessEndsAt).toBe(
        new Date(NOW.getTime() - 335 * DAY_MS).toISOString(),
      );
    });

    it('binds the grant to the session viewer and the looked-up card, not to the body', async () => {
      const res = await call({
        body: {
          code: 'GIFT-CODE',
          // Everything an attacker would try to smuggle into the mutation.
          userId: 'victim-user',
          giftCardId: 'someone-elses-card',
          productAccessDays: 36500,
          fullCourseAccessEndsAt: '2099-01-01T00:00:00.000Z',
          giftCardStatus: 'ISSUED',
        },
      });

      expect(res._getStatusCode()).toBe(200);

      const variables = redeemCourseAccessGiftCard.mock.calls[0][0];

      expect(variables.userId).toBe('user-1');
      expect(variables.giftCardId).toBe('gift-card-1');
      expect(variables.productAccessDays).toBe(30);
      expect(variables.fullCourseAccessEndsAt).toBe(
        new Date(NOW.getTime() + 30 * DAY_MS).toISOString(),
      );
      // The card is always flipped closed; a body-supplied status cannot keep it open.
      expect(variables.giftCardStatus).toBe('REDEEMED');
    });

    it('responds with the misspelled success payload', async () => {
      const res = await call();

      // BUG: the response key is `sucess`, not `success`. Clients checking
      // `success` see `undefined` on a successful redemption.
      expect(res._getJSONData()).toEqual({ sucess: true });
    });

    it('returns 500 without a partial success message when the mutation fails', async () => {
      redeemCourseAccessGiftCard.mockRejectedValue(new Error('hasura exploded'));

      const res = await call();

      expect(res._getStatusCode()).toBe(500);
      expect(res._getData()).toEqual({
        message: 'There was an internal error',
        statusCode: 500,
      });
    });
  });

  describe('concurrent redemption', () => {
    it('BUG: double-redeems one gift card when two requests interleave (TOCTOU)', async () => {
      // BUG: `redeem.ts` reads the gift card status with getGiftCardByCode and
      // later writes `status: REDEEMED` with redeemCourseAccessGiftCard. Nothing
      // between the read and the write re-checks the status, and the mutation
      // updates `gift_cards_by_pk` unconditionally (no `where: { status: { _eq:
      // ISSUED } }` guard and no transaction/row lock). Two requests that both
      // read the card while it is still ISSUED therefore both pass the status
      // check and both grant course access from a single card.
      //
      // The fix is a conditional update - e.g. `update_gift_cards(where: { id,
      // status: { _eq: "ISSUED" } })` - and treating `affected_rows === 0` as
      // "already redeemed". This test asserts the CURRENT (vulnerable) behaviour
      // so the suite stays green; flip it when the guard lands.
      const issued = giftCard();
      getGiftCardByCode.mockResolvedValue(issued);
      getViewerById
        .mockResolvedValueOnce(viewer({ id: 'attacker-account-a' }))
        .mockResolvedValueOnce(viewer({ id: 'attacker-account-b' }));

      let releaseLookup: () => void = () => undefined;
      const lookupGate = new Promise<void>((resolve) => {
        releaseLookup = resolve;
      });

      // Hold both handlers between the status read and the write, which is
      // exactly the window a real Hasura round trip opens.
      getGiftCardByCode.mockImplementation(async () => {
        await lookupGate;
        return issued;
      });

      const first = call();
      const second = call();

      releaseLookup();

      const [resA, resB] = await Promise.all([first, second]);

      expect(resA._getStatusCode()).toBe(200);
      expect(resB._getStatusCode()).toBe(200);
      expect(redeemCourseAccessGiftCard).toHaveBeenCalledTimes(2);
      expect(redeemCourseAccessGiftCard.mock.calls.map(([vars]) => vars.userId).sort()).toEqual([
        'attacker-account-a',
        'attacker-account-b',
      ]);
      // Both writes target the same card and both claim to be the redemption.
      redeemCourseAccessGiftCard.mock.calls.forEach(([vars]) => {
        expect(vars.giftCardId).toBe('gift-card-1');
        expect(vars.giftCardStatus).toBe('REDEEMED');
      });
    });
  });
});
