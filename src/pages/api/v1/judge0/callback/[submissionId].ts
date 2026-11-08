import { NextApiRequest, NextApiResponse } from 'next';
import updateCodeSubmissionResults from 'services/server/graphql/mutations/updateCodeSubmissionResults';
import getCodeSubmissionForRunner from 'services/server/graphql/queries/getCodeSubmissionForRunner';
import { NONCE_QUERY_PARAM } from 'services/server/runner/backends/judge0';
import { runnerResultUpdate } from 'services/server/runner/judge0Result';
import {
  Judge0Callback,
  buildSubmissionUpdate,
  hasValidCallbackSecret,
  isPendingCallback,
} from 'services/server/coderunner/judge0/callback';
import { ExecutionStatus } from 'utils/constants/codeRunner';
import { HttpMethods } from 'utils/constants/http';
import { createErrorObject } from 'utils/server/http';
import Sentry, { configureReq } from 'utils/shared/sentry';
import { applySecurityHeaders } from 'services/server/security/headers';

// Judge0 sends a run's whole output in the callback, base64-encoded, and does
// not retry a request we reject. Next's default 1mb limit would turn a run that
// prints a lot into a 413 and leave the submission EXECUTING. Judge0 caps output
// at max_file_size (1 MB by default), which base64 grows to about 1.4 MB.
export const config = {
  api: {
    bodyParser: { sizeLimit: '4mb' },
  },
};

const captureCallbackError = (error: unknown, reason: string) => {
  Sentry.withScope((scope) => {
    scope.setTag('endpoint', 'judge0-callback');
    scope.setTag('reason', reason);
    Sentry.captureException(error);
  });
};

// The new runner's results. Its callback URL carries the run's nonce.
const runnerUpdate = async (submissionId: string, nonce: string, payload: Judge0Callback) => {
  const submission = await getCodeSubmissionForRunner(submissionId);

  if (!submission || !submission.lesson) {
    return null;
  }

  return runnerResultUpdate(submission, nonce, payload);
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  applySecurityHeaders(res);
  configureReq(req);

  if (req.method !== HttpMethods.Put) {
    res.setHeader('Allow', [HttpMethods.Put]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  if (!hasValidCallbackSecret(req)) {
    captureCallbackError(new Error('Unauthorized callback request'), 'invalid-callback-secret');

    return res
      .status(401)
      .send(createErrorObject({ message: 'Unauthorized callback request', statusCode: 401 }));
  }

  const { submissionId } = req.query;
  const payload = req.body as Judge0Callback | null;

  if (
    typeof submissionId !== 'string' ||
    !submissionId ||
    !payload ||
    typeof payload !== 'object'
  ) {
    return res
      .status(400)
      .send(
        createErrorObject({ message: 'Did not receive a valid callback payload', statusCode: 400 }),
      );
  }

  // Not finished yet. The callback with the result follows.
  if (isPendingCallback(payload)) {
    return res.status(202).json({ success: true });
  }

  try {
    const nonce = req.query[NONCE_QUERY_PARAM];
    // Only the new runner puts a nonce in the callback URL
    const update =
      typeof nonce === 'string' && nonce
        ? await runnerUpdate(submissionId, nonce, payload)
        : buildSubmissionUpdate(submissionId, payload);

    if (!update) {
      return res.status(200).json({ success: false });
    }

    const response = await updateCodeSubmissionResults(update);

    // Nothing updated: the submission already has its result (this is a
    // repeated callback) or doesn't exist. Either way there is nothing for
    // Judge0 to retry.
    return res
      .status(200)
      .json({ success: (response.update_code_submissions?.affected_rows || 0) > 0 });
  } catch (error) {
    captureCallbackError(error, 'could-not-record-result');

    // Don't leave the learner waiting on a result that will never be written
    try {
      await updateCodeSubmissionResults({
        id: submissionId,
        executionStatus: ExecutionStatus.Error,
      });
    } catch (markError) {
      captureCallbackError(markError, 'could-not-mark-error');
    }

    return res
      .status(500)
      .send(
        createErrorObject({ message: 'There was an error recording the result', statusCode: 500 }),
      );
  }
};

export default handler;
