/**
 * GET /api/v1/lessons/[id]/solutionVideoUrl
 *
 * This is the paywalled resource: the solution video URL is the thing a paying
 * customer is paying for, so the interesting question for every case below is
 * "did the URL end up in the response body or not".
 *
 * Only the two GraphQL query modules are mocked - the access rules
 * (`getHasLessonAccess`) run for real, because they are what is under test.
 */

import { createMocks, RequestMethod } from 'node-mocks-http';
import { NextApiRequest, NextApiResponse } from 'next';
import { LessonAccessLevel } from 'utils/constants/lesson';

const mockPaymentFlags = { openAllLessons: false };

jest.mock('utils/constants/payments', () => {
  const actual = jest.requireActual('utils/constants/payments');
  return Object.defineProperty({ ...actual, __esModule: true }, 'OPEN_ALL_LESSONS', {
    get: () => mockPaymentFlags.openAllLessons,
  });
});
jest.mock('services/server/graphql/queries/getViewerById', () => jest.fn());
jest.mock('services/server/graphql/queries/getLessonVideoIdById', () => jest.fn());

import getViewerById from 'services/server/graphql/queries/getViewerById';
import getLessonVideoIdById from 'services/server/graphql/queries/getLessonVideoIdById';
import handler from 'pages/api/v1/lessons/[id]/solutionVideoUrl';

const mockGetViewerById = getViewerById as unknown as jest.Mock;
const mockGetLessonVideoIdById = getLessonVideoIdById as unknown as jest.Mock;

const SOLUTION_VIDEO_URL = 'https://videos.skilled.dev/paid-solution.mp4';

const buildLesson = (accessLevel: LessonAccessLevel) => ({
  id: 'lesson-1',
  accessLevel,
  solutionVideoUrl: SOLUTION_VIDEO_URL,
});

const ANONYMOUS = null;
const LOGGED_IN_NO_SUBSCRIPTION = {
  id: 'user-1',
  email: 'free@example.com',
  fullCourseAccessEndsAt: null,
};
const LOGGED_IN_EXPIRED_SUBSCRIPTION = {
  id: 'user-2',
  email: 'expired@example.com',
  // Expired two years ago.
  fullCourseAccessEndsAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 730).toISOString(),
};

const callHandler = async ({
  method = 'GET' as RequestMethod,
  id = 'lesson-1' as string | string[] | undefined,
} = {}) => {
  const { req, res } = createMocks({ method, query: { id }, url: '/api/v1/lessons/lesson-1/solutionVideoUrl' });
  await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);
  return res;
};

beforeEach(() => {
  jest.clearAllMocks();
  mockPaymentFlags.openAllLessons = false;
  mockGetViewerById.mockResolvedValue(ANONYMOUS);
  mockGetLessonVideoIdById.mockResolvedValue(buildLesson(LessonAccessLevel.Subscription));
});

describe('GET /api/v1/lessons/[id]/solutionVideoUrl', () => {
  describe('method handling', () => {
    it.each(['POST', 'PUT', 'DELETE', 'PATCH'] as RequestMethod[])(
      'rejects %s with 405 before touching the database',
      async (method) => {
        const res = await callHandler({ method });

        expect(res._getStatusCode()).toBe(405);
        expect(res.getHeader('Allow')).toEqual(['GET']);
        expect(res._getData()).toBe(`Method ${method} Not Allowed`);
        expect(mockGetLessonVideoIdById).not.toHaveBeenCalled();
        expect(mockGetViewerById).not.toHaveBeenCalled();
      },
    );

    it('applies security headers even on the rejected-method path', async () => {
      const res = await callHandler({ method: 'POST' });

      expect(res.getHeader('X-Frame-Options')).toBe('DENY');
      expect(res.getHeader('X-Content-Type-Options')).toBe('nosniff');
    });
  });

  describe('missing lesson', () => {
    it('404s when the lesson does not exist', async () => {
      mockGetLessonVideoIdById.mockResolvedValue(null);

      const res = await callHandler();

      expect(res._getStatusCode()).toBe(404);
      // NOTE: the message reads "Lesson now found" in the source; asserted as-is
      // so this test does not silently pass on a rewritten payload.
      expect(res._getData()).toEqual({ message: 'Lesson now found', statusCode: 404 });
    });
  });

  describe('unauthenticated caller', () => {
    it('withholds the video URL for a subscription lesson', async () => {
      const res = await callHandler();

      // BUG: an unauthorised request answers 200 rather than 401/403. The URL
      // itself is correctly withheld, so this is a contract wart rather than a
      // disclosure: clients cannot distinguish "locked" from "no video" by
      // status code, and the commented-out 401 on line 42 of the route shows
      // the 200 is deliberate. Asserting current behaviour.
      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual({
        solutionVideoUrl: null,
        reason: 'UPGRADE_REQUIRED',
      });
      expect(JSON.stringify(res._getJSONData())).not.toContain(SOLUTION_VIDEO_URL);
    });

    it('withholds the video URL for a TRIAL lesson (trial requires an account)', async () => {
      mockGetLessonVideoIdById.mockResolvedValue(buildLesson(LessonAccessLevel.Trial));

      const res = await callHandler();

      expect(res._getJSONData()).toEqual({
        solutionVideoUrl: null,
        reason: 'UPGRADE_REQUIRED',
      });
    });

    it('returns the video URL for a FREE lesson', async () => {
      mockGetLessonVideoIdById.mockResolvedValue(buildLesson(LessonAccessLevel.Free));

      const res = await callHandler();

      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual({ solutionVideoUrl: SOLUTION_VIDEO_URL });
    });

    it('returns the video URL for any lesson when every lesson is open (OPEN_ALL_LESSONS)', async () => {
      mockPaymentFlags.openAllLessons = true;

      const res = await callHandler();

      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual({ solutionVideoUrl: SOLUTION_VIDEO_URL });
    });
  });

  describe('authenticated non-subscriber', () => {
    it('unlocks a TRIAL lesson once the caller has an account', async () => {
      // The other half of the TRIAL rule: `isFreeForUsers` in
      // utils/client/lesson.ts is `!!viewer && accessLevel === TRIAL`, so the
      // anonymous case above and this one have to move together. Without this,
      // a regression that made `getHasLessonAccess` return false for every
      // TRIAL lesson would still pass the anonymous test.
      mockGetViewerById.mockResolvedValue(LOGGED_IN_NO_SUBSCRIPTION);
      mockGetLessonVideoIdById.mockResolvedValue(buildLesson(LessonAccessLevel.Trial));

      const res = await callHandler();

      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual({ solutionVideoUrl: SOLUTION_VIDEO_URL });
    });

    it('hands the paid video URL to any logged-in user with no subscription', async () => {
      // BUG: the paywall is not enforced for authenticated users. utils/client/lesson
      // -> getAccessForAll() returns true for any signed-in viewer because
      // IS_FULL_COURSE_FREE is hardcoded to `true` in utils/constants/payments.ts,
      // so `fullCourseAccessEndsAt` is never consulted. Creating a free account is
      // enough to unlock every SUBSCRIPTION solution video. If the flag was meant
      // to be a temporary promotion it should be env-driven, not a committed const.
      mockGetViewerById.mockResolvedValue(LOGGED_IN_NO_SUBSCRIPTION);

      const res = await callHandler();

      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual({ solutionVideoUrl: SOLUTION_VIDEO_URL });
    });

    it('hands the paid video URL to a user whose subscription expired years ago', async () => {
      // BUG: same root cause - an expired `fullCourseAccessEndsAt` is ignored
      // entirely while IS_FULL_COURSE_FREE is true.
      mockGetViewerById.mockResolvedValue(LOGGED_IN_EXPIRED_SUBSCRIPTION);

      const res = await callHandler();

      expect(res._getJSONData()).toEqual({ solutionVideoUrl: SOLUTION_VIDEO_URL });
    });
  });

  describe('error handling', () => {
    it('500s without leaking the underlying error when the lesson lookup throws', async () => {
      mockGetLessonVideoIdById.mockRejectedValue(
        new Error('connect ECONNREFUSED 10.0.0.1:8080 x-hasura-admin-secret=super-secret'),
      );

      const res = await callHandler();

      expect(res._getStatusCode()).toBe(500);
      expect(res._getData()).toEqual({ message: 'There was an internal error', statusCode: 500 });
      expect(JSON.stringify(res._getData())).not.toContain('super-secret');
    });

    it('500s when the viewer lookup throws, rather than falling through as anonymous', async () => {
      // A failed auth lookup must not be treated as "no viewer" - that would be a
      // silent downgrade. Here it also must not be treated as access.
      mockGetViewerById.mockRejectedValue(new Error('jwt verification blew up'));

      const res = await callHandler();

      expect(res._getStatusCode()).toBe(500);
      expect(JSON.stringify(res._getData())).not.toContain(SOLUTION_VIDEO_URL);
    });
  });
});
