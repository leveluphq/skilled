import { NextApiRequest, NextApiResponse } from 'next';
import getCodeSubmissionToRefresh from 'services/server/graphql/queries/getCodeSubmissionToRefresh';
import claimCodeSubmissionRefresh from 'services/server/graphql/mutations/claimCodeSubmissionRefresh';
import updateCodeSubmissionResults from 'services/server/graphql/mutations/updateCodeSubmissionResults';
import {
  buildSubmissionUpdate,
  isPendingCallback,
} from 'services/server/coderunner/judge0/callback';
import { fetchFromJudge0 } from 'services/server/runner/backends/judge0';
import { runnerResultUpdate } from 'services/server/runner/judge0Result';
import { getRunnerBackend } from 'utils/shared/runner/settings';
import { ExecutionStatus } from 'utils/constants/codeRunner';
import { HttpMethods } from 'utils/constants/http';
import { createErrorObject } from 'utils/server/http';
import { getValidViewerId } from 'utils/server/jwt';
import Sentry, { configureReq } from 'utils/shared/sentry';
import { applySecurityHeaders } from 'services/server/security/headers';

// The fallback for a Judge0 callback that never arrives (Judge0 tries a callback
// only three times). The editor asks for it while it waits; this fetches the
// run's result from Judge0 and records it as the callback would have.
// Each call is a Judge0 request, so it only asks for runs still waiting, and
// at most once every few seconds for each run.

// Before this, the callback has usually not had time to arrive
export const MIN_AGE_MS = 5000;

// The least time between two Judge0 lookups for the same run. The editor asks
// twice, 15 s apart, so only repeated calls from elsewhere wait.
export const LOOKUP_INTERVAL_MS = 5000;

const captureRefreshError = (error: unknown, reason: string) => {
  Sentry.withScope((scope) => {
    scope.setTag('endpoint', 'judge0-refresh');
    scope.setTag('reason', reason);
    Sentry.captureException(error);
  });
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  applySecurityHeaders(res);
  configureReq(req);

  if (req.method !== HttpMethods.Post) {
    res.setHeader('Allow', [HttpMethods.Post]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { token } = req.query;

  // With Docker, results are written before the editor gets its token
  if (getRunnerBackend() !== 'judge0' || typeof token !== 'string' || !token) {
    return res
      .status(404)
      .send(createErrorObject({ message: 'Submission not found', statusCode: 404 }));
  }

  const submission = await getCodeSubmissionToRefresh(token).catch((error) => {
    captureRefreshError(error, 'could-not-read-submission');
    return undefined;
  });

  // Only the learner who ran the code can ask, as anyone else can't see the result
  if (!submission || (submission.userId || null) !== (getValidViewerId(req) || null)) {
    return res
      .status(404)
      .send(createErrorObject({ message: 'Submission not found', statusCode: 404 }));
  }

  if (submission.executionStatus !== ExecutionStatus.Executing) {
    return res.status(200).json({ status: 'done' });
  }

  if (Date.now() - new Date(submission.createdAt).getTime() < MIN_AGE_MS) {
    return res.status(202).json({ status: 'pending' });
  }

  let claimed;

  try {
    claimed = await claimCodeSubmissionRefresh({
      id: submission.id,
      lastBefore: new Date(Date.now() - LOOKUP_INTERVAL_MS).toISOString(),
    });
  } catch (error) {
    captureRefreshError(error, 'could-not-claim-lookup');
    return res
      .status(500)
      .send(createErrorObject({ message: "Couldn't check the run", statusCode: 500 }));
  }

  // Another lookup for this run was moments ago, or the result just arrived
  if (!claimed) {
    res.setHeader('Retry-After', String(Math.ceil(LOOKUP_INTERVAL_MS / 1000)));
    return res.status(429).send(
      createErrorObject({
        message: 'This run was checked moments ago. Please try again in a few seconds.',
        statusCode: 429,
      }),
    );
  }

  let fetched;

  try {
    fetched = await fetchFromJudge0(token);
  } catch (error) {
    // The callback may still arrive, so leave the run waiting
    captureRefreshError(error, 'could-not-fetch-result');
    return res
      .status(502)
      .send(createErrorObject({ message: "Couldn't reach the code runner", statusCode: 502 }));
  }

  if (
    !fetched.payload ||
    typeof fetched.payload !== 'object' ||
    isPendingCallback(fetched.payload)
  ) {
    return res.status(202).json({ status: 'pending' });
  }

  try {
    let update;

    if (submission.runnerVersion) {
      if (!fetched.nonce) {
        throw new Error('The run has no nonce in its stdin');
      }

      update = runnerResultUpdate(submission, fetched.nonce, fetched.payload);
    } else {
      update = buildSubmissionUpdate(submission.id, fetched.payload);
    }

    const response = await updateCodeSubmissionResults(update);

    // Nothing updated: the callback got there first
    return res.status(200).json({
      status: (response.update_code_submissions?.affected_rows || 0) > 0 ? 'updated' : 'done',
    });
  } catch (error) {
    captureRefreshError(error, 'could-not-record-result');

    // As with the callback: don't leave the learner waiting on a result that will never be written
    try {
      await updateCodeSubmissionResults({
        id: submission.id,
        executionStatus: ExecutionStatus.Error,
      });
    } catch (markError) {
      captureRefreshError(markError, 'could-not-mark-error');
    }

    return res
      .status(500)
      .send(
        createErrorObject({ message: 'There was an error recording the result', statusCode: 500 }),
      );
  }
};

export default handler;
