import { NextApiRequest, NextApiResponse } from 'next';
import getViewerById from 'services/server/graphql/queries/getViewerById';
import getLessonVideoIdById from 'services/server/graphql/queries/getLessonVideoIdById';
import { getHasLessonAccess } from 'utils/client/lesson';
import { ReasonForMissing } from 'utils/constants/lesson';
import { HttpMethods } from 'utils/constants/http';
import { createErrorObject } from 'utils/server/http';
import Sentry, { configureReq } from 'utils/shared/sentry';
import { applySecurityHeaders } from 'services/server/security/headers';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  applySecurityHeaders(res);
  configureReq(req);

  const { method } = req;

  if (method !== HttpMethods.Get) {
    res.setHeader('Allow', [HttpMethods.Get]);
    res.status(405).end(`Method ${method} Not Allowed`);
    return;
  }

  try {
    const viewerPromise = getViewerById(req);
    const lessonPromise = getLessonVideoIdById(req);

    const [viewer, lesson] = await Promise.all([viewerPromise, lessonPromise]);

    if (!lesson) {
      return res.status(404).send(
        createErrorObject({
          message: 'Lesson now found',
          statusCode: 404,
        }),
      );
    }

    if (!getHasLessonAccess(lesson, viewer)) {
      return res
        .status(200)
        .json({ solutionVideoUrl: null, reason: ReasonForMissing.UpgradeRequired });
      // return res.status(401).end('You do not have access to this solution video');
    }

    return res.status(200).json({ solutionVideoUrl: lesson.solutionVideoUrl });
  } catch (error) {
    Sentry.withScope((_scope) => {
      Sentry.captureException(error);
    });

    return res.status(500).send(
      createErrorObject({
        message: 'There was an internal error',
        statusCode: 500,
      }),
    );
  }
};

export default handler;
