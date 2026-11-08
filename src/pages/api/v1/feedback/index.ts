import { NextApiRequest, NextApiResponse } from 'next';
import { getClientIp } from 'request-ip';
import { getValidViewerId } from 'utils/server/jwt';
import { HttpMethods } from 'utils/constants/http';
import { createErrorObject } from 'utils/server/http';
import insertUserFeedback from 'services/server/graphql/mutations/insertUserFeedback';
import {
  sendTransactionalEmailFromTemplate,
  TemplateTag,
} from 'services/server/email/transactional';
import Sentry, { configureReq } from 'utils/shared/sentry';
import { applySecurityHeaders } from 'services/server/security/headers';

interface Body {
  url: string;
  name: string;
  email: string;
  feedback: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  applySecurityHeaders(res);
  configureReq(req);

  const { method, body } = req;

  if (method !== HttpMethods.Post) {
    res.setHeader('Allow', [HttpMethods.Post]);
    res.status(405).end(`Method ${method} Not Allowed`);
    return;
  }

  // TODO: Check for recaptcha

  if (!body || !body.feedback) {
    Sentry.withScope((_scope) => {
      Sentry.captureException(new Error('Request body not found'));
    });

    return res
      .status(400)
      .send(createErrorObject({ message: 'Request body not found', statusCode: 400 }));
  }

  try {
    const ip = getClientIp(req) || '';
    const userId = getValidViewerId(req) || null;

    const payload = {
      ...(body as Body),
      ip,
      userId,
    };

    const insertResponse = await insertUserFeedback(payload);

    try {
      await sendTransactionalEmailFromTemplate(process.env.INTERNAL_NOTIFICATION_EMAIL!, TemplateTag.FeedbackReceived, {
        feedback: payload.feedback,
        url: payload.url,
        name: payload.name,
        email: payload.email,
        userId: payload.userId,
        feedbackId: insertResponse.insert_user_feedback?.returning[0].id,
      });
    } catch (error) {
      // Silently fail...
      Sentry.withScope((_scope) => {
        Sentry.captureException(error);
      });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    Sentry.withScope((_scope) => {
      Sentry.captureException(error);
    });

    return res
      .status(500)
      .send(createErrorObject({ message: 'There was an internal error', statusCode: 500 }));
  }
};

export default handler;
