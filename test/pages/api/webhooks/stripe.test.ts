/**
 * Tests for the Stripe webhook endpoint.
 *
 * This route is the only thing standing between "anyone who can POST to the
 * site" and "grant a paid course entitlement". The properties under test are:
 *   1. the raw body is preserved (`config.api.bodyParser === false`), because a
 *      re-serialized body can never verify;
 *   2. every request goes through `stripe.webhooks.constructEvent` with the
 *      endpoint secret, and a failure there short-circuits before any
 *      entitlement-granting code runs;
 *   3. the handler acts on the *verified* event object, never on the attacker
 *      controlled bytes it parsed off the wire.
 */
import { createMocks } from 'node-mocks-http';
import Stripe from 'stripe';

jest.mock('raw-body', () => jest.fn());

jest.mock('services/server/stripe/instance', () => ({
  __esModule: true,
  default: {
    webhooks: { constructEvent: jest.fn() },
  },
}));

jest.mock('services/server/stripe/handleCompletedCheckout', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('utils/shared/sentry', () => ({
  __esModule: true,
  default: {
    withScope: jest.fn((callback: (scope: unknown) => void) => callback({})),
    captureException: jest.fn(),
  },
  configureReq: jest.fn(),
}));

const WEBHOOK_SECRET = 'whsec_test_secret';
const VALID_SIGNATURE = 't=1614556800,v1=a-signature-stripe-would-accept';
const FORGED_SIGNATURE = 't=1614556800,v1=deadbeef';

/** What a forger POSTs: a well-formed, entirely fabricated completed checkout. */
const FORGED_BODY = JSON.stringify({
  id: 'evt_ATTACKER',
  type: 'checkout.session.completed',
  data: { object: { id: 'cs_ATTACKER_SESSION', payment_status: 'paid', amount_total: 0 } },
});

const verifiedCheckoutEvent = {
  id: 'evt_VERIFIED',
  type: 'checkout.session.completed',
  data: { object: { id: 'cs_VERIFIED_SESSION', payment_status: 'paid', amount_total: 29900 } },
};

let handler: (req: any, res: any) => Promise<void>;
let routeConfig: any;
let stripe: any;
let handleCompletedCheckout: jest.Mock;
let getRawBody: jest.Mock;
let Sentry: any;

const WEBHOOK_ORIGINAL_ENV = { ...process.env };
let consoleLogSpy: jest.SpyInstance;

beforeAll(() => {
  // The module snapshots STRIPE_WEBHOOK_SECRET at import time.
  process.env.STRIPE_WEBHOOK_SECRET = WEBHOOK_SECRET;
  process.env.GRAPHQL_URL = 'https://graphql.invalid/v1/graphql';

  const routeModule = require('pages/api/webhooks/stripe');
  handler = routeModule.default;
  routeConfig = routeModule.config;

  stripe = require('services/server/stripe/instance').default;
  handleCompletedCheckout = require('services/server/stripe/handleCompletedCheckout').default;
  getRawBody = require('raw-body');
  Sentry = require('utils/shared/sentry').default;
});

afterAll(() => {
  process.env = WEBHOOK_ORIGINAL_ENV;
});

beforeEach(() => {
  jest.clearAllMocks();
  consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);

  getRawBody.mockResolvedValue(FORGED_BODY);
  handleCompletedCheckout.mockResolvedValue(undefined);

  // Stand in for Stripe's real HMAC check: only the signature Stripe would have
  // produced, verified against the configured endpoint secret, is accepted.
  stripe.webhooks.constructEvent.mockImplementation(
    (_body: string, signature: string, secret: string) => {
      if (secret !== WEBHOOK_SECRET) {
        throw new Error('Webhook secret is not configured correctly');
      }
      if (signature !== VALID_SIGNATURE) {
        throw new Error('No signatures found matching the expected signature for payload');
      }
      return verifiedCheckoutEvent;
    },
  );
});

afterEach(() => {
  consoleLogSpy.mockRestore();
});

const post = async (options: Record<string, unknown> = {}) => {
  const { req, res } = createMocks<any, any>({
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'stripe-signature': VALID_SIGNATURE,
      ...((options.headers as Record<string, string>) || {}),
    },
    ...options,
  });
  await handler(req, res);
  return res;
};

describe('POST /api/webhooks/stripe', () => {
  describe('route configuration', () => {
    it('disables the body parser so the raw payload survives for signature checking', () => {
      // Without this, Next.js consumes and re-serializes the body and every
      // legitimate Stripe signature would fail to verify.
      expect(routeConfig).toEqual({ api: { bodyParser: false } });
    });
  });

  describe('signature verification', () => {
    it('rejects a forged signature with 400 and grants nothing', async () => {
      const res = await post({ headers: { 'stripe-signature': FORGED_SIGNATURE } });

      expect(res._getStatusCode()).toBe(400);
      expect(res._getData()).toContain('Webhook Error:');
      expect(handleCompletedCheckout).not.toHaveBeenCalled();
      expect(Sentry.captureException).toHaveBeenCalled();
    });

    it('rejects a request with no stripe-signature header at all', async () => {
      const { req, res } = createMocks<any, any>({
        method: 'POST',
        headers: { 'content-type': 'application/json' },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(stripe.webhooks.constructEvent).toHaveBeenCalledWith(
        FORGED_BODY,
        undefined,
        WEBHOOK_SECRET,
      );
      expect(handleCompletedCheckout).not.toHaveBeenCalled();
    });

    it('verifies the exact bytes read off the wire against the configured secret', async () => {
      await post();

      expect(getRawBody).toHaveBeenCalledTimes(1);
      expect(getRawBody.mock.calls[0][1]).toEqual({ encoding: 'utf-8', limit: '1mb' });
      expect(stripe.webhooks.constructEvent).toHaveBeenCalledWith(
        FORGED_BODY,
        VALID_SIGNATURE,
        WEBHOOK_SECRET,
      );
    });

    it('acts on the verified event, not on the payload the caller sent', async () => {
      const res = await post();

      expect(res._getStatusCode()).toBe(200);
      expect(handleCompletedCheckout).toHaveBeenCalledTimes(1);

      const eventPassedOn = handleCompletedCheckout.mock.calls[0][0];
      expect(eventPassedOn).toBe(verifiedCheckoutEvent);
      expect(JSON.stringify(eventPassedOn)).not.toContain('cs_ATTACKER_SESSION');
      expect(JSON.stringify(eventPassedOn)).not.toContain('evt_ATTACKER');
    });

    it('honours the charset from the content type when reading the body', async () => {
      await post({ headers: { 'content-type': 'application/json; charset=iso-8859-1' } });

      expect(getRawBody.mock.calls[0][1]).toEqual({ encoding: 'iso-8859-1', limit: '1mb' });
    });

    it('rejects a malformed content-type header before verification', async () => {
      const res = await post({ headers: { 'content-type': 'application/json;;' } });

      expect(res._getStatusCode()).toBe(400);
      expect(getRawBody).not.toHaveBeenCalled();
      expect(stripe.webhooks.constructEvent).not.toHaveBeenCalled();
      expect(handleCompletedCheckout).not.toHaveBeenCalled();
    });

    it('rejects an empty body without attempting verification', async () => {
      getRawBody.mockResolvedValue('');

      const res = await post();

      expect(res._getStatusCode()).toBe(400);
      expect(res._getData()).toBe('Webhook Error: Request did not contain a body');
      expect(stripe.webhooks.constructEvent).not.toHaveBeenCalled();
      expect(handleCompletedCheckout).not.toHaveBeenCalled();
    });

    it('rejects an oversized body (the 1mb limit) with 400', async () => {
      getRawBody.mockRejectedValue(new Error('request entity too large'));

      const res = await post();

      expect(res._getStatusCode()).toBe(400);
      expect(res._getData()).toBe('Webhook Error: request entity too large');
      expect(handleCompletedCheckout).not.toHaveBeenCalled();
    });
  });

  /**
   * The block above stands in for Stripe's HMAC so the route's control flow can be
   * exercised, but a stand-in can only prove the route *calls* `constructEvent` --
   * not that the arguments it passes would survive the real check. These tests run
   * the genuine `Stripe.webhooks.constructEvent` (real HMAC-SHA256, real timestamp
   * tolerance) over the exact string the route reads off the wire, with headers
   * produced by Stripe's own signer. Only the `services/server/stripe/instance`
   * module is mocked in this file, so the `stripe` package here is the real one.
   */
  describe('signature verification against the real Stripe implementation', () => {
    const realWebhooks = new Stripe('sk_test_unused_for_hmac', {
      apiVersion: '2020-08-27',
    }).webhooks;

    const SIGNED_BODY = JSON.stringify(verifiedCheckoutEvent);

    const sign = (payload: string, secret = WEBHOOK_SECRET, timestamp?: number) =>
      realWebhooks.generateTestHeaderString({ payload, secret, timestamp });

    beforeEach(() => {
      getRawBody.mockResolvedValue(SIGNED_BODY);
      stripe.webhooks.constructEvent.mockImplementation(
        (body: string, signature: string, secret: string) =>
          realWebhooks.constructEvent(body, signature, secret),
      );
    });

    it('accepts a payload Stripe genuinely signed and hands the parsed event on', async () => {
      const res = await post({ headers: { 'stripe-signature': sign(SIGNED_BODY) } });

      expect(res._getStatusCode()).toBe(200);
      expect(handleCompletedCheckout).toHaveBeenCalledTimes(1);
      expect(handleCompletedCheckout.mock.calls[0][0]).toEqual(verifiedCheckoutEvent);
    });

    it('rejects a payload mutated after it was signed', async () => {
      const signature = sign(SIGNED_BODY);
      // Same event, one field flipped: a real interception/replay-with-edit.
      getRawBody.mockResolvedValue(SIGNED_BODY.replace('"amount_total":29900', '"amount_total":1'));

      const res = await post({ headers: { 'stripe-signature': signature } });

      expect(res._getStatusCode()).toBe(400);
      expect(handleCompletedCheckout).not.toHaveBeenCalled();
    });

    it('rejects a body an attacker signed with their own secret', async () => {
      const res = await post({
        headers: { 'stripe-signature': sign(SIGNED_BODY, 'whsec_attacker_secret') },
      });

      expect(res._getStatusCode()).toBe(400);
      expect(handleCompletedCheckout).not.toHaveBeenCalled();
    });

    it('rejects a correctly signed event replayed outside the timestamp tolerance', async () => {
      const anHourAgo = Math.floor(Date.now() / 1000) - 60 * 60;

      const res = await post({
        headers: { 'stripe-signature': sign(SIGNED_BODY, WEBHOOK_SECRET, anHourAgo) },
      });

      expect(res._getStatusCode()).toBe(400);
      expect(handleCompletedCheckout).not.toHaveBeenCalled();
    });

    it('rejects a header with no v1 scheme even when the digest itself is right', async () => {
      const timestamp = Math.floor(Date.now() / 1000);
      const real = sign(SIGNED_BODY, WEBHOOK_SECRET, timestamp);
      const digest = real.split('v1=')[1];

      const res = await post({ headers: { 'stripe-signature': `t=${timestamp},v0=${digest}` } });

      expect(res._getStatusCode()).toBe(400);
      expect(handleCompletedCheckout).not.toHaveBeenCalled();
    });
  });

  describe('event dispatch', () => {
    it('acknowledges a handled checkout.session.completed with 200', async () => {
      const res = await post();

      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual({ received: true });
    });

    it('returns 500 so Stripe retries when the checkout handler throws', async () => {
      handleCompletedCheckout.mockRejectedValue(new Error('could not find sale'));

      const res = await post();

      expect(res._getStatusCode()).toBe(500);
      expect(res._getData()).toBe('Webhook Event Handler Error: could not find sale');
      expect(Sentry.captureException).toHaveBeenCalled();
    });

    it('reports charge.refunded to Sentry without running the checkout handler', async () => {
      stripe.webhooks.constructEvent.mockReturnValue({
        id: 'evt_refund',
        type: 'charge.refunded',
        data: { object: { id: 'ch_1' } },
      });

      const res = await post();

      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual({ received: true });
      expect(handleCompletedCheckout).not.toHaveBeenCalled();
      expect(Sentry.captureException).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Charge refunded in Stripe' }),
      );
    });

    it.each([
      'invoice.paid',
      'customer.subscription.deleted',
      'payment_intent.succeeded',
      'checkout.session.expired',
    ])('ignores the unhandled event type %s with a 200 ack', async (type) => {
      stripe.webhooks.constructEvent.mockReturnValue({
        id: 'evt_other',
        type,
        data: { object: { id: 'obj_1' } },
      });

      const res = await post();

      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual({ received: true });
      expect(handleCompletedCheckout).not.toHaveBeenCalled();
      expect(Sentry.captureException).not.toHaveBeenCalled();
    });

    it('does not treat a look-alike event type as a completed checkout', async () => {
      stripe.webhooks.constructEvent.mockReturnValue({
        id: 'evt_lookalike',
        type: 'checkout.session.completed.v2',
        data: { object: { id: 'cs_1' } },
      });

      const res = await post();

      expect(res._getStatusCode()).toBe(200);
      expect(handleCompletedCheckout).not.toHaveBeenCalled();
    });
  });

  describe('method handling', () => {
    it.each(['GET', 'PUT', 'DELETE'])('rejects %s with 405 before reading the body', async (method) => {
      const { req, res } = createMocks<any, any>({
        method: method as any,
        headers: { 'content-type': 'application/json' },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
      expect(res.getHeader('Allow')).toEqual(['POST']);
      expect(res._getData()).toBe(`Method ${method} Not Allowed`);
      expect(getRawBody).not.toHaveBeenCalled();
      expect(stripe.webhooks.constructEvent).not.toHaveBeenCalled();
      expect(handleCompletedCheckout).not.toHaveBeenCalled();
    });

    it('applies security headers to webhook responses', async () => {
      const res = await post();

      expect(res.getHeader('X-Frame-Options')).toBe('DENY');
      expect(res.getHeader('X-Content-Type-Options')).toBe('nosniff');
    });
  });
});
