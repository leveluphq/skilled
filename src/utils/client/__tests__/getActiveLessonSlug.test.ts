/**
 * `getActiveLessonSlug` builds the "resume where you left off" link. It is paywalled:
 * the link is only produced for a viewer that `getHasSubscription` approves, so a lapsed
 * viewer is never handed a deep link into paid content.
 *
 * The payments flags currently short-circuit `getHasSubscription` to `true` for any
 * signed-in viewer, so the lapsed-viewer case is exercised with the flags re-mocked.
 */

// This file defers its imports so setup can run first, leaving it without a
// top-level import/export. Mark it as a module for isolatedModules.
export {};


type Module = typeof import('utils/client/getActiveLessonSlug').default;

type PaymentFlags = {
  TEST_SHOW_ALL_CONTENT?: boolean;
  IS_FULL_COURSE_FREE?: boolean;
  IS_LIFETIME_ACCESS?: boolean;
};

const cache = new Map<string, Module>();

const load = (flags: PaymentFlags = {}): Module => {
  const key = JSON.stringify(flags);
  const cached = cache.get(key);

  if (cached) {
    return cached;
  }

  jest.resetModules();
  jest.doMock('utils/constants/payments', () => ({
    ...jest.requireActual('utils/constants/payments'),
    ...flags,
  }));

  const loaded: Module = require('utils/client/getActiveLessonSlug').default;
  cache.set(key, loaded);

  return loaded;
};

const PAID_FLAGS: PaymentFlags = {
  TEST_SHOW_ALL_CONTENT: false,
  IS_FULL_COURSE_FREE: false,
  IS_LIFETIME_ACCESS: false,
};

const EMPTY_SLUG = { href: '' };

afterEach(() => {
  jest.restoreAllMocks();
});

describe('getActiveLessonSlug', () => {
  it('returns an empty href for an anonymous visitor', () => {
    const getActiveLessonSlug = load();

    expect(getActiveLessonSlug(undefined)).toEqual(EMPTY_SLUG);
  });

  it('builds a course URL from the viewer active lesson', () => {
    const getActiveLessonSlug = load();

    expect(
      getActiveLessonSlug({ activeLesson: { slug: 'big-o-notation' } } as any),
    ).toEqual({ href: '/course/big-o-notation' });
  });

  it('returns an empty href when the viewer has no active lesson yet', () => {
    const getActiveLessonSlug = load();

    expect(getActiveLessonSlug({} as any)).toEqual(EMPTY_SLUG);
    expect(getActiveLessonSlug({ activeLesson: null } as any)).toEqual(EMPTY_SLUG);
    expect(getActiveLessonSlug({ activeLesson: { slug: null } } as any)).toEqual(EMPTY_SLUG);
    expect(getActiveLessonSlug({ activeLesson: { slug: '' } } as any)).toEqual(EMPTY_SLUG);
  });

  it('withholds the resume link from a viewer whose access has expired', () => {
    const getActiveLessonSlug = load(PAID_FLAGS);
    const expired = {
      fullCourseAccessEndsAt: new Date(Date.now() - 60_000).toISOString(),
      activeLesson: { slug: 'big-o-notation' },
    } as any;

    expect(getActiveLessonSlug(expired)).toEqual(EMPTY_SLUG);
  });

  it('gives the resume link to a viewer with an unexpired subscription', () => {
    const getActiveLessonSlug = load(PAID_FLAGS);
    const active = {
      fullCourseAccessEndsAt: new Date(Date.now() + 60_000).toISOString(),
      activeLesson: { slug: 'big-o-notation' },
    } as any;

    expect(getActiveLessonSlug(active)).toEqual({ href: '/course/big-o-notation' });
  });
});
