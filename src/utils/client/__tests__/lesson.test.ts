import { LessonAccessLevel } from 'utils/constants/lesson';
import { EMPTY_LINK_PROPS } from 'utils/constants/http';

/**
 * `utils/client/lesson` is the client-side paywall. Its behaviour is gated by three
 * compile-time flags in `utils/constants/payments`:
 *
 *   TEST_SHOW_ALL_CONTENT = false
 *   IS_FULL_COURSE_FREE   = true
 *   IS_LIFETIME_ACCESS    = true
 *
 * and by OPEN_ALL_LESSONS, which the OPEN_ALL_LESSONS env var turns on outside the
 * website (it's off there).
 *
 * With the flags at their current values, `getHasSubscription` short-circuits to `true`
 * for any signed-in viewer, so the date logic underneath it is unreachable. To keep the
 * tests meaningful (and to protect the code that runs the day the course stops being
 * free), the flags module is re-mocked per scenario and the module under test is
 * re-required. Every flag combination is covered, including the real one.
 */

type PaymentFlags = {
  TEST_SHOW_ALL_CONTENT?: boolean;
  IS_FULL_COURSE_FREE?: boolean;
  IS_LIFETIME_ACCESS?: boolean;
  OPEN_ALL_LESSONS?: boolean;
};

type LessonModule = typeof import('utils/client/lesson');

const moduleCache = new Map<string, LessonModule>();

const loadLessonUtils = (flags: PaymentFlags = {}): LessonModule => {
  const key = JSON.stringify(flags);
  const cached = moduleCache.get(key);

  if (cached) {
    return cached;
  }

  jest.resetModules();
  jest.doMock('utils/constants/payments', () => ({
    ...jest.requireActual('utils/constants/payments'),
    ...flags,
  }));

  const loaded: LessonModule = require('utils/client/lesson');
  moduleCache.set(key, loaded);

  return loaded;
};

/**
 * The flags as they are actually committed today, on the website: there
 * OPEN_ALL_LESSONS is unset, whatever the shell running these tests has.
 */
const SHIPPED_FLAGS: PaymentFlags = { OPEN_ALL_LESSONS: false };
/** What the module must do once the course is paid again. */
const PAID_FLAGS: PaymentFlags = {
  TEST_SHOW_ALL_CONTENT: false,
  IS_FULL_COURSE_FREE: false,
  IS_LIFETIME_ACCESS: false,
  OPEN_ALL_LESSONS: false,
};

const NOW = Date.UTC(2023, 0, 25, 12, 0, 0);
const PAST = new Date(NOW - 60_000).toISOString();
const FUTURE = new Date(NOW + 60_000).toISOString();
const EXACTLY_NOW = new Date(NOW).toISOString();

const freeLesson = { accessLevel: LessonAccessLevel.Free } as any;
const trialLesson = { accessLevel: LessonAccessLevel.Trial } as any;
const paidLesson = { accessLevel: LessonAccessLevel.Subscription } as any;

beforeEach(() => {
  jest.spyOn(Date, 'now').mockReturnValue(NOW);
});

afterEach(() => {
  jest.restoreAllMocks();
  jest.dontMock('utils/constants/payments');
  jest.resetModules();
});

describe('isInsideDateRange', () => {
  it('is true only for instants strictly in the future', () => {
    const { isInsideDateRange } = loadLessonUtils();

    expect(isInsideDateRange(FUTURE)).toBe(true);
    expect(isInsideDateRange(new Date(NOW + 1).toISOString())).toBe(true);
    expect(isInsideDateRange(PAST)).toBe(false);
  });

  it('treats an expiry that lands exactly on "now" as already expired', () => {
    const { isInsideDateRange } = loadLessonUtils();

    // Strict `<`, so the boundary millisecond is outside the range.
    expect(isInsideDateRange(EXACTLY_NOW)).toBe(false);
  });

  it('fails closed on garbage, empty and null-ish date input', () => {
    const { isInsideDateRange } = loadLessonUtils();

    // `new Date('...').getTime()` is NaN and every comparison with NaN is false,
    // so an unparseable expiry denies access rather than granting it.
    expect(isInsideDateRange('not-a-date')).toBe(false);
    expect(isInsideDateRange('')).toBe(false);
    expect(isInsideDateRange('9999-99-99')).toBe(false);
    expect(isInsideDateRange(undefined as any)).toBe(false);
    expect(isInsideDateRange(null as any)).toBe(false);
  });
});

describe('getHasSubscription', () => {
  describe('with the flags as shipped (IS_FULL_COURSE_FREE = true)', () => {
    it('still denies access to an anonymous visitor', () => {
      const { getHasSubscription } = loadLessonUtils(SHIPPED_FLAGS);

      // "Free course" means free *for accounts*, not for logged-out traffic.
      expect(getHasSubscription(undefined)).toBe(false);
      expect(getHasSubscription(null)).toBe(false);
    });

    it('grants access to any signed-in viewer, even one whose access lapsed', () => {
      const { getHasSubscription } = loadLessonUtils(SHIPPED_FLAGS);

      expect(getHasSubscription({})).toBe(true);
      expect(getHasSubscription({ fullCourseAccessEndsAt: null })).toBe(true);
      expect(getHasSubscription({ fullCourseAccessEndsAt: PAST })).toBe(true);
    });
  });

  describe('with the course paid (all flags false)', () => {
    it('denies anonymous visitors and viewers that never purchased', () => {
      const { getHasSubscription } = loadLessonUtils(PAID_FLAGS);

      expect(getHasSubscription(undefined)).toBe(false);
      expect(getHasSubscription(null)).toBe(false);
      expect(getHasSubscription({})).toBe(false);
      expect(getHasSubscription({ fullCourseAccessEndsAt: null })).toBe(false);
      expect(getHasSubscription({ fullCourseAccessEndsAt: undefined })).toBe(false);
      expect(getHasSubscription({ fullCourseAccessEndsAt: '' })).toBe(false);
    });

    it('grants access while the subscription window is open and revokes it after', () => {
      const { getHasSubscription } = loadLessonUtils(PAID_FLAGS);

      expect(getHasSubscription({ fullCourseAccessEndsAt: FUTURE })).toBe(true);
      expect(getHasSubscription({ fullCourseAccessEndsAt: PAST })).toBe(false);
      // Boundary: the expiry instant itself is already outside the window.
      expect(getHasSubscription({ fullCourseAccessEndsAt: EXACTLY_NOW })).toBe(false);
    });

    it('denies access when the stored expiry is unparseable', () => {
      const { getHasSubscription } = loadLessonUtils(PAID_FLAGS);

      // `new Date('whenever').getTime()` is NaN and every comparison with NaN is false,
      // so corrupt data denies access rather than granting it.
      expect(getHasSubscription({ fullCourseAccessEndsAt: 'whenever' })).toBe(false);
      expect(getHasSubscription({ fullCourseAccessEndsAt: '9999-99-99' })).toBe(false);
      // `'0'` is *not* unparseable -- V8 reads it as the year 2000 -- but it is in the
      // past, so it is denied for a different reason. Kept to document the distinction.
      expect(getHasSubscription({ fullCourseAccessEndsAt: '0' })).toBe(false);
    });
  });

  describe('with IS_LIFETIME_ACCESS on but the course no longer free', () => {
    const LIFETIME_ONLY: PaymentFlags = {
      TEST_SHOW_ALL_CONTENT: false,
      IS_FULL_COURSE_FREE: false,
      IS_LIFETIME_ACCESS: true,
    };

    it('grandfathers a lapsed purchaser but not a viewer who never purchased', () => {
      const { getHasSubscription } = loadLessonUtils(LIFETIME_ONLY);

      // Lifetime access is keyed off `fullCourseAccessEndsAt` merely being set.
      expect(getHasSubscription({ fullCourseAccessEndsAt: PAST })).toBe(true);
      expect(getHasSubscription({ fullCourseAccessEndsAt: EXACTLY_NOW })).toBe(true);
      expect(getHasSubscription({})).toBe(false);
      expect(getHasSubscription({ fullCourseAccessEndsAt: null })).toBe(false);
      expect(getHasSubscription(undefined)).toBe(false);
    });

    it('still grandfathers a purchaser whose stored expiry is corrupt', () => {
      const { getHasSubscription } = loadLessonUtils(LIFETIME_ONLY);

      // BUG (by design, but worth knowing): with lifetime access on, the date is never
      // validated -- any truthy string in `fullCourseAccessEndsAt` unlocks the course.
      expect(getHasSubscription({ fullCourseAccessEndsAt: 'not-a-date' })).toBe(true);
    });
  });

  describe('with TEST_SHOW_ALL_CONTENT on', () => {
    it('unlocks everything for anonymous visitors', () => {
      const { getHasSubscription } = loadLessonUtils({
        TEST_SHOW_ALL_CONTENT: true,
        IS_FULL_COURSE_FREE: false,
        IS_LIFETIME_ACCESS: false,
      });

      // This flag is a development escape hatch that completely disables the paywall.
      // It must stay `false` in the committed source (asserted below).
      expect(getHasSubscription(undefined)).toBe(true);
    });
  });
});

describe('payments flags as committed', () => {
  it('keeps the paywall-disabling test flag off', () => {
    const payments = jest.requireActual('utils/constants/payments');

    expect(payments.TEST_SHOW_ALL_CONTENT).toBe(false);
  });

  describe('OPEN_ALL_LESSONS', () => {
    const original = process.env.OPEN_ALL_LESSONS;

    const loadWith = (value: string | undefined) => {
      if (value === undefined) {
        delete process.env.OPEN_ALL_LESSONS;
      } else {
        process.env.OPEN_ALL_LESSONS = value;
      }

      let payments: any;

      jest.isolateModules(() => {
        payments = jest.requireActual('utils/constants/payments');
      });
      return payments.OPEN_ALL_LESSONS;
    };

    afterEach(() => {
      if (original === undefined) {
        delete process.env.OPEN_ALL_LESSONS;
      } else {
        process.env.OPEN_ALL_LESSONS = original;
      }
    });

    it('is on only when the env var is exactly "true"', () => {
      expect(loadWith('true')).toBe(true);
      expect(loadWith(undefined)).toBe(false);
      expect(loadWith('')).toBe(false);
      expect(loadWith('false')).toBe(false);
      expect(loadWith('TRUE')).toBe(false);
    });
  });
});

describe('getHasLessonAccess', () => {
  describe('with the flags as shipped', () => {
    it('lets anonymous visitors read FREE lessons only', () => {
      const { getHasLessonAccess } = loadLessonUtils(SHIPPED_FLAGS);

      expect(getHasLessonAccess(freeLesson, undefined)).toBe(true);
      expect(getHasLessonAccess(trialLesson, undefined)).toBe(false);
      expect(getHasLessonAccess(paidLesson, undefined)).toBe(false);
      expect(getHasLessonAccess(paidLesson, null)).toBe(false);
    });

    it('unlocks TRIAL and SUBSCRIPTION lessons for any signed-in viewer', () => {
      const { getHasLessonAccess } = loadLessonUtils(SHIPPED_FLAGS);

      expect(getHasLessonAccess(trialLesson, {})).toBe(true);
      expect(getHasLessonAccess(paidLesson, {})).toBe(true);
    });

    it('denies access when the lesson is missing, regardless of the viewer', () => {
      const { getHasLessonAccess } = loadLessonUtils(SHIPPED_FLAGS);

      expect(getHasLessonAccess(undefined, { fullCourseAccessEndsAt: FUTURE })).toBe(false);
      expect(getHasLessonAccess(null, { fullCourseAccessEndsAt: FUTURE })).toBe(false);
    });

    it('denies access for an unrecognised access level', () => {
      const { getHasLessonAccess } = loadLessonUtils(SHIPPED_FLAGS);

      // An anonymous visitor must not fall through to "allowed" on unknown data.
      expect(getHasLessonAccess({ accessLevel: 'SOMETHING_NEW' } as any, undefined)).toBe(false);
      expect(getHasLessonAccess({ accessLevel: null } as any, undefined)).toBe(false);
      expect(getHasLessonAccess({} as any, undefined)).toBe(false);
    });
  });

  describe('with the course paid (all flags false)', () => {
    it('gates SUBSCRIPTION lessons on an unexpired subscription', () => {
      const { getHasLessonAccess } = loadLessonUtils(PAID_FLAGS);

      expect(getHasLessonAccess(paidLesson, { fullCourseAccessEndsAt: FUTURE })).toBe(true);
      expect(getHasLessonAccess(paidLesson, { fullCourseAccessEndsAt: PAST })).toBe(false);
      expect(getHasLessonAccess(paidLesson, { fullCourseAccessEndsAt: EXACTLY_NOW })).toBe(false);
      expect(getHasLessonAccess(paidLesson, {})).toBe(false);
    });

    it('keeps FREE lessons public and TRIAL lessons account-only', () => {
      const { getHasLessonAccess } = loadLessonUtils(PAID_FLAGS);

      expect(getHasLessonAccess(freeLesson, undefined)).toBe(true);
      expect(getHasLessonAccess(freeLesson, { fullCourseAccessEndsAt: PAST })).toBe(true);
      expect(getHasLessonAccess(trialLesson, undefined)).toBe(false);
      expect(getHasLessonAccess(trialLesson, { fullCourseAccessEndsAt: PAST })).toBe(true);
    });
  });

  describe('with OPEN_ALL_LESSONS on', () => {
    it('opens every lesson to anonymous visitors, even with the course paid', () => {
      const { getHasLessonAccess } = loadLessonUtils({ ...PAID_FLAGS, OPEN_ALL_LESSONS: true });

      expect(getHasLessonAccess(freeLesson, undefined)).toBe(true);
      expect(getHasLessonAccess(trialLesson, undefined)).toBe(true);
      expect(getHasLessonAccess(paidLesson, null)).toBe(true);
      expect(getHasLessonAccess(paidLesson, { fullCourseAccessEndsAt: PAST })).toBe(true);
    });

    it("doesn't count as a subscription, so the pricing page doesn't claim one", () => {
      const { getHasSubscription } = loadLessonUtils({ ...PAID_FLAGS, OPEN_ALL_LESSONS: true });

      expect(getHasSubscription(undefined)).toBe(false);
      expect(getHasSubscription({ fullCourseAccessEndsAt: PAST })).toBe(false);
    });
  });

  describe('with TEST_SHOW_ALL_CONTENT on', () => {
    it('returns true even for a missing lesson and no viewer', () => {
      const { getHasLessonAccess } = loadLessonUtils({
        TEST_SHOW_ALL_CONTENT: true,
        IS_FULL_COURSE_FREE: false,
        IS_LIFETIME_ACCESS: false,
      });

      expect(getHasLessonAccess(undefined, undefined)).toBe(true);
    });
  });
});

describe('findLessonBySlug', () => {
  const lessons = [
    { slug: 'a', title: 'Lesson A' },
    { slug: 'b', title: 'Lesson B' },
    { slug: 'c', title: 'Lesson C' },
  ] as any;

  it('returns the lesson and its index', () => {
    const { findLessonBySlug } = loadLessonUtils();

    expect(findLessonBySlug(lessons, 'b')).toEqual({ lesson: lessons[1], index: 1 });
    expect(findLessonBySlug(lessons, 'a').index).toBe(0);
  });

  it('reports a miss with index -1 rather than defaulting to the first lesson', () => {
    const { findLessonBySlug } = loadLessonUtils();

    expect(findLessonBySlug(lessons, 'nope')).toEqual({ lesson: null, index: -1 });
    expect(findLessonBySlug([], 'a')).toEqual({ lesson: null, index: -1 });
    expect(findLessonBySlug(undefined, 'a')).toEqual({ lesson: null, index: -1 });
  });

  it('does not match a real lesson when the requested slug is undefined', () => {
    const { findLessonBySlug } = loadLessonUtils();

    expect(findLessonBySlug(lessons, undefined as any).index).toBe(-1);
  });

  it('matches a slug-less lesson when the requested slug is undefined', () => {
    const { findLessonBySlug } = loadLessonUtils();

    // BUG: the comparison is a bare `lesson.slug === slug`, so `undefined === undefined`
    // is a hit. A caller that passes a missing router query param (e.g. `/course/[slug]`
    // before hydration) against data containing a lesson with no slug silently resolves
    // to that lesson instead of reporting "not found". It should require a defined slug.
    // Asserting current behaviour so the suite stays green -- see bugs_found.
    expect(findLessonBySlug([{ title: 'No slug' }] as any, undefined as any)).toEqual({
      lesson: { title: 'No slug' },
      index: 0,
    });
  });
});

describe('findNextLessonUrl / findPreviousLessonUrl', () => {
  const lessons = [
    { slug: 'a', title: 'Lesson A' },
    { slug: 'b', title: 'Lesson B' },
    { slug: 'c', title: 'Lesson C' },
  ] as any;

  it('links to the neighbouring lesson with its title', () => {
    const { findNextLessonUrl, findPreviousLessonUrl } = loadLessonUtils();

    expect(findNextLessonUrl({ lessons }, 'b')).toEqual({
      href: '/course/c',
      text: 'Lesson C',
    });
    expect(findPreviousLessonUrl({ lessons }, 'b')).toEqual({
      href: '/course/a',
      text: 'Lesson A',
    });
  });

  it('sends the last lesson to the course-complete page', () => {
    const { findNextLessonUrl } = loadLessonUtils();

    expect(findNextLessonUrl({ lessons }, 'c')).toEqual({
      href: '/course?course_status=complete',
      text: 'Course Complete',
    });
  });

  it('returns an empty link before the first lesson', () => {
    const { findPreviousLessonUrl } = loadLessonUtils();

    expect(findPreviousLessonUrl({ lessons }, 'a')).toEqual(EMPTY_LINK_PROPS);
  });

  it('returns an empty link for an unknown slug instead of claiming the course is complete', () => {
    const { findNextLessonUrl, findPreviousLessonUrl } = loadLessonUtils();

    expect(findNextLessonUrl({ lessons }, 'missing')).toEqual(EMPTY_LINK_PROPS);
    expect(findPreviousLessonUrl({ lessons }, 'missing')).toEqual(EMPTY_LINK_PROPS);
  });

  it('tolerates a query result with no lessons field', () => {
    const { findNextLessonUrl, findPreviousLessonUrl } = loadLessonUtils();

    expect(findNextLessonUrl({} as any, 'a')).toEqual(EMPTY_LINK_PROPS);
    expect(findPreviousLessonUrl({} as any, 'a')).toEqual(EMPTY_LINK_PROPS);
  });

  it('does not mutate the lessons it is given', () => {
    const { findNextLessonUrl, findPreviousLessonUrl } = loadLessonUtils();
    // A shallow copy shares the lesson objects with `lessons`, so an in-place edit would
    // show up on both sides of the comparison. Snapshot by value instead.
    const input = JSON.parse(JSON.stringify(lessons));
    const before = JSON.parse(JSON.stringify(lessons));

    findNextLessonUrl({ lessons: input }, 'b');
    findPreviousLessonUrl({ lessons: input }, 'b');
    findNextLessonUrl({ lessons: input }, 'c');

    expect(input).toEqual(before);
  });

  it('treats a mid-course lesson with no slug as the end of the course', () => {
    const { findNextLessonUrl, findPreviousLessonUrl } = loadLessonUtils();
    const withGap = [
      { slug: 'a', title: 'Lesson A' },
      { title: 'Draft, not published yet' },
      { slug: 'c', title: 'Lesson C' },
    ] as any;

    // TRAP: `urlFromSlug` only checks the neighbour's slug, never whether a neighbour
    // exists, so an unpublished lesson in the middle of the list tells the reader the
    // course is complete instead of skipping to the next publishable lesson.
    expect(findNextLessonUrl({ lessons: withGap }, 'a')).toEqual({
      href: '/course?course_status=complete',
      text: 'Course Complete',
    });
    // The previous-link default is the empty link, so the same gap silently removes the
    // back button rather than mislabelling it.
    expect(findPreviousLessonUrl({ lessons: withGap }, 'c')).toEqual(EMPTY_LINK_PROPS);
  });

  it('navigates from the first lesson when two share a slug', () => {
    const { findNextLessonUrl } = loadLessonUtils();
    const duplicated = [
      { slug: 'dupe', title: 'First copy' },
      { slug: 'b', title: 'Lesson B' },
      { slug: 'dupe', title: 'Second copy' },
      { slug: 'd', title: 'Lesson D' },
    ] as any;

    // `findLessonBySlug` returns the earliest match, so a duplicated slug makes the
    // later copy unreachable by "next" rather than producing two different destinations.
    expect(findNextLessonUrl({ lessons: duplicated }, 'dupe')).toEqual({
      href: '/course/b',
      text: 'Lesson B',
    });
  });
});
