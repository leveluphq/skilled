import { NextApiRequest, NextApiResponse } from 'next';
import { HttpMethods } from 'utils/constants/http';
import { getValidViewerId } from 'utils/server/jwt';
import { createErrorObject } from 'utils/server/http';
import Sentry, { configureReq } from 'utils/shared/sentry';
import { applySecurityHeaders } from 'services/server/security/headers';

const GRAPHQL_URL = process.env.GRAPHQL_URL;
const HASURA_ADMIN_SECRET = process.env.HASURA_GRAPHQL_ADMIN_SECRET;

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  applySecurityHeaders(res);
  configureReq(req);

  if (req.method !== HttpMethods.Post) {
    res.setHeader('Allow', [HttpMethods.Post]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  if (!GRAPHQL_URL || !HASURA_ADMIN_SECRET) {
    Sentry.captureException(
      new Error('GraphQL proxy is missing GRAPHQL_URL or HASURA_GRAPHQL_ADMIN_SECRET')
    );

    return res.status(500).send(
      createErrorObject({
        message: 'GraphQL proxy is not configured',
        statusCode: 500,
      })
    );
  }

  try {
    const viewerId = getValidViewerId(req);
    const role = viewerId ? 'user' : 'anonymous';
    const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});

    const response = await fetch(GRAPHQL_URL, {
      method: HttpMethods.Post,
      headers: {
        'content-type': 'application/json',
        'x-hasura-admin-secret': HASURA_ADMIN_SECRET,
        'x-hasura-role': role,
        ...(viewerId ? { 'x-hasura-user-id': viewerId } : {}),
      },
      body,
    });

    const responseText = await response.text();
    const contentType = response.headers.get('content-type') || 'application/json';

    res.status(response.status);
    res.setHeader('Content-Type', contentType);
    return res.send(responseText);
  } catch (error) {
    Sentry.withScope((_scope) => {
      Sentry.captureException(error);
    });

    return res.status(500).send(
      createErrorObject({
        message: 'Failed to process GraphQL request',
        statusCode: 500,
      })
    );
  }
};

export default handler;
