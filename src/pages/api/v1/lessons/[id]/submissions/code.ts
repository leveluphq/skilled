import { NextApiRequest, NextApiResponse } from 'next';
import getViewerById from 'services/server/graphql/queries/getViewerById';
import getLessonForRunner from 'services/server/graphql/queries/getLessonForRunner';
import insertNewCodeSubmission from 'services/server/graphql/mutations/insertNewCodeSubmission';
import setSubmissionToken from 'services/server/graphql/mutations/setSubmissionToken';
import updateCodeSubmissionResults from 'services/server/graphql/mutations/updateCodeSubmissionResults';
import { executeCodeSubmission, mapLanguageToId } from 'services/server/coderunner';
import specs from 'content/runnerSpecs.gen';
import lessonLanguages from 'content/lessonLanguages.gen';
import { buildProgram } from 'services/server/runner/program';
import { checkRunLimits, clientIp, ipHash } from 'services/server/runner/runLimits';
import { specHash, startRun } from 'services/server/runner/submit';
import { isRequestFromThisMachine } from 'services/server/runner/backends/system';
import { getHasLessonAccess } from 'utils/client/lesson';
import { CodingLanguage } from 'utils/constants/lesson';
import {
  getRunnerBackend,
  runnableLanguages,
  unavailableMessage,
  usesNewRunner,
} from 'utils/shared/runner/settings';
import {
  ExecutionStatus,
  validatorForLanguage,
  fileHeaderForLanguage,
} from 'utils/constants/codeRunner';
import { HttpMethods } from 'utils/constants/http';
import { createErrorObject } from 'utils/server/http';
import Sentry, { configureReq } from 'utils/shared/sentry';
import { applySecurityHeaders } from 'services/server/security/headers';

interface PostBody {
  code: string;
  tests: string;
  language: CodingLanguage;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  applySecurityHeaders(res);
  configureReq(req);

  const { method, body } = req;

  switch (method) {
    case HttpMethods.Post: {
      try {
        // The system runner runs code on this machine with no sandbox, so
        // only a browser on this machine may ask it to (D14)
        if (getRunnerBackend() === 'system' && !isRequestFromThisMachine(req)) {
          return res.status(403).send(
            createErrorObject({
              message:
                "This app runs code with this machine's own Node.js and Python (CODE_RUNNER=system), so only a browser on this machine can run it",
              statusCode: 403,
            }),
          );
        }

        const payload = body as PostBody;
        const { code = '', tests = '', language } = payload;

        if (!Object.values(CodingLanguage).includes(language)) {
          return res.status(400).send(
            createErrorObject({
              message: 'Did not contain a valid programming language',
              statusCode: 400,
            }),
          );
        }

        const { id } = req.query;

        if (typeof id !== 'string' || !id) {
          return res.status(400).send(
            createErrorObject({
              message: 'Did not contain a valid lesson',
              statusCode: 400,
            }),
          );
        }

        const [viewer, lesson] = await Promise.all([getViewerById(req), getLessonForRunner(id)]);

        if (!lesson) {
          return res
            .status(404)
            .send(createErrorObject({ message: 'Lesson not found', statusCode: 404 }));
        }

        // How often each learner may run code (D2). If counting fails, the
        // run goes ahead: a database hiccup mustn't stop everyone's code.
        const runnerIpHash = ipHash(clientIp(req));
        const limitReached = await checkRunLimits({
          userId: viewer?.id,
          ipHash: runnerIpHash,
        }).catch((error) => {
          Sentry.withScope((scope) => {
            scope.setTag('reason', 'could-not-check-run-limits');
            Sentry.captureException(error);
          });
          return null;
        });

        if (limitReached) {
          res.setHeader('Retry-After', String(limitReached.retryAfterSeconds));
          return res
            .status(429)
            .send(createErrorObject({ message: limitReached.message, statusCode: 429 }));
        }

        const spec = Object.prototype.hasOwnProperty.call(specs, lesson.slug)
          ? specs[lesson.slug]
          : null;

        // The new runner: the tests live on the server, so the client's are ignored
        if (spec && usesNewRunner(lesson.slug, true)) {
          // The results include each test's expected answer
          if (!getHasLessonAccess(lesson, viewer)) {
            return res.status(403).send(
              createErrorObject({
                message: viewer
                  ? 'Upgrade to run code for this lesson'
                  : 'Log in to run code for this lesson',
                statusCode: 403,
              }),
            );
          }

          if (!runnableLanguages(lessonLanguages[lesson.slug] || []).includes(language)) {
            return res.status(400).send(
              createErrorObject({
                message: unavailableMessage(language).replace(/\.$/, ''),
                statusCode: 400,
              }),
            );
          }

          const built = buildProgram(spec, language, code);

          if (!built.ok) {
            return res
              .status(400)
              .send(createErrorObject({ message: built.errors[0], statusCode: 400 }));
          }

          const inserted = await insertNewCodeSubmission({
            lessonId: id,
            userId: viewer?.id,
            language,
            code,
            tests: specHash(spec),
            validator: built.program.runtime.version,
            runnerVersion: built.program.runtime.version,
            executionStatus: ExecutionStatus.Executing,
            ipHash: runnerIpHash,
            // Where it runs: SERVICE, DOCKER, SYSTEM or JUDGE0
            environment: getRunnerBackend().toUpperCase(),
          });
          const runId = inserted.insert_code_submissions?.returning[0]?.id;

          if (!runId) {
            throw new Error('The code submission was not saved');
          }

          let token;

          try {
            token = await startRun(spec, built.program, runId);
          } catch (error) {
            await updateCodeSubmissionResults({
              id: runId,
              executionStatus: ExecutionStatus.Error,
            }).catch(() => undefined);
            throw error;
          }

          await setSubmissionToken({ id: runId, codeRunnerToken: token });

          return res.status(200).json({ token });
        }

        // The old runner, which only knows JavaScript, TypeScript and Python
        if (!mapLanguageToId[language] || !validatorForLanguage[language]) {
          return res.status(400).send(
            createErrorObject({
              message: 'Did not contain a valid programming language',
              statusCode: 400,
            }),
          );
        }

        const validator = validatorForLanguage[language];
        const fileHeader = fileHeaderForLanguage[language] || '';
        const codeToRun = `${fileHeader}${code}\n${tests}\n${validator}`;

        const insertResponse = await insertNewCodeSubmission({
          lessonId: id,
          userId: viewer?.id,
          language,
          code,
          tests,
          validator,
          executionStatus: ExecutionStatus.Executing,
          ipHash: runnerIpHash,
          environment: 'JUDGE0',
        });
        const submissionId = insertResponse.insert_code_submissions?.returning[0]?.id;

        if (!submissionId) {
          throw new Error('The code submission was not saved');
        }

        let result;

        try {
          result = await executeCodeSubmission(codeToRun, language, submissionId);
        } catch (error) {
          // Judge0 never got the code, so no result will ever arrive for this row
          await updateCodeSubmissionResults({
            id: submissionId,
            executionStatus: ExecutionStatus.Error,
          }).catch(() => undefined);
          throw error;
        }

        await setSubmissionToken({ id: submissionId, codeRunnerToken: result.token });

        return res.status(200).json(result);
      } catch (error) {
        Sentry.withScope((_scope) => {
          Sentry.captureException(error);
        });

        console.log('--- ERROR = ', error);
        return res.status(500).send(
          createErrorObject({
            message: 'There was an error submitting your code',
            statusCode: 500,
          }),
        );
      }
    }
    case HttpMethods.Get: {
      try {
        // GET A USERS LIST OF SUBMISSIONS

        // const viewer = await getViewerById(req);

        // GET A VIEWERS SUBMISSIONS BY LESSON?
        // THIS CAN ALL BE DONE IN GRAPHQL!!!!
        // probably don't need this...

        return res.status(200).json({ success: true });
      } catch (error) {
        Sentry.withScope((_scope) => {
          Sentry.captureException(error);
        });

        console.log('--- ERROR = ', error);
        return res.status(500).send(
          createErrorObject({
            message: 'There was an error submitting your code',
            statusCode: 500,
          }),
        );
      }
    }
    default:
      res.setHeader('Allow', [HttpMethods.Post, HttpMethods.Get]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default handler;
