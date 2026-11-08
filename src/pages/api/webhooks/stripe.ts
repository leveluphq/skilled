import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import getRawBody from 'raw-body';
import { parse } from 'content-type';
import stripe from 'services/server/stripe/instance';
import handleCompletedCheckout from 'services/server/stripe/handleCompletedCheckout';
import { HttpMethods } from 'utils/constants/http';
import Sentry, { configureReq } from 'utils/shared/sentry';
import { applySecurityHeaders } from 'services/server/security/headers';

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;
const CHECKOUT_SESSION_COMPLETED_EVENT_TYPE: Stripe.WebhookEndpointCreateParams.EnabledEvent =
  'checkout.session.completed';
const CHARGE_REFUNDED_EVENT_TYPE: Stripe.WebhookEndpointCreateParams.EnabledEvent =
  'charge.refunded';

const parseRawBody = async (req: NextApiRequest, limit: string | number) => {
  const contentType = parse(req.headers['content-type'] || 'text/plain');
  const { parameters } = contentType;
  const encoding = parameters.charset || 'utf-8';
  const buffer = await getRawBody(req, { encoding, limit });

  if (buffer) {
    const body = buffer.toString();
    return body;
  } else {
    throw new Error('Request did not contain a body');
  }
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  applySecurityHeaders(res);
  configureReq(req);

  const { method, headers } = req;

  if (method !== HttpMethods.Post) {
    res.setHeader('Allow', [HttpMethods.Post]);
    res.status(405).end(`Method ${method} Not Allowed`);
    return;
  }

  const sig = headers['stripe-signature'] as string;
  let event: Stripe.Event;

  try {
    const body = await parseRawBody(req, '1mb');
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (error) {
    Sentry.withScope((_scope) => {
      Sentry.captureException(error);
    });

    console.log('---- ERROR EVENT = ', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(400).send(`Webhook Error: ${errorMessage}`);
  }

  if (event.type === CHECKOUT_SESSION_COMPLETED_EVENT_TYPE) {
    console.log('- RECEIVED CHECKOUT EVENT -');
    try {
      console.log('--- EVENT = ', event);
      await handleCompletedCheckout(event);
      console.log('- HANDLE CHECKOUT COMPLETE -');
    } catch (error) {
      Sentry.withScope((_scope) => {
        Sentry.captureException(error);
      });

      console.log('---- ERROR CREATING SUBSCRIPTION = ', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).send(`Webhook Event Handler Error: ${errorMessage}`);
    }
  } else if (event.type === CHARGE_REFUNDED_EVENT_TYPE) {
    Sentry.withScope((_scope) => {
      Sentry.captureException(new Error('Charge refunded in Stripe'));
    });
  }

  // Return a response to acknowledge receipt of the event
  return res.status(200).json({ received: true });
};

export default handler;

export const config = {
  api: {
    bodyParser: false,
  },
};
